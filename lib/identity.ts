import crypto from 'node:crypto';
import { type ApiRequest, asUuid, parseCookies, serializeCookie } from './http.js';

/**
 * Identity resolution and admin sessions.
 *
 * The client never sends identity. `visitorId` and `sessionId` come from httpOnly
 * cookies minted in middleware; `actor` is derived from the admin session cookie.
 * Nothing in a request body is ever trusted to say who the requester is.
 */

export const SESSION_MAX_AGE = 60 * 30;
const YEAR = 60 * 60 * 24 * 365;
const ADMIN_MAX_AGE = 60 * 60 * 12;

export type Actor = 'visitor' | 'customer' | 'admin' | 'system';

export interface Identity {
  visitorId: string | null;
  sessionId: string | null;
  actor: Actor;
  actorId: string | null;
  consent: boolean;
}

export function resolveIdentity(req: ApiRequest): Identity {
  const jar = parseCookies(req);
  const isAdmin = verifyAdminSession(jar['admin_session']);
  return {
    visitorId: asUuid(jar['vid']),
    sessionId: asUuid(jar['sid']),
    // Resolved server-side from the signed session cookie. A payload claiming
    // `actor: "admin"` is ignored entirely.
    actor: isAdmin ? 'admin' : 'visitor',
    actorId: isAdmin ? 'admin' : null,
    consent: jar['consent'] === 'granted',
  };
}

/**
 * Roll the session cookie forward. Called from the ingest endpoint rather than
 * middleware, so that middleware can stay a mint-only path and static responses
 * stay cacheable.
 *
 * If the visitor arrived with no `vid` at all (direct API hit, cookies blocked),
 * mint one here so the event is still attributable to a consistent visitor.
 */
export function rollingIdentityCookies(identity: Identity): {
  cookies: string[];
  visitorId: string;
  sessionId: string;
} {
  const cookies: string[] = [];
  let { visitorId, sessionId } = identity;

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    cookies.push(serializeCookie('vid', visitorId, { maxAge: YEAR, httpOnly: true }));
  }
  // Always re-asserted, not just when minting `vid`. Middleware can only emit a
  // single Set-Cookie (see middleware.js), so it mints `vid` alone and this
  // endpoint is the only place the readable mirror gets written. Node emits a
  // Set-Cookie array as separate headers, so several cookies survive here.
  cookies.push(serializeCookie('vid_pub', visitorId, { maxAge: YEAR, httpOnly: false }));
  // Always refreshed: a 30-minute rolling window measured from last activity is
  // what makes a "session" mean anything.
  if (!sessionId) sessionId = crypto.randomUUID();
  cookies.push(serializeCookie('sid', sessionId, { maxAge: SESSION_MAX_AGE, httpOnly: true }));

  return { cookies, visitorId, sessionId };
}

// ---------------------------------------------------------------------------
// Admin session: HMAC-signed cookie. No dependency, no session store.
// ---------------------------------------------------------------------------

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

export function createAdminSession(): string | null {
  const key = secret();
  if (!key) return null;
  const payload = `admin.${Date.now() + ADMIN_MAX_AGE * 1000}`;
  const sig = crypto.createHmac('sha256', key).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  const key = secret();
  // Fail closed: with no signing secret configured there is no such thing as a
  // valid admin session.
  if (!key || !token) return false;

  const idx = token.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = crypto.createHmac('sha256', key).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  const expiry = Number(payload.split('.')[1]);
  return Number.isFinite(expiry) && Date.now() < expiry;
}

export function adminSessionCookie(token: string): string {
  return serializeCookie('admin_session', token, { maxAge: ADMIN_MAX_AGE, httpOnly: true });
}

export function clearAdminSessionCookie(): string {
  return serializeCookie('admin_session', '', { maxAge: 0, httpOnly: true });
}

/** Constant-time password comparison. */
export function checkAdminPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== 'string') return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function requireAdmin(req: ApiRequest): boolean {
  return verifyAdminSession(parseCookies(req)['admin_session']);
}
