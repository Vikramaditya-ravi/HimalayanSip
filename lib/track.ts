import { type EventName, isEventName } from '../src/analytics/catalog.js';
import { geoFromHeaders } from './geo.js';
import { type ApiRequest } from './http.js';
import { type Actor, type Identity, resolveIdentity } from './identity.js';
import { sinksFor } from './sinks.js';
import { parseUA } from './ua.js';

/**
 * Server-side event emission.
 *
 * This is the only way server-truth events are written. It NEVER throws:
 * telemetry failing must never take down a lead submission or an admin action.
 * Every failure is swallowed and logged.
 */

const MAX_PROPS_BYTES = 8 * 1024;
const MAX_STR = 1024;

export type EventSourceKind = 'web' | 'server' | 'admin' | 'api';

export interface TrackPayload {
  occurredAt?: Date;
  props?: Record<string, unknown> | null;

  leadId?: string | null;
  productSku?: string | null;
  industrySlug?: string | null;
  sectionId?: string | null;
  queryText?: string | null;

  pageUrl?: string | null;
  prevPage?: string | null;
  referrer?: string | null;

  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  msclkid?: string | null;

  /**
   * The one deliberate identity override.
   *
   * When an admin marks a deal won, the person clicking is the admin but the
   * event belongs to the BUYER — otherwise every conversion in the system would
   * attribute to the admin's own visitor id and revenue-by-source would be
   * meaningless. Use `visitorIdOf(leadId)` to resolve it.
   */
  overrideVisitorId?: string | null;
  overrideSessionId?: string | null;
  overrideActor?: Actor;
}

export interface TrackContext {
  identity: Identity;
  device: string;
  browser: string;
  os: string;
  country: string | null;
  city: string | null;
  source: EventSourceKind;
}

export interface EventRow {
  name: string;
  occurredAt: Date;
  visitorId: string | null;
  sessionId: string | null;
  actor: Actor;
  actorId: string | null;
  leadId: string | null;
  productSku: string | null;
  industrySlug: string | null;
  sectionId: string | null;
  queryText: string | null;
  source: EventSourceKind;
  pageUrl: string | null;
  prevPage: string | null;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  consent: boolean;
  props: Record<string, unknown> | null;
}

/** Build a tracking context from a request. Resolves identity, actor, device and
 *  geo itself — callers never supply them. */
export function contextFromRequest(
  req: ApiRequest,
  source: EventSourceKind = 'server',
  identity?: Identity,
): TrackContext {
  const ua = Array.isArray(req.headers['user-agent'])
    ? req.headers['user-agent'][0]
    : req.headers['user-agent'];
  const { device, browser, os } = parseUA(ua);
  const { country, city } = geoFromHeaders(req.headers);
  return {
    identity: identity ?? resolveIdentity(req),
    device,
    browser,
    os,
    country,
    city,
    source,
  };
}

/** A context for jobs with no request behind them (cron, scripts). */
export function systemContext(): TrackContext {
  return {
    identity: {
      visitorId: null,
      sessionId: null,
      actor: 'system',
      actorId: 'cron',
      consent: false,
    },
    device: 'server',
    browser: 'server',
    os: 'server',
    country: null,
    city: null,
    source: 'server',
  };
}

function str(v: unknown, max = MAX_STR): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

/** Cap serialized props size so one runaway payload can't bloat the table. */
function capProps(props: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!props) return null;
  try {
    const json = JSON.stringify(props);
    if (json.length <= MAX_PROPS_BYTES) return props;
    return { _truncated: true, _bytes: json.length };
  } catch {
    return { _unserializable: true };
  }
}

export function buildRow(
  name: EventName,
  payload: TrackPayload,
  ctx: TrackContext,
): EventRow {
  const id = ctx.identity;
  return {
    name,
    occurredAt: payload.occurredAt ?? new Date(),
    visitorId: payload.overrideVisitorId ?? id.visitorId,
    sessionId: payload.overrideSessionId ?? id.sessionId,
    actor: payload.overrideActor ?? id.actor,
    actorId: id.actorId,
    leadId: str(payload.leadId),
    productSku: str(payload.productSku, 64),
    industrySlug: str(payload.industrySlug, 64),
    sectionId: str(payload.sectionId, 64),
    queryText: str(payload.queryText, 200)?.toLowerCase() ?? null,
    source: ctx.source,
    pageUrl: str(payload.pageUrl, 512),
    prevPage: str(payload.prevPage, 512),
    referrer: str(payload.referrer, 512),
    device: ctx.device,
    browser: ctx.browser,
    os: ctx.os,
    country: ctx.country,
    city: ctx.city,
    utmSource: str(payload.utmSource, 128),
    utmMedium: str(payload.utmMedium, 128),
    utmCampaign: str(payload.utmCampaign, 128),
    utmTerm: str(payload.utmTerm, 128),
    utmContent: str(payload.utmContent, 128),
    gclid: str(payload.gclid, 256),
    fbclid: str(payload.fbclid, 256),
    msclkid: str(payload.msclkid, 256),
    consent: id.consent,
    props: capProps(payload.props),
  };
}

/**
 * Write rows. Database is awaited; vendor sinks fan out in the background.
 * Returns false on failure rather than throwing.
 */
export async function writeRows(rows: EventRow[], consent: boolean): Promise<boolean> {
  if (rows.length === 0) return true;
  const { primary, background } = sinksFor(consent);

  let ok = true;
  try {
    await primary.write(rows);
  } catch (err) {
    ok = false;
    console.error('[analytics] database sink failed', err);
  }

  if (background.length > 0) {
    // Deliberately not awaited: a slow vendor must never delay the response.
    void Promise.allSettled(background.map((s) => s.write(rows))).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[analytics] sink ${background[i].name} failed`, r.reason);
        }
      });
    });
  }

  return ok;
}

export async function track(
  name: EventName,
  payload: TrackPayload,
  ctx: TrackContext,
): Promise<void> {
  await trackMany([{ name, ...payload }], ctx);
}

export async function trackMany(
  events: Array<TrackPayload & { name: EventName }>,
  ctx: TrackContext,
): Promise<void> {
  try {
    const rows: EventRow[] = [];
    for (const { name, ...payload } of events) {
      if (!isEventName(name)) {
        console.error(`[analytics] unknown event name "${name}" — not in catalog, dropped`);
        continue;
      }
      rows.push(buildRow(name, payload, ctx));
    }
    await writeRows(rows, ctx.identity.consent);
  } catch (err) {
    // Swallow. An analytics failure must never surface to the caller.
    console.error('[analytics] track failed', err);
  }
}
