import {
  adminSessionCookie,
  checkAdminPassword,
  clearAdminSessionCookie,
  createAdminSession,
  requireAdmin,
} from '../../lib/identity.js';
import { type ApiRequest, type ApiResponse, readJsonBody } from '../../lib/http.js';
import { contextFromRequest, track } from '../../lib/track.js';

/**
 * Admin session. Single shared password -> HMAC-signed httpOnly cookie.
 *
 * Proportionate for a solo-operator site with one admin. There is no user table
 * and no session store; the cookie carries its own expiry and signature.
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  // GET = "am I logged in?", used by the dashboard shell on load.
  if (req.method === 'GET') {
    res.status(200).json({ authenticated: requireAdmin(req) });
    return;
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', [clearAdminSessionCookie()]);
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = readJsonBody(req) as { password?: unknown } | null;
  const ctx = contextFromRequest(req, 'admin');

  if (!checkAdminPassword(body?.password)) {
    // NEVER record the attempted password. An attempted login is a security
    // event; its contents are a credential and belong nowhere near the stream.
    await track('admin_login_failed', {}, ctx);
    // Deliberately vague, and no timing difference worth measuring: the password
    // comparison above is constant-time.
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  const token = createAdminSession();
  if (!token) {
    // Fail closed: no signing secret means no valid session can exist, so
    // issuing one would be issuing an unverifiable cookie.
    console.error('[admin] ADMIN_SESSION_SECRET is unset — refusing to issue a session');
    res.status(500).json({ error: 'server_misconfigured' });
    return;
  }

  res.setHeader('Set-Cookie', [adminSessionCookie(token)]);
  await track('admin_login_succeeded', {}, { ...ctx, identity: { ...ctx.identity, actor: 'admin' } });
  res.status(200).json({ ok: true });
}
