import { prisma } from '../lib/db.js';
import { clientIp } from '../lib/geo.js';
import { type ApiRequest, type ApiResponse, readJsonBody } from '../lib/http.js';
import { resolveIdentity, rollingIdentityCookies } from '../lib/identity.js';
import { rateLimit } from '../lib/ratelimit.js';
import { firstTouchFor, stitchLead } from '../lib/stitch.js';
import { contextFromRequest, track } from '../lib/track.js';

/**
 * Lead submission — the conversion.
 *
 * The form used to POST straight to Web3Forms from the browser, with the API key
 * committed in the bundle. Now it lands here first: we persist the lead, emit the
 * conversion event as SERVER TRUTH, stitch the visitor's history, and only then
 * forward to Web3Forms with a key that never leaves the server.
 *
 * `lead_submitted` is emitted after the row is written, and is not in
 * CLIENT_EMITTABLE — a browser cannot fake a conversion.
 */

export const config = { runtime: 'nodejs' };

const LIMITS = { name: 120, company: 160, email: 200, phone: 40, quantity: 60, message: 4000 };

function field(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

// Deliberately permissive: rejecting an unusual but valid business address costs
// a real lead, which is far more expensive than storing one bad row.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  if (!rateLimit(`lead:${clientIp(req.headers)}`, 10)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }

  const identity = resolveIdentity(req);
  const { cookies, visitorId, sessionId } = rollingIdentityCookies(identity);
  res.setHeader('Set-Cookie', cookies);

  const ctx = contextFromRequest(req, 'server', { ...identity, visitorId, sessionId });
  const body = readJsonBody(req) as Record<string, unknown> | null;

  const name = field(body?.name, LIMITS.name);
  const email = field(body?.email, LIMITS.email);

  if (!name || !email || !EMAIL_RE.test(email)) {
    // props records WHICH fields were missing, never what was in them.
    await track('lead_submit_failed', { props: { reason: 'validation', fields: [!name && 'name', !email && 'email'].filter(Boolean) } }, ctx);
    res.status(400).json({ error: 'invalid', message: 'Name and a valid email are required.' });
    return;
  }

  const lead = {
    name,
    email,
    company: field(body?.company, LIMITS.company),
    phone: field(body?.phone, LIMITS.phone),
    quantity: field(body?.quantity, LIMITS.quantity),
    message: field(body?.message, LIMITS.message),
  };

  // Forwarded FIRST, and deliberately not awaited or wrapped in the try below.
  //
  // Before this endpoint existed the form posted straight to Web3Forms, so a
  // lead never depended on a database being reachable. Notifying inside the try
  // would quietly reintroduce that dependency: a Neon outage would turn a real
  // enquiry into a 500 and an email that never arrives. Losing the analytics row
  // is recoverable; losing the customer is not.
  void forwardToWeb3Forms(lead).catch((err) =>
    console.error('[lead] web3forms forward failed', err),
  );

  try {
    // First touch comes from the visitor's own event history, not from the form
    // payload — the client could say anything, and by submit time the landing
    // page's query string is long gone.
    const ft = await firstTouchFor(visitorId);

    const row = await prisma.lead.create({
      data: {
        ...lead,
        visitorId,
        sessionId,
        firstSource: ft.utmSource ?? ft.referrer ?? 'direct',
        firstMedium: ft.utmMedium,
        firstCampaign: ft.utmCampaign,
        firstReferrer: ft.referrer,
        landingPage: ft.landingPage,
      },
      select: { id: true },
    });

    // Retroactively attach this lead to everything the visitor did beforehand.
    // Runs BEFORE the conversion event so the event lands in an already-stitched
    // history rather than needing a second pass.
    const stitched = await stitchLead(visitorId, row.id);

    await track(
      'lead_submitted',
      {
        leadId: row.id,
        props: {
          quantity: lead.quantity,
          hasCompany: Boolean(lead.company),
          hasPhone: Boolean(lead.phone),
          messageLength: lead.message?.length ?? 0,
          stitchedEvents: stitched,
          // NEVER the name, email, phone, or message body. Those live on Lead.
        },
      },
      ctx,
    );

    res.status(200).json({ ok: true, leadId: row.id });
  } catch (err) {
    console.error('[lead] failed to persist', err);
    await track('lead_submit_failed', { props: { reason: 'persist_error' } }, ctx);
    // The notification is already in flight, so the enquiry is not lost — only
    // its analytics row is. Tell the visitor it worked, because for them it did:
    // showing an error would make them submit again or give up.
    res.status(200).json({ ok: true, degraded: true });
  }
}

async function forwardToWeb3Forms(lead: Record<string, string | null>): Promise<void> {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) return;
  await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: key, subject: 'New AquaVia enquiry', ...lead }),
  });
}
