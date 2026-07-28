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
  // Every route must be listed. This matcher is a literal path list, not a
  // prefix — a route missing from it is served without ever minting `vid`, so a
  // visitor who lands directly on /pricing from search has no identity and every
  // event they generate is attributed to nobody. Both spellings are covered
  // because the extensionless path is what vercel.json rewrites from, and the
  // .html file stays directly reachable.
  matcher: [
    '/', '/index.html',
    '/products', '/products.html',
    '/pricing', '/pricing.html',
    '/process', '/process.html',
    '/about', '/about.html',
    '/contact', '/contact.html',
    '/admin', '/admin.html',
  ],
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
export default function middleware(request) {
  try {
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
