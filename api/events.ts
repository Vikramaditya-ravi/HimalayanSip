import { isClientEmittable } from '../src/analytics/catalog.js';
import { clientIp } from '../lib/geo.js';
import { type ApiRequest, type ApiResponse, readJsonBody } from '../lib/http.js';
import { resolveIdentity, rollingIdentityCookies } from '../lib/identity.js';
import { rateLimit } from '../lib/ratelimit.js';
import { contextFromRequest, trackMany, type TrackPayload } from '../lib/track.js';
import type { EventName } from '../src/analytics/catalog.js';

/**
 * Public, unauthenticated ingest. Anonymous visitors are the entire point, so
 * there is nothing to authenticate against.
 *
 * THIS ENDPOINT ALWAYS RETURNS 204. Validation failure, rate limit, malformed
 * JSON, database outage — all 204. A tracking endpoint that surfaces errors to a
 * browser turns an analytics problem into a user-visible one, and a console full
 * of red from telemetry trains people to ignore real errors.
 */

export const config = { runtime: 'nodejs' };

const MAX_BATCH = 20;
const MAX_SKEW_PAST_MS = 30 * 60 * 1000;
const MAX_SKEW_FUTURE_MS = 5 * 60 * 1000;

interface IncomingEvent {
  name?: unknown;
  t?: unknown;
  props?: unknown;
  pageUrl?: unknown;
  prevPage?: unknown;
  sectionId?: unknown;
  productSku?: unknown;
  industrySlug?: unknown;
  queryText?: unknown;
}

interface IncomingAttribution {
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmTerm?: unknown;
  utmContent?: unknown;
  gclid?: unknown;
  fbclid?: unknown;
  msclkid?: unknown;
  referrer?: unknown;
}

function s(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

/** Clamp a client clock to a believable window. Phones with wrong system clocks
 *  are common enough that unclamped timestamps corrupt daily rollups. */
function clampTime(raw: unknown, now: number): Date {
  const t = typeof raw === 'number' ? raw : Date.parse(String(raw ?? ''));
  if (!Number.isFinite(t)) return new Date(now);
  return new Date(Math.min(Math.max(t, now - MAX_SKEW_PAST_MS), now + MAX_SKEW_FUTURE_MS));
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const done = () => res.status(204).end();

  try {
    if (req.method !== 'POST') return done();

    // IP is used here and ONLY here, transiently, for rate limiting.
    // It is never passed to track() and never reaches the database.
    if (!rateLimit(clientIp(req.headers))) return done();

    const identity = resolveIdentity(req);
    const { cookies, visitorId, sessionId } = rollingIdentityCookies(identity);
    res.setHeader('Set-Cookie', cookies);

    const body = readJsonBody(req) as
      | { events?: unknown; attribution?: unknown }
      | null;
    if (!body || typeof body !== 'object') return done();

    const incoming = Array.isArray(body.events) ? (body.events as IncomingEvent[]) : [];
    if (incoming.length === 0) return done();

    const attr = (body.attribution ?? {}) as IncomingAttribution;
    const now = Date.now();

    const batch: Array<TrackPayload & { name: EventName }> = [];
    let offset = 0;

    for (const ev of incoming.slice(0, MAX_BATCH)) {
      const name = s(ev.name);
      // Silently drop anything not in the catalog, and anything a browser has no
      // business emitting. A client must never be able to forge `lead_won`.
      if (!name || !isClientEmittable(name)) continue;

      const occurredAt = clampTime(ev.t, now);
      // Same-batch events share a millisecond after clamping, which would make
      // "first touch" and funnel ordering arbitrary. Nudge each by 1ms to keep
      // the order the client sent them in.
      occurredAt.setMilliseconds(occurredAt.getMilliseconds() + offset);
      offset += 1;

      batch.push({
        name,
        occurredAt,
        props:
          ev.props && typeof ev.props === 'object' && !Array.isArray(ev.props)
            ? (ev.props as Record<string, unknown>)
            : null,
        pageUrl: s(ev.pageUrl),
        prevPage: s(ev.prevPage),
        sectionId: s(ev.sectionId),
        productSku: s(ev.productSku),
        industrySlug: s(ev.industrySlug),
        queryText: s(ev.queryText),

        // Attribution is replayed onto every batch by the tracker, because the
        // UTM was on the landing page and the conversion happens three sections
        // later when the query string is long gone.
        utmSource: s(attr.utmSource),
        utmMedium: s(attr.utmMedium),
        utmCampaign: s(attr.utmCampaign),
        utmTerm: s(attr.utmTerm),
        utmContent: s(attr.utmContent),
        gclid: s(attr.gclid),
        fbclid: s(attr.fbclid),
        msclkid: s(attr.msclkid),
        referrer: s(attr.referrer),

        // Identity is stamped from cookies, never from the payload. Anything the
        // body claimed about visitorId/sessionId/actor was ignored above.
        overrideVisitorId: visitorId,
        overrideSessionId: sessionId,
      });
    }

    if (batch.length === 0) return done();

    const ctx = contextFromRequest(req, 'web', { ...identity, visitorId, sessionId });
    await trackMany(batch, ctx);
  } catch (err) {
    console.error('[ingest] failed', err);
  }

  return done();
}
