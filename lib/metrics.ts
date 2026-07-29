import { Prisma } from '@prisma/client';
import { ENGAGEMENT_EVENTS, FUNNEL_STEPS } from '../src/analytics/catalog.js';
import { prisma } from './db.js';

/**
 * Metric definitions. One source of truth, so every surface agrees.
 *
 * ARCHITECTURAL RULE: everything here reads from Event and the rollup tables
 * derived from it. Nothing in this file joins Lead, or any other business table.
 * If a number isn't answerable from the stream, the fix is to emit a better
 * event — never to add a join. That is what stops the dashboard rotting every
 * time the business schema changes.
 *
 * Note on `lead_won` revenue: the value rides in props on the event, and
 * first-touch attribution is computed from the stitched `leadId` on prior events.
 * So revenue-by-source is answerable without ever reading the Lead table.
 */

// ---------------------------------------------------------------------------
// Shared filters.
//
// Exported as PLAIN STRINGS, not Prisma.sql fragments. A Prisma.Sql object
// interpolated into a raw string template stringifies to "[object Object]",
// which produces SQL that is either invalid or — worse — silently wrong. Each
// call site wraps these in Prisma.raw() at the point of use.
// ---------------------------------------------------------------------------

/** Exclude admin and system actors from every visitor-facing metric. */
export const PUBLIC_ACTORS = `e."actor" IN ('visitor','customer')`;

/** Bots inflate every traffic number. Excluded from all traffic metrics. */
export const NOT_BOT = `e."device" IS DISTINCT FROM 'bot'`;

export const PUBLIC_TRAFFIC = `${PUBLIC_ACTORS} AND ${NOT_BOT}`;

const raw = (s: string) => Prisma.raw(s);

export const DEFAULT_RETENTION_DAYS = 90;

export function retentionDays(): number {
  const n = Number(process.env.EVENT_RETENTION_DAYS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RETENTION_DAYS;
}

/**
 * Whether a range reaches past the raw-event retention window.
 *
 * When true, the caller must read rollups instead — and the response must say so.
 * Rollup uniques are sums of daily uniques, which double-counts anyone who
 * returned on another day. That makes them an UPPER BOUND, not a fact, and the
 * UI must never present one as the other.
 */
export function shouldUseRollups(days: number): boolean {
  return days > retentionDays();
}

export function rangeStart(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Cap the requested range so a hand-edited ?days= can't table-scan forever. */
export function clampDays(input: unknown, max = 730): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n <= 0) return 30;
  return Math.min(Math.floor(n), max);
}

export interface MetricResult<T> {
  data: T;
  /** True when the numbers came from rollups and uniques are upper bounds. */
  rolledUp: boolean;
}

const engagementList = Prisma.join(ENGAGEMENT_EVENTS.map((e) => Prisma.sql`${e}`));

// ---------------------------------------------------------------------------
// Bounce
//
// A session with <= 1 page view AND no engagement event. The engagement list is
// explicit (see ENGAGEMENT_EVENTS in the catalog) rather than "anything that
// isn't a page view", because section views fire automatically on scroll and
// would make bouncing structurally impossible.
// ---------------------------------------------------------------------------

const BOUNCE_CTE = (since: Date) => Prisma.sql`
  WITH sessions AS (
    SELECT
      e."sessionId" AS sid,
      COUNT(*) FILTER (WHERE e."name" = 'page_viewed') AS page_views,
      COUNT(*) FILTER (WHERE e."name" IN (${engagementList})) AS engagements
    FROM "Event" e
    WHERE e."occurredAt" >= ${since}
      AND e."sessionId" IS NOT NULL
      AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY e."sessionId"
  )
`;

export async function overview(days: number): Promise<MetricResult<{
  visitors: number;
  sessions: number;
  conversions: number;
  bounceRate: number;
  events: number;
}>> {
  const since = rangeStart(days);

  if (shouldUseRollups(days)) {
    const rows = await prisma.$queryRaw<Array<{ visitors: bigint; sessions: bigint; bounced: bigint; events: bigint }>>`
      SELECT
        COALESCE(SUM("visitors"), 0)::bigint AS visitors,
        COALESCE(SUM("sessions"), 0)::bigint AS sessions,
        COALESCE(SUM("bounced"), 0)::bigint AS bounced,
        COALESCE(SUM("events"), 0)::bigint AS events
      FROM "EventDaily"
      WHERE "day" >= ${since} AND "name" = '__all__'
    `;
    const conv = await prisma.$queryRaw<Array<{ n: bigint }>>`
      SELECT COALESCE(SUM("events"), 0)::bigint AS n
      FROM "EventDaily" WHERE "day" >= ${since} AND "name" = 'lead_submitted'
    `;
    const r = rows[0];
    const sessions = Number(r?.sessions ?? 0);
    return {
      rolledUp: true,
      data: {
        visitors: Number(r?.visitors ?? 0),
        sessions,
        events: Number(r?.events ?? 0),
        conversions: Number(conv[0]?.n ?? 0),
        bounceRate: sessions ? Number(r?.bounced ?? 0) / sessions : 0,
      },
    };
  }

  const [totals] = await prisma.$queryRaw<Array<{ visitors: bigint; sessions: bigint; events: bigint }>>`
    SELECT
      COUNT(DISTINCT e."visitorId")::bigint AS visitors,
      COUNT(DISTINCT e."sessionId")::bigint AS sessions,
      COUNT(*)::bigint AS events
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)}
  `;

  // PUBLIC_TRAFFIC is required here, not optional. The rollup writes its
  // `lead_submitted` daily row under the same filter, and the funnel applies
  // NOT_BOT to the same event — without it, this one number disagrees with both
  // and silently changes when a range crosses the retention boundary. It also
  // stops spam-bot form submissions, which a public contact form gets plenty of,
  // from inflating the conversion count.
  const [{ n: conversions }] = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT COUNT(*)::bigint AS n FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."name" = 'lead_submitted'
      AND ${raw(PUBLIC_TRAFFIC)}
  `;

  const [bounce] = await prisma.$queryRaw<Array<{ bounced: bigint; total: bigint }>>`
    ${BOUNCE_CTE(since)}
    SELECT
      COUNT(*) FILTER (WHERE page_views <= 1 AND engagements = 0)::bigint AS bounced,
      COUNT(*)::bigint AS total
    FROM sessions
  `;

  const total = Number(bounce?.total ?? 0);
  return {
    rolledUp: false,
    data: {
      visitors: Number(totals?.visitors ?? 0),
      sessions: Number(totals?.sessions ?? 0),
      events: Number(totals?.events ?? 0),
      conversions: Number(conversions ?? 0),
      bounceRate: total ? Number(bounce?.bounced ?? 0) / total : 0,
    },
  };
}

export async function trafficTrend(days: number): Promise<MetricResult<Array<{
  day: string;
  visitors: number;
  sessions: number;
  conversions: number;
}>>> {
  const since = rangeStart(days);

  if (shouldUseRollups(days)) {
    const rows = await prisma.$queryRaw<Array<{ day: Date; visitors: bigint; sessions: bigint; conversions: bigint }>>`
      SELECT
        d."day",
        MAX(CASE WHEN d."name" = '__all__' THEN d."visitors" ELSE 0 END)::bigint AS visitors,
        MAX(CASE WHEN d."name" = '__all__' THEN d."sessions" ELSE 0 END)::bigint AS sessions,
        MAX(CASE WHEN d."name" = 'lead_submitted' THEN d."events" ELSE 0 END)::bigint AS conversions
      FROM "EventDaily" d
      WHERE d."day" >= ${since}
      GROUP BY d."day" ORDER BY d."day"
    `;
    return {
      rolledUp: true,
      data: rows.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        visitors: Number(r.visitors),
        sessions: Number(r.sessions),
        conversions: Number(r.conversions),
      })),
    };
  }

  const rows = await prisma.$queryRaw<Array<{ day: Date; visitors: bigint; sessions: bigint; conversions: bigint }>>`
    SELECT
      DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date AS day,
      COUNT(DISTINCT e."visitorId") FILTER (WHERE ${raw(PUBLIC_TRAFFIC)})::bigint AS visitors,
      COUNT(DISTINCT e."sessionId") FILTER (WHERE ${raw(PUBLIC_TRAFFIC)})::bigint AS sessions,
      COUNT(*) FILTER (WHERE e."name" = 'lead_submitted')::bigint AS conversions
    FROM "Event" e
    WHERE e."occurredAt" >= ${since}
    GROUP BY 1 ORDER BY 1
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      visitors: Number(r.visitors),
      sessions: Number(r.sessions),
      conversions: Number(r.conversions),
    })),
  };
}

// ---------------------------------------------------------------------------
// Dimension breakdowns.
//
// `dimension` is constrained to a closed union and mapped to a literal column
// name here. User input is NEVER interpolated into SQL — the request only ever
// selects which of these fixed strings to use.
// ---------------------------------------------------------------------------

export const DIMENSIONS = ['device', 'browser', 'os', 'country', 'city', 'page'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export function isDimension(v: unknown): v is Dimension {
  return typeof v === 'string' && (DIMENSIONS as readonly string[]).includes(v);
}

const DIMENSION_COLUMN: Record<Dimension, string> = {
  device: 'e."device"',
  browser: 'e."browser"',
  os: 'e."os"',
  country: 'e."country"',
  city: 'e."city"',
  page: 'e."pageUrl"',
};

export async function dimensionBreakdown(
  dimension: Dimension,
  days: number,
  limit = 20,
): Promise<MetricResult<Array<{ value: string; sessions: number; events: number }>>> {
  const since = rangeStart(days);

  if (shouldUseRollups(days)) {
    const rows = await prisma.$queryRaw<Array<{ value: string; sessions: bigint; events: bigint }>>`
      SELECT "value", SUM("sessions")::bigint AS sessions, SUM("events")::bigint AS events
      FROM "DimensionDaily"
      WHERE "day" >= ${since} AND "dimension" = ${dimension}
      GROUP BY "value" ORDER BY sessions DESC LIMIT ${limit}
    `;
    return {
      rolledUp: true,
      data: rows.map((r) => ({ value: r.value, sessions: Number(r.sessions), events: Number(r.events) })),
    };
  }

  const col = DIMENSION_COLUMN[dimension];
  const rows = await prisma.$queryRaw<Array<{ value: string | null; sessions: bigint; events: bigint }>>`
    SELECT ${raw(col)} AS value,
           COUNT(DISTINCT e."sessionId")::bigint AS sessions,
           COUNT(*)::bigint AS events
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND ${raw(col)} IS NOT NULL
    GROUP BY 1 ORDER BY sessions DESC LIMIT ${limit}
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      value: r.value ?? '(unknown)',
      sessions: Number(r.sessions),
      events: Number(r.events),
    })),
  };
}

// ---------------------------------------------------------------------------
// Funnel — counted in SESSIONS, not events.
//
// Counting events would let one indecisive visitor who refills the form four
// times look like four prospects, and would make the funnel widen at the bottom.
// ---------------------------------------------------------------------------

export async function funnel(days: number): Promise<MetricResult<Array<{ step: string; sessions: number }>>> {
  const since = rangeStart(days);
  const rows = await prisma.$queryRaw<Array<{ name: string; sessions: bigint }>>`
    SELECT e."name", COUNT(DISTINCT e."sessionId")::bigint AS sessions
    FROM "Event" e
    WHERE e."occurredAt" >= ${since}
      AND e."name" IN (${Prisma.join(FUNNEL_STEPS.map((s) => Prisma.sql`${s}`))})
      AND ${raw(NOT_BOT)}
    GROUP BY e."name"
  `;
  const byStep = new Map(rows.map((r) => [r.name, Number(r.sessions)]));
  return {
    rolledUp: false,
    data: FUNNEL_STEPS.map((step) => ({ step, sessions: byStep.get(step) ?? 0 })),
  };
}

export async function contactIntentSplit(days: number): Promise<MetricResult<Array<{ channel: string; clicks: number; sessions: number }>>> {
  const since = rangeStart(days);
  const rows = await prisma.$queryRaw<Array<{ channel: string | null; clicks: bigint; sessions: bigint }>>`
    SELECT e."props"->>'channel' AS channel,
           COUNT(*)::bigint AS clicks,
           COUNT(DISTINCT e."sessionId")::bigint AS sessions
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."name" = 'contact_intent_clicked' AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY 1 ORDER BY clicks DESC
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      channel: r.channel ?? 'unknown',
      clicks: Number(r.clicks),
      sessions: Number(r.sessions),
    })),
  };
}

// ---------------------------------------------------------------------------
// Attribution & revenue.
//
// First touch, always: ARRAY_AGG(... ORDER BY occurredAt)[1], never the latest
// value. A visitor who arrives from an ad and later returns via Google must stay
// credited to the ad, or paid channels look worthless and organic looks magic.
// ---------------------------------------------------------------------------

/** First-touch source/campaign per lead, derived purely from stitched events. */
const LEAD_FIRST_TOUCH = Prisma.sql`
  SELECT
    e."leadId" AS lead_id,
    (ARRAY_AGG(COALESCE(e."utmSource", e."referrer", 'direct') ORDER BY e."occurredAt"))[1] AS source,
    (ARRAY_AGG(COALESCE(e."utmMedium", '(none)') ORDER BY e."occurredAt"))[1] AS medium,
    (ARRAY_AGG(COALESCE(e."utmCampaign", '(none)') ORDER BY e."occurredAt"))[1] AS campaign,
    MIN(e."occurredAt") AS first_touch
  FROM "Event" e
  WHERE e."leadId" IS NOT NULL
  GROUP BY e."leadId"
`;

export async function revenueBySource(days: number): Promise<MetricResult<Array<{
  source: string;
  campaign: string;
  sessions: number;
  conversions: number;
  revenue: number;
  revenuePerSession: number;
}>>> {
  const since = rangeStart(days);

  if (shouldUseRollups(days)) {
    const rows = await prisma.$queryRaw<Array<{ source: string; campaign: string; sessions: bigint; conversions: bigint; revenue: Prisma.Decimal }>>`
      SELECT "source", "campaign", SUM("sessions")::bigint AS sessions,
             SUM("conversions")::bigint AS conversions, SUM("revenue") AS revenue
      FROM "SourceDaily" WHERE "day" >= ${since}
      GROUP BY "source", "campaign" ORDER BY revenue DESC
    `;
    return {
      rolledUp: true,
      data: rows.map((r) => {
        const sessions = Number(r.sessions);
        const revenue = Number(r.revenue);
        return {
          source: r.source,
          campaign: r.campaign,
          sessions,
          conversions: Number(r.conversions),
          revenue,
          revenuePerSession: sessions ? revenue / sessions : 0,
        };
      }),
    };
  }

  const rows = await prisma.$queryRaw<Array<{
    source: string; campaign: string; sessions: bigint; conversions: bigint; revenue: string | null;
  }>>`
    WITH first_touch AS (${LEAD_FIRST_TOUCH}),
    session_sources AS (
      SELECT
        e."sessionId" AS sid,
        (ARRAY_AGG(COALESCE(e."utmSource", e."referrer", 'direct') ORDER BY e."occurredAt"))[1] AS source,
        (ARRAY_AGG(COALESCE(e."utmCampaign", '(none)') ORDER BY e."occurredAt"))[1] AS campaign
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND e."sessionId" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
      GROUP BY e."sessionId"
    ),
    traffic AS (
      SELECT source, campaign, COUNT(*)::bigint AS sessions
      FROM session_sources GROUP BY source, campaign
    ),
    money AS (
      SELECT ft.source, ft.campaign,
             COUNT(*) FILTER (WHERE e."name" = 'lead_submitted')::bigint AS conversions,
             COALESCE(SUM((e."props"->>'value')::numeric) FILTER (WHERE e."name" = 'lead_won'), 0) AS revenue
      FROM "Event" e
      JOIN first_touch ft ON ft.lead_id = e."leadId"
      WHERE e."occurredAt" >= ${since} AND e."name" IN ('lead_submitted','lead_won')
      GROUP BY ft.source, ft.campaign
    )
    SELECT
      COALESCE(t.source, m.source) AS source,
      COALESCE(t.campaign, m.campaign) AS campaign,
      COALESCE(t.sessions, 0)::bigint AS sessions,
      COALESCE(m.conversions, 0)::bigint AS conversions,
      COALESCE(m.revenue, 0)::text AS revenue
    FROM traffic t
    FULL OUTER JOIN money m ON m.source = t.source AND m.campaign = t.campaign
    ORDER BY COALESCE(m.revenue, 0) DESC, sessions DESC
    LIMIT 50
  `;

  return {
    rolledUp: false,
    data: rows.map((r) => {
      const sessions = Number(r.sessions);
      const revenue = Number(r.revenue ?? 0);
      return {
        source: r.source ?? 'direct',
        campaign: r.campaign ?? '(none)',
        sessions,
        conversions: Number(r.conversions),
        revenue,
        revenuePerSession: sessions ? revenue / sessions : 0,
      };
    }),
  };
}

/**
 * Median hours from first touch to conversion, and to win.
 *
 * Median rather than mean: one lead that sat in an inbox for three months would
 * drag a mean into uselessness.
 */
export async function velocity(days: number): Promise<MetricResult<{
  medianHoursToConversion: number | null;
  medianHoursToWin: number | null;
}>> {
  const since = rangeStart(days);
  const [row] = await prisma.$queryRaw<Array<{ to_conv: number | null; to_win: number | null }>>`
    WITH first_touch AS (${LEAD_FIRST_TOUCH}),
    milestones AS (
      SELECT e."leadId" AS lead_id,
             MIN(e."occurredAt") FILTER (WHERE e."name" = 'lead_submitted') AS converted_at,
             MIN(e."occurredAt") FILTER (WHERE e."name" = 'lead_won') AS won_at
      FROM "Event" e
      WHERE e."leadId" IS NOT NULL AND e."name" IN ('lead_submitted','lead_won')
      GROUP BY e."leadId"
    )
    SELECT
      PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (m.converted_at - ft.first_touch)) / 3600
      ) AS to_conv,
      PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (m.won_at - ft.first_touch)) / 3600
      ) AS to_win
    FROM milestones m
    JOIN first_touch ft ON ft.lead_id = m.lead_id
    WHERE m.converted_at >= ${since}
  `;
  return {
    rolledUp: false,
    data: {
      medianHoursToConversion: row?.to_conv ?? null,
      medianHoursToWin: row?.to_win ?? null,
    },
  };
}

/**
 * How many product/customizer interactions happen before converting, bucketed,
 * against conversion rate. Answers "does the customizer actually sell bottles".
 */
export async function depth(days: number): Promise<MetricResult<Array<{
  bucket: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}>>> {
  const since = rangeStart(days);
  const rows = await prisma.$queryRaw<Array<{ bucket: string; sessions: bigint; conversions: bigint }>>`
    WITH per_session AS (
      SELECT e."sessionId" AS sid,
             COUNT(*) FILTER (
               WHERE e."name" IN ('product_viewed','customizer_opened','customizer_logo_uploaded',
                                  'customizer_color_changed','customizer_size_changed')
             ) AS depth,
             COUNT(*) FILTER (WHERE e."name" = 'lead_submitted') > 0 AS converted
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND e."sessionId" IS NOT NULL AND ${raw(NOT_BOT)}
      GROUP BY e."sessionId"
    )
    SELECT
      CASE WHEN depth = 0 THEN '0'
           WHEN depth BETWEEN 1 AND 2 THEN '1-2'
           WHEN depth BETWEEN 3 AND 5 THEN '3-5'
           WHEN depth BETWEEN 6 AND 10 THEN '6-10'
           ELSE '10+' END AS bucket,
      COUNT(*)::bigint AS sessions,
      COUNT(*) FILTER (WHERE converted)::bigint AS conversions
    FROM per_session
    GROUP BY 1
    ORDER BY MIN(depth)
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => {
      const sessions = Number(r.sessions);
      const conversions = Number(r.conversions);
      return { bucket: r.bucket, sessions, conversions, conversionRate: sessions ? conversions / sessions : 0 };
    }),
  };
}

export async function retention(days: number): Promise<MetricResult<{
  repeatRate: number;
  medianSessionMinutes: number | null;
  visitors: number;
}>> {
  const since = rangeStart(days);
  const [row] = await prisma.$queryRaw<Array<{ visitors: bigint; repeat: bigint; median_minutes: number | null }>>`
    WITH per_visitor AS (
      SELECT e."visitorId" AS vid, COUNT(DISTINCT e."sessionId") AS sessions
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND e."visitorId" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
      GROUP BY e."visitorId"
    ),
    durations AS (
      SELECT EXTRACT(EPOCH FROM (MAX(e."occurredAt") - MIN(e."occurredAt"))) / 60 AS minutes
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND e."sessionId" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
      GROUP BY e."sessionId"
    )
    SELECT
      (SELECT COUNT(*)::bigint FROM per_visitor) AS visitors,
      (SELECT COUNT(*)::bigint FROM per_visitor WHERE sessions > 1) AS repeat,
      (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) FROM durations) AS median_minutes
  `;
  const visitors = Number(row?.visitors ?? 0);
  return {
    rolledUp: false,
    data: {
      visitors,
      repeatRate: visitors ? Number(row?.repeat ?? 0) / visitors : 0,
      medianSessionMinutes: row?.median_minutes ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// Search — the zero-result list is a product roadmap written by buyers.
// ---------------------------------------------------------------------------

export async function searchQueries(days: number, limit = 50): Promise<MetricResult<Array<{
  query: string;
  searches: number;
  zeroResults: number;
  clicks: number;
}>>> {
  const since = rangeStart(days);

  if (shouldUseRollups(days)) {
    const rows = await prisma.$queryRaw<Array<{ query: string; searches: bigint; zero: bigint; clicks: bigint }>>`
      SELECT "query", SUM("searches")::bigint AS searches,
             SUM("zeroResults")::bigint AS zero, SUM("clicks")::bigint AS clicks
      FROM "SearchDaily" WHERE "day" >= ${since}
      GROUP BY "query" ORDER BY zero DESC, searches DESC LIMIT ${limit}
    `;
    return {
      rolledUp: true,
      data: rows.map((r) => ({
        query: r.query,
        searches: Number(r.searches),
        zeroResults: Number(r.zero),
        clicks: Number(r.clicks),
      })),
    };
  }

  const rows = await prisma.$queryRaw<Array<{ query: string; searches: bigint; zero: bigint; clicks: bigint }>>`
    SELECT e."queryText" AS query,
           COUNT(*) FILTER (WHERE e."name" = 'search_performed')::bigint AS searches,
           COUNT(*) FILTER (WHERE e."name" = 'search_zero_results')::bigint AS zero,
           COUNT(*) FILTER (WHERE e."name" = 'search_result_clicked')::bigint AS clicks
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."queryText" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY e."queryText"
    ORDER BY zero DESC, searches DESC
    LIMIT ${limit}
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      query: r.query,
      searches: Number(r.searches),
      zeroResults: Number(r.zero),
      clicks: Number(r.clicks),
    })),
  };
}

export async function productPerformance(days: number): Promise<MetricResult<Array<{
  productSku: string;
  views: number;
  ctaClicks: number;
  sessions: number;
  ctr: number;
}>>> {
  const since = rangeStart(days);

  if (shouldUseRollups(days)) {
    const rows = await prisma.$queryRaw<Array<{ sku: string; views: bigint; cta: bigint; sessions: bigint }>>`
      SELECT "productSku" AS sku, SUM("views")::bigint AS views,
             SUM("ctaClicks")::bigint AS cta, SUM("sessions")::bigint AS sessions
      FROM "ProductDaily" WHERE "day" >= ${since}
      GROUP BY "productSku" ORDER BY views DESC
    `;
    return {
      rolledUp: true,
      data: rows.map((r) => ({
        productSku: r.sku,
        views: Number(r.views),
        ctaClicks: Number(r.cta),
        sessions: Number(r.sessions),
        ctr: Number(r.views) ? Number(r.cta) / Number(r.views) : 0,
      })),
    };
  }

  const rows = await prisma.$queryRaw<Array<{ sku: string; views: bigint; cta: bigint; sessions: bigint }>>`
    SELECT e."productSku" AS sku,
           COUNT(*) FILTER (WHERE e."name" = 'product_viewed')::bigint AS views,
           COUNT(*) FILTER (WHERE e."name" = 'product_cta_clicked')::bigint AS cta,
           COUNT(DISTINCT e."sessionId")::bigint AS sessions
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."productSku" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY e."productSku" ORDER BY views DESC
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      productSku: r.sku,
      views: Number(r.views),
      ctaClicks: Number(r.cta),
      sessions: Number(r.sessions),
      ctr: Number(r.views) ? Number(r.cta) / Number(r.views) : 0,
    })),
  };
}

export async function topPages(days: number, limit = 20) {
  return dimensionBreakdown('page', days, limit);
}

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

export async function liveVisitors(): Promise<MetricResult<{ online: number }>> {
  const [row] = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT COUNT(DISTINCT e."visitorId")::bigint AS n
    FROM "Event" e
    WHERE e."occurredAt" >= NOW() - INTERVAL '5 minutes' AND ${raw(PUBLIC_TRAFFIC)}
  `;
  return { rolledUp: false, data: { online: Number(row?.n ?? 0) } };
}

/**
 * Raw recent-event feed.
 *
 * Built before anything else in the dashboard, and still the most useful surface
 * for debugging: if events aren't landing here, nothing downstream is real.
 */
export async function recentEvents(limit = 100): Promise<MetricResult<Array<Record<string, unknown>>>> {
  const rows = await prisma.event.findMany({
    orderBy: { occurredAt: 'desc' },
    take: Math.min(limit, 500),
    select: {
      id: true, name: true, occurredAt: true, visitorId: true, sessionId: true,
      actor: true, source: true, pageUrl: true, sectionId: true, productSku: true,
      queryText: true, leadId: true, device: true, browser: true, os: true,
      country: true, city: true, utmSource: true, utmCampaign: true, referrer: true,
      props: true,
    },
  });
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      ...r,
      occurredAt: r.occurredAt.toISOString(),
      // Truncate the visitor id for display — the dashboard needs to tell people
      // apart, not to identify them.
      visitorShort: r.visitorId?.slice(0, 8) ?? null,
    })),
  };
}

/**
 * The most recent day's insights.
 *
 * Read straight from the Insight table — these rows were produced by SQL
 * detectors and narrated afterwards, so the numbers on the card are the same
 * numbers the detector computed.
 */
export async function latestInsights(): Promise<MetricResult<Array<{
  detector: string;
  severity: string;
  category: string;
  title: string;
  narrative: string | null;
  metric: unknown;
  day: string;
}>>> {
  const [latest] = await prisma.insight.findMany({
    orderBy: { day: 'desc' },
    take: 1,
    select: { day: true },
  });
  if (!latest) return { rolledUp: false, data: [] };

  const rows = await prisma.insight.findMany({
    where: { day: latest.day },
    orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }],
    take: 10,
  });

  return {
    rolledUp: false,
    data: rows.map((r) => ({
      detector: r.detector,
      severity: r.severity,
      category: r.category,
      title: r.title,
      narrative: r.narrative,
      metric: r.metric,
      day: r.day.toISOString().slice(0, 10),
    })),
  };
}

/**
 * Freshness of the analytics infrastructure itself.
 *
 * A stalled rollup and a genuinely quiet fortnight produce identical dashboards.
 * The absence of these events IS the alarm, so it has to be surfaced explicitly.
 */
export async function infraHealth(): Promise<MetricResult<{
  lastRollupAt: string | null;
  lastInsightsAt: string | null;
  rollupStale: boolean;
  retentionDays: number;
}>> {
  const rows = await prisma.$queryRaw<Array<{ name: string; last: Date }>>`
    SELECT e."name", MAX(e."occurredAt") AS last
    FROM "Event" e
    WHERE e."name" IN ('rollup_completed','insights_generated')
    GROUP BY e."name"
  `;
  const byName = new Map(rows.map((r) => [r.name, r.last]));
  const lastRollup = byName.get('rollup_completed') ?? null;
  return {
    rolledUp: false,
    data: {
      lastRollupAt: lastRollup?.toISOString() ?? null,
      lastInsightsAt: byName.get('insights_generated')?.toISOString() ?? null,
      retentionDays: retentionDays(),
      // Nightly job; more than 36h without one means it is not running.
      rollupStale: !lastRollup || Date.now() - lastRollup.getTime() > 36 * 60 * 60 * 1000,
    },
  };
}

// ---------------------------------------------------------------------------
// AI crawlers
//
// Everything above this line measures people. These two measure machines, and
// they exist because the entire generative-search programme is aimed at a class
// of traffic the rest of this file deliberately excludes: `NOT_BOT` is in
// PUBLIC_TRAFFIC precisely so a crawler never inflates a visitor number.
//
// So these query the bot rows directly — `crawler_fetch` events written by
// api/crawl.ts from the edge middleware, because crawlers never execute the
// client tracker and were therefore invisible to every other metric here.
//
// Being able to answer "did ChatGPT's crawler read our pricing page this week"
// is unusual for a business this size, and it is only possible because the
// first-party pipeline already exists.
// ---------------------------------------------------------------------------

/** Crawler hits per agent, with how many distinct URLs each one reached. */
export async function crawlerAgents(days: number, limit = 20): Promise<MetricResult<Array<{
  agent: string;
  hits: number;
  pages: number;
  lastSeen: string | null;
}>>> {
  const since = rangeStart(days);
  const rows = await prisma.$queryRaw<Array<{
    agent: string | null; hits: bigint; pages: bigint; last: Date | null;
  }>>`
    SELECT e."browser" AS agent,
           COUNT(*)::bigint AS hits,
           COUNT(DISTINCT e."pageUrl")::bigint AS pages,
           MAX(e."occurredAt") AS last
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."name" = 'crawler_fetch'
    GROUP BY 1 ORDER BY hits DESC LIMIT ${limit}
  `;
  return {
    // Never rolled up: the daily rollup tables are built from PUBLIC_TRAFFIC,
    // which excludes bots by design, so these numbers are always exact and are
    // always bounded by the raw retention window.
    rolledUp: false,
    data: rows.map((r) => ({
      agent: r.agent ?? 'unknown',
      hits: Number(r.hits),
      pages: Number(r.pages),
      lastSeen: r.last?.toISOString() ?? null,
    })),
  };
}

/**
 * Which URLs crawlers are fetching, and which agents reached each one.
 *
 * The actionable column is `agents`. A page that Googlebot reads weekly and
 * GPTBot has never touched is a page that can rank and cannot be cited, and that
 * distinction is invisible in any conventional analytics product.
 */
export async function crawlerPages(days: number, limit = 40): Promise<MetricResult<Array<{
  page: string;
  hits: number;
  agents: string;
  lastSeen: string | null;
}>>> {
  const since = rangeStart(days);
  const rows = await prisma.$queryRaw<Array<{
    page: string | null; hits: bigint; agents: string | null; last: Date | null;
  }>>`
    SELECT e."pageUrl" AS page,
           COUNT(*)::bigint AS hits,
           STRING_AGG(DISTINCT e."browser", ', ' ORDER BY e."browser") AS agents,
           MAX(e."occurredAt") AS last
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."name" = 'crawler_fetch' AND e."pageUrl" IS NOT NULL
    GROUP BY 1 ORDER BY hits DESC LIMIT ${limit}
  `;
  return {
    rolledUp: false,
    data: rows.map((r) => ({
      page: r.page ?? '—',
      hits: Number(r.hits),
      agents: r.agents ?? '—',
      lastSeen: r.last?.toISOString() ?? null,
    })),
  };
}
