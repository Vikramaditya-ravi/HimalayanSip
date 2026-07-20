import { prisma } from './db.js';

/**
 * Identity stitching.
 *
 * When an anonymous visitor converts, every event they produced BEFORE
 * converting is retroactively stamped with the resulting leadId.
 *
 * This is the only mutation of an otherwise-immutable stream, and it is what
 * makes "which campaign produced this revenue" answerable at all. Without it the
 * conversion event carries the leadId but the landing page view — the row that
 * actually holds the UTM — does not, so first-touch attribution has nothing to
 * attribute.
 */

export interface FirstTouch {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  landingPage: string | null;
}

/**
 * Stamp `leadId` onto all prior events for this visitor that don't have one.
 *
 * Only untagged events are touched, so a returning buyer's second enquiry never
 * steals the history of their first.
 */
export async function stitchLead(visitorId: string | null, leadId: string): Promise<number> {
  if (!visitorId) return 0;
  try {
    const { count } = await prisma.event.updateMany({
      where: { visitorId, leadId: null },
      data: { leadId },
    });
    return count;
  } catch (err) {
    console.error('[stitch] failed to stitch lead', err);
    return 0;
  }
}

/**
 * First touch for a visitor, read from the event stream.
 *
 * Ordered ascending and taking the first non-null value per field: the landing
 * page carries the UTM, and later events in the session carry it only because
 * the tracker replays it — but the referrer and landing page only exist on the
 * earliest rows.
 */
export async function firstTouchFor(visitorId: string | null): Promise<FirstTouch> {
  const empty: FirstTouch = {
    utmSource: null, utmMedium: null, utmCampaign: null,
    utmTerm: null, utmContent: null, referrer: null, landingPage: null,
  };
  if (!visitorId) return empty;

  try {
    const rows = await prisma.event.findMany({
      where: { visitorId },
      orderBy: { occurredAt: 'asc' },
      take: 50,
      select: {
        utmSource: true, utmMedium: true, utmCampaign: true,
        utmTerm: true, utmContent: true, referrer: true, pageUrl: true,
      },
    });

    const first = <K extends keyof (typeof rows)[number]>(key: K) =>
      (rows.find((r) => r[key] != null)?.[key] ?? null) as string | null;

    return {
      utmSource: first('utmSource'),
      utmMedium: first('utmMedium'),
      utmCampaign: first('utmCampaign'),
      utmTerm: first('utmTerm'),
      utmContent: first('utmContent'),
      referrer: first('referrer'),
      landingPage: rows[0]?.pageUrl ?? null,
    };
  } catch (err) {
    console.error('[stitch] first-touch lookup failed', err);
    return empty;
  }
}

/**
 * Reverse lookup: leadId -> the buyer's visitorId.
 *
 * Needed because lifecycle events are triggered by an ADMIN clicking a button.
 * Without this, every won deal would be attributed to the admin's own visitor id
 * and revenue-by-source would report that all revenue comes from whoever runs
 * the dashboard.
 *
 * Read from the event stream (stitching put it there) rather than from the Lead
 * table, so the attribution path never depends on a business table.
 */
export async function visitorIdOf(leadId: string): Promise<string | null> {
  try {
    const row = await prisma.event.findFirst({
      where: { leadId, visitorId: { not: null }, actor: { in: ['visitor', 'customer'] } },
      orderBy: { occurredAt: 'asc' },
      select: { visitorId: true, sessionId: true },
    });
    return row?.visitorId ?? null;
  } catch (err) {
    console.error('[stitch] reverse lookup failed', err);
    return null;
  }
}
