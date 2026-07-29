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
 * The form used to POST straight to a third-party email forwarder from the
 * browser, with the API key committed in the bundle. Now it lands here: we
 * persist the lead, emit the conversion event as SERVER TRUTH, and stitch the
 * visitor's history.
 *
 * There is no email forward any more. The database row IS the enquiry — it is
 * read from the Leads tab of /admin, and that is the only place a new enquiry
 * appears. Nothing else is watching, so a write that fails is an enquiry lost;
 * see the catch at the bottom, which tells the visitor rather than pretending.
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
    // This used to answer `ok: true` because an email was already in flight, so
    // the enquiry survived a database outage. With the forward gone that is no
    // longer true: if the write failed, nobody will ever see this enquiry.
    // Saying "thanks, we'll be in touch" would be a lie that costs a customer,
    // so the visitor is told, and given a channel that does not depend on us.
    res.status(503).json({
      error: 'unavailable',
      message: "We couldn't record your enquiry. Please email info@aquaviaworld.com and we'll pick it up from there.",
    });
  }
}
