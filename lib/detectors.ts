import { Prisma } from '@prisma/client';
import { prisma } from './db.js';
import { NOT_BOT, PUBLIC_TRAFFIC } from './metrics.js';

/**
 * Detectors — pure SQL.
 *
 * Every finding here is produced by a query and carries numeric evidence. The
 * LLM downstream ranks and narrates these findings; it NEVER computes a number.
 * That split is the whole design: SQL is auditable and deterministic, prose is
 * not, and a dashboard that quietly invents a percentage is worse than one that
 * says nothing at all.
 */

const raw = (s: string) => Prisma.raw(s);

export type Severity = 'info' | 'warning' | 'critical';

export interface Finding {
  detector: string;
  severity: Severity;
  category: string;
  title: string;
  /** Numeric evidence. The narration may only restate these values. */
  metric: Record<string, number | string | null>;
}

type DetectorFn = () => Promise<Finding[]>;

// ---------------------------------------------------------------------------

/** Searches that returned nothing — demand the site cannot currently serve. */
const zeroResultSearches: DetectorFn = async () => {
  const rows = await prisma.$queryRaw<Array<{ query: string; searches: bigint; visitors: bigint }>>`
    SELECT e."queryText" AS query,
           COUNT(*)::bigint AS searches,
           COUNT(DISTINCT e."visitorId")::bigint AS visitors
    FROM "Event" e
    WHERE e."occurredAt" >= NOW() - INTERVAL '7 days'
      AND e."name" = 'search_zero_results'
      AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY e."queryText"
    HAVING COUNT(*) >= 2
    ORDER BY searches DESC
    LIMIT 5
  `;
  return rows.map((r) => ({
    detector: `zero_result_search:${r.query}`,
    severity: (Number(r.visitors) >= 3 ? 'warning' : 'info') as Severity,
    category: 'demand',
    title: `"${r.query}" returned no results`,
    metric: {
      query: r.query,
      searches: Number(r.searches),
      distinctVisitors: Number(r.visitors),
      windowDays: 7,
    },
  }));
};

/** Week-over-week traffic change. */
const trafficShift: DetectorFn = async () => {
  const [row] = await prisma.$queryRaw<Array<{ current: bigint; previous: bigint }>>`
    SELECT
      COUNT(DISTINCT e."visitorId") FILTER (WHERE e."occurredAt" >= NOW() - INTERVAL '7 days')::bigint AS current,
      COUNT(DISTINCT e."visitorId") FILTER (
        WHERE e."occurredAt" >= NOW() - INTERVAL '14 days' AND e."occurredAt" < NOW() - INTERVAL '7 days'
      )::bigint AS previous
    FROM "Event" e
    WHERE e."occurredAt" >= NOW() - INTERVAL '14 days' AND ${raw(PUBLIC_TRAFFIC)}
  `;
  const current = Number(row?.current ?? 0);
  const previous = Number(row?.previous ?? 0);
  // Below this, week-over-week percentages are noise dressed up as signal.
  if (previous < 10) return [];

  const changePct = ((current - previous) / previous) * 100;
  if (Math.abs(changePct) < 25) return [];

  return [{
    detector: 'traffic_shift',
    severity: (changePct < -40 ? 'critical' : changePct < 0 ? 'warning' : 'info') as Severity,
    category: 'traffic',
    title: changePct < 0 ? 'Visitors down week over week' : 'Visitors up week over week',
    metric: {
      currentWeekVisitors: current,
      previousWeekVisitors: previous,
      changePct: Number(changePct.toFixed(1)),
    },
  }];
};

/** The largest drop between consecutive funnel steps. */
const funnelLeak: DetectorFn = async () => {
  const rows = await prisma.$queryRaw<Array<{ name: string; sessions: bigint }>>`
    SELECT e."name", COUNT(DISTINCT e."sessionId")::bigint AS sessions
    FROM "Event" e
    WHERE e."occurredAt" >= NOW() - INTERVAL '14 days'
      AND e."name" IN ('page_viewed','contact_form_viewed','contact_form_started','lead_submitted')
      AND ${raw(NOT_BOT)}
    GROUP BY e."name"
  `;
  const by = new Map(rows.map((r) => [r.name, Number(r.sessions)]));
  const steps: Array<[string, string]> = [
    ['page_viewed', 'contact_form_viewed'],
    ['contact_form_viewed', 'contact_form_started'],
    ['contact_form_started', 'lead_submitted'],
  ];

  let worst: Finding | null = null;
  for (const [from, to] of steps) {
    const a = by.get(from) ?? 0;
    const b = by.get(to) ?? 0;
    if (a < 10) continue;
    const dropPct = ((a - b) / a) * 100;
    if (!worst || dropPct > Number(worst.metric.dropPct)) {
      worst = {
        detector: 'funnel_leak',
        severity: (dropPct > 90 ? 'warning' : 'info') as Severity,
        category: 'conversion',
        title: `Largest funnel drop: ${from} to ${to}`,
        metric: {
          fromStep: from,
          toStep: to,
          fromSessions: a,
          toSessions: b,
          dropPct: Number(dropPct.toFixed(1)),
          windowDays: 14,
        },
      };
    }
  }
  return worst ? [worst] : [];
};

/** Traffic sources sending real volume but producing no enquiries. */
const unproductiveSources: DetectorFn = async () => {
  const rows = await prisma.$queryRaw<Array<{ source: string; sessions: bigint; conversions: bigint }>>`
    WITH session_source AS (
      SELECT e."sessionId" AS sid,
             (ARRAY_AGG(COALESCE(e."utmSource", e."referrer", 'direct') ORDER BY e."occurredAt"))[1] AS source,
             COUNT(*) FILTER (WHERE e."name" = 'lead_submitted') > 0 AS converted
      FROM "Event" e
      WHERE e."occurredAt" >= NOW() - INTERVAL '30 days'
        AND e."sessionId" IS NOT NULL AND ${raw(NOT_BOT)}
      GROUP BY e."sessionId"
    )
    SELECT source, COUNT(*)::bigint AS sessions,
           COUNT(*) FILTER (WHERE converted)::bigint AS conversions
    FROM session_source
    GROUP BY source
    HAVING COUNT(*) >= 20 AND COUNT(*) FILTER (WHERE converted) = 0
    ORDER BY sessions DESC
    LIMIT 3
  `;
  return rows.map((r) => ({
    detector: `unproductive_source:${r.source}`,
    severity: 'warning' as Severity,
    category: 'acquisition',
    title: `${r.source} sent traffic but no enquiries`,
    metric: {
      source: r.source,
      sessions: Number(r.sessions),
      conversions: 0,
      windowDays: 30,
    },
  }));
};

/** Bottle sizes people look at but never click through on. */
const productInterestGap: DetectorFn = async () => {
  const rows = await prisma.$queryRaw<Array<{ sku: string; views: bigint; clicks: bigint }>>`
    SELECT e."productSku" AS sku,
           COUNT(*) FILTER (WHERE e."name" = 'product_viewed')::bigint AS views,
           COUNT(*) FILTER (WHERE e."name" = 'product_cta_clicked')::bigint AS clicks
    FROM "Event" e
    WHERE e."occurredAt" >= NOW() - INTERVAL '30 days'
      AND e."productSku" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY e."productSku"
    HAVING COUNT(*) FILTER (WHERE e."name" = 'product_viewed') >= 30
       AND COUNT(*) FILTER (WHERE e."name" = 'product_cta_clicked') = 0
    ORDER BY views DESC
    LIMIT 3
  `;
  return rows.map((r) => ({
    detector: `product_interest_gap:${r.sku}`,
    severity: 'info' as Severity,
    category: 'product',
    title: `${r.sku} viewed but never clicked`,
    metric: { productSku: r.sku, views: Number(r.views), ctaClicks: 0, windowDays: 30 },
  }));
};

/** Mobile converting materially worse than desktop. */
const mobileGap: DetectorFn = async () => {
  const rows = await prisma.$queryRaw<Array<{ device: string; sessions: bigint; conversions: bigint }>>`
    WITH per_session AS (
      SELECT e."sessionId" AS sid,
             MIN(e."device") AS device,
             COUNT(*) FILTER (WHERE e."name" = 'lead_submitted') > 0 AS converted
      FROM "Event" e
      WHERE e."occurredAt" >= NOW() - INTERVAL '30 days'
        AND e."sessionId" IS NOT NULL AND ${raw(NOT_BOT)}
      GROUP BY e."sessionId"
    )
    SELECT device, COUNT(*)::bigint AS sessions, COUNT(*) FILTER (WHERE converted)::bigint AS conversions
    FROM per_session WHERE device IN ('mobile','desktop') GROUP BY device
  `;
  const by = new Map(rows.map((r) => [r.device, { s: Number(r.sessions), c: Number(r.conversions) }]));
  const m = by.get('mobile');
  const d = by.get('desktop');
  if (!m || !d || m.s < 30 || d.s < 30) return [];

  const mRate = m.c / m.s;
  const dRate = d.c / d.s;
  if (dRate === 0 || mRate >= dRate * 0.6) return [];

  return [{
    detector: 'mobile_conversion_gap',
    severity: 'warning' as Severity,
    category: 'conversion',
    title: 'Mobile converts well below desktop',
    metric: {
      mobileSessions: m.s,
      mobileConversions: m.c,
      mobileRatePct: Number((mRate * 100).toFixed(2)),
      desktopSessions: d.s,
      desktopConversions: d.c,
      desktopRatePct: Number((dRate * 100).toFixed(2)),
      windowDays: 30,
    },
  }];
};

/** Bot traffic large enough to distort a casual read of the raw numbers. */
const botSurge: DetectorFn = async () => {
  const [row] = await prisma.$queryRaw<Array<{ bots: bigint; total: bigint }>>`
    SELECT COUNT(*) FILTER (WHERE e."device" = 'bot')::bigint AS bots,
           COUNT(*)::bigint AS total
    FROM "Event" e WHERE e."occurredAt" >= NOW() - INTERVAL '7 days'
  `;
  const bots = Number(row?.bots ?? 0);
  const total = Number(row?.total ?? 0);
  if (total < 200) return [];
  const share = (bots / total) * 100;
  if (share < 40) return [];

  return [{
    detector: 'bot_surge',
    severity: 'info' as Severity,
    category: 'data-quality',
    title: 'Large share of traffic is automated',
    metric: { botEvents: bots, totalEvents: total, botSharePct: Number(share.toFixed(1)), windowDays: 7 },
  }];
};

const DETECTORS: DetectorFn[] = [
  zeroResultSearches,
  trafficShift,
  funnelLeak,
  unproductiveSources,
  productInterestGap,
  mobileGap,
  botSurge,
];

/** Run every detector. One failing detector must not sink the run. */
export async function runDetectors(): Promise<Finding[]> {
  const results = await Promise.allSettled(DETECTORS.map((d) => d()));
  const findings: Finding[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') findings.push(...r.value);
    else console.error('[detectors] one detector failed', r.reason);
  }
  const rank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  return findings.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
