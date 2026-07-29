import { next } from '@vercel/edge';

/**
 * Identity minting. Runs at the edge, before the app loads.
 *
 * The client NEVER sends identity. It cannot read `vid`/`sid` (httpOnly), so it
 * cannot name itself, so it cannot lie about who it is. Every event row gets its
 * visitorId/sessionId stamped server-side from these cookies.
 *
 * Cookies are minted ONLY when missing. Setting a cookie on every response would
 * make every response uncacheable and kill CDN caching of the static site. The
 * session TTL is instead rolled forward from /api/events, which is hit on every
 * page view anyway.
 *
 * NOTE: this receives a standard Web `Request`, NOT a Next.js `NextRequest`.
 * There is no `request.cookies` helper here — that is a Next-only API, and
 * reaching for it throws "Cannot read properties of undefined (reading 'get')"
 * on every request. Cookies must be parsed from the header by hand.
 */

const YEAR = 60 * 60 * 24 * 365;
const SESSION = 60 * 30;

export const config = {
  // Document requests only. Assets must stay cacheable and must not mint identity.
  //
  // This used to be a literal list of every route, both spellings. That was
  // workable for six pages and became a liability the moment the site grew a
  // content directory: ~23 generated pages would each have needed two entries
  // here, and a route missing from the list is served without ever minting
  // `vid` — so a visitor landing on it from search has no identity and every
  // event they generate is attributed to nobody. Silently.
  //
  // The pattern below matches any path that is not under /api and does not
  // contain a dot, which is every document and no asset. New pages are covered
  // the day they are added rather than the day somebody remembers this file.
  matcher: ['/((?!api/)[^.]*)'],
};

function readCookie(request, name) {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    const value = part.slice(idx + 1).trim();
    try {
      return decodeURIComponent(value) || null;
    } catch {
      return value || null;
    }
  }
  return null;
}

function cookie(name, value, maxAge, httpOnly) {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
  ];
  // `vercel dev` serves over plain HTTP; a Secure cookie would be dropped there
  // and identity would silently never persist in local development.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development') {
    parts.push('Secure');
  }
  if (httpOnly) parts.push('HttpOnly');
  return parts.join('; ');
}

/**
 * Sets EXACTLY ONE cookie, deliberately.
 *
 * `Headers.append('set-cookie', ...)` joins repeated values into a single
 * comma-separated header. Clients cannot safely split that (expiry dates contain
 * commas), so only the first cookie survives — verified: minting vid + vid_pub +
 * sid here delivered only `vid`, and the other two were silently dropped.
 *
 * So middleware mints only the long-lived `vid`. The `/api/events` endpoint runs
 * on Node, where `res.setHeader('Set-Cookie', [...])` emits separate headers
 * correctly, and it owns `sid` (rolling) and the `vid_pub` mirror. Nothing is
 * lost: identity is resolved server-side on every event either way, and a
 * visitor who never fires an event has no events to attribute.
 */
/**
 * Bot user-agents, matched at the edge.
 *
 * A deliberately small copy of the pattern in lib/ua.ts rather than an import:
 * this file runs on the edge runtime and must stay dependency-free and tiny, and
 * the authoritative classification happens server-side in /api/crawl anyway —
 * this is only a filter deciding whether the ping is worth making at all. A
 * false positive here costs one discarded request; a false negative costs a
 * crawler visit we never see.
 */
const BOT_UA =
  /bot|crawler|spider|slurp|gptbot|claudebot|claude-web|perplexity|ccbot|anthropic|applebot|bytespider|meta-externalagent|amazonbot|google-extended|chatgpt/i;

/**
 * Records that a crawler fetched a document.
 *
 * Fire-and-forget through `waitUntil`, so the response is never held up by it —
 * a slow analytics write must not slow down the page a crawler is measuring. If
 * the ping fails the page is served exactly as before; we simply do not learn
 * about that hit.
 *
 * This exists because crawlers never execute the client tracker, which meant AI
 * crawler traffic — the entire target of the generative-search work — was the
 * one thing the analytics pipeline could not see. See api/crawl.ts.
 */
function pingCrawlLog(request, context) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return;
  const { pathname } = new URL(request.url);
  const body = JSON.stringify({ ua, path: pathname });
  const done = fetch(new URL('/api/crawl', request.url), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }).catch(() => {});
  // context.waitUntil keeps the function alive for the request without blocking
  // the response. Guarded because it is absent in some local runtimes.
  if (typeof context?.waitUntil === 'function') context.waitUntil(done);
}

export default function middleware(request, context) {
  try {
    pingCrawlLog(request, context);

    if (readCookie(request, 'vid')) return next();

    const response = next();
    response.headers.set('set-cookie', cookie('vid', crypto.randomUUID(), YEAR, true));
    return response;
  } catch (err) {
    // Identity is nice to have; serving the page is not optional. A failure here
    // must never take the site down — the ingest endpoint mints as a fallback.
    console.error('[middleware] identity minting failed', err);
    return next();
  }
}
