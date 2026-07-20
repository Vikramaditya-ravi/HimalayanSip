import type { ApiRequest } from './http.js';

/**
 * Cron authorisation.
 *
 * FAILS CLOSED. If CRON_SECRET is unset, no request is authorised — including
 * Vercel's own. An unset secret is a misconfiguration, and the safe reading of a
 * misconfiguration is "nobody may run this", not "everybody may". The opposite
 * default would leave a publicly-callable endpoint that deletes raw events.
 */
export function authorizeCron(req: ApiRequest): { ok: boolean; reason?: string } {
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false, reason: 'CRON_SECRET is not set — refusing to run' };

  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically.
  const auth = req.headers.authorization;
  const header = Array.isArray(auth) ? auth[0] : auth;
  if (header === `Bearer ${secret}`) return { ok: true };

  // Manual/backfill invocation.
  const q = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret;
  if (q && q === secret) return { ok: true };

  return { ok: false, reason: 'bad or missing cron credentials' };
}
