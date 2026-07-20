import { Prisma } from '@prisma/client';
import { ENGAGEMENT_EVENTS } from '../src/analytics/catalog.js';
import { prisma } from './db.js';
import { NOT_BOT, PUBLIC_TRAFFIC, retentionDays } from './metrics.js';

/**
 * Nightly rollups.
 *
 * Raw events are the source of truth for a bounded window; these derived tables
 * are kept forever. Every statement is ON CONFLICT DO UPDATE, so the job is fully
 * idempotent — safe to re-run, safe to backfill, safe to run twice because a cron
 * fired twice.
 *
 * THE SQL BELOW MIRRORS lib/metrics.ts 1:1. If you change a definition there —
 * what counts as engagement, what a bounce is, which actors are public — change
 * it here in the same commit. Drift between the two produces a dashboard whose
 * numbers change when a date range crosses the retention boundary, which is the
 * hardest class of analytics bug to notice and to explain.
 */

const raw = (s: string) => Prisma.raw(s);
const engagementList = Prisma.join(ENGAGEMENT_EVENTS.map((e) => Prisma.sql`${e}`));

export interface RollupResult {
  days: number;
  eventDaily: number;
  dimensionDaily: number;
  productDaily: number;
  sourceDaily: number;
  searchDaily: number;
  pruned: number;
  durationMs: number;
}

function startOfDayUTC(daysAgo: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Run the rollup for the last `days` days.
 *
 * Steps run SEQUENTIALLY, not in parallel. Neon's pooled connection limit is
 * small, and five concurrent aggregate scans would exhaust it and fail the whole
 * job rather than merely running slower.
 */
export async function runRollup(days: number, { prune = true }: { prune?: boolean } = {}): Promise<RollupResult> {
  const started = Date.now();
  const since = startOfDayUTC(days);

  const eventDaily = await rollupEventDaily(since);
  const dimensionDaily = await rollupDimensionDaily(since);
  const productDaily = await rollupProductDaily(since);
  const sourceDaily = await rollupSourceDaily(since);
  const searchDaily = await rollupSearchDaily(since);

  // Backfill runs must never prune: they exist to rebuild history, and deleting
  // the raw rows mid-rebuild would destroy the input for the next backfill.
  const pruned = prune ? await pruneEvents() : 0;

  return {
    days,
    eventDaily,
    dimensionDaily,
    productDaily,
    sourceDaily,
    searchDaily,
    pruned,
    durationMs: Date.now() - started,
  };
}

/**
 * Per-name daily counts, plus a synthetic `__all__` row.
 *
 * The `__all__` row exists because per-name unique counts are NOT summable:
 * summing distinct visitors across `page_viewed` and `product_viewed` counts
 * anyone who did both twice. Total uniques have to be computed once, over all
 * events, and stored separately.
 */
async function rollupEventDaily(since: Date): Promise<number> {
  const perName = await prisma.$executeRaw`
    INSERT INTO "EventDaily" ("day", "name", "events", "visitors", "sessions", "bounced")
    SELECT
      DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date AS day,
      e."name",
      COUNT(*)::int,
      COUNT(DISTINCT e."visitorId")::int,
      COUNT(DISTINCT e."sessionId")::int,
      0
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY 1, 2
    ON CONFLICT ("day", "name") DO UPDATE SET
      "events" = EXCLUDED."events",
      "visitors" = EXCLUDED."visitors",
      "sessions" = EXCLUDED."sessions"
  `;

  // The bounce definition here is a copy of the one in lib/metrics.ts:
  // <= 1 page view AND no engagement event.
  const allRow = await prisma.$executeRaw`
    INSERT INTO "EventDaily" ("day", "name", "events", "visitors", "sessions", "bounced")
    WITH sessions AS (
      SELECT
        DATE_TRUNC('day', MIN(e."occurredAt") AT TIME ZONE 'UTC')::date AS day,
        e."sessionId" AS sid,
        COUNT(*) FILTER (WHERE e."name" = 'page_viewed') AS page_views,
        COUNT(*) FILTER (WHERE e."name" IN (${engagementList})) AS engagements
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND e."sessionId" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
      GROUP BY e."sessionId"
    ),
    totals AS (
      SELECT
        DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date AS day,
        COUNT(*)::int AS events,
        COUNT(DISTINCT e."visitorId")::int AS visitors,
        COUNT(DISTINCT e."sessionId")::int AS sessions
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)}
      GROUP BY 1
    ),
    bounces AS (
      SELECT day, COUNT(*) FILTER (WHERE page_views <= 1 AND engagements = 0)::int AS bounced
      FROM sessions GROUP BY day
    )
    SELECT t.day, '__all__', t.events, t.visitors, t.sessions, COALESCE(b.bounced, 0)
    FROM totals t LEFT JOIN bounces b ON b.day = t.day
    ON CONFLICT ("day", "name") DO UPDATE SET
      "events" = EXCLUDED."events",
      "visitors" = EXCLUDED."visitors",
      "sessions" = EXCLUDED."sessions",
      "bounced" = EXCLUDED."bounced"
  `;

  return perName + allRow;
}

/** One table for device/browser/os/country/city/page, filled in a single pass. */
async function rollupDimensionDaily(since: Date): Promise<number> {
  return prisma.$executeRaw`
    INSERT INTO "DimensionDaily" ("day", "dimension", "value", "sessions", "events")
    SELECT day, dimension, value, COUNT(DISTINCT sid)::int, SUM(n)::int
    FROM (
      SELECT DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date AS day, 'device' AS dimension,
             e."device" AS value, e."sessionId" AS sid, COUNT(*) AS n
      FROM "Event" e WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND e."device" IS NOT NULL
      GROUP BY 1,2,3,4
      UNION ALL
      SELECT DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date, 'browser', e."browser", e."sessionId", COUNT(*)
      FROM "Event" e WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND e."browser" IS NOT NULL
      GROUP BY 1,2,3,4
      UNION ALL
      SELECT DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date, 'os', e."os", e."sessionId", COUNT(*)
      FROM "Event" e WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND e."os" IS NOT NULL
      GROUP BY 1,2,3,4
      UNION ALL
      SELECT DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date, 'country', e."country", e."sessionId", COUNT(*)
      FROM "Event" e WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND e."country" IS NOT NULL
      GROUP BY 1,2,3,4
      UNION ALL
      SELECT DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date, 'city', e."city", e."sessionId", COUNT(*)
      FROM "Event" e WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND e."city" IS NOT NULL
      GROUP BY 1,2,3,4
      UNION ALL
      SELECT DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date, 'page', e."pageUrl", e."sessionId", COUNT(*)
      FROM "Event" e WHERE e."occurredAt" >= ${since} AND ${raw(PUBLIC_TRAFFIC)} AND e."pageUrl" IS NOT NULL
      GROUP BY 1,2,3,4
    ) unioned
    GROUP BY day, dimension, value
    ON CONFLICT ("day", "dimension", "value") DO UPDATE SET
      "sessions" = EXCLUDED."sessions",
      "events" = EXCLUDED."events"
  `;
}

async function rollupProductDaily(since: Date): Promise<number> {
  return prisma.$executeRaw`
    INSERT INTO "ProductDaily" ("day", "productSku", "views", "ctaClicks", "sessions")
    SELECT
      DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date,
      e."productSku",
      COUNT(*) FILTER (WHERE e."name" = 'product_viewed')::int,
      COUNT(*) FILTER (WHERE e."name" = 'product_cta_clicked')::int,
      COUNT(DISTINCT e."sessionId")::int
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."productSku" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY 1, 2
    ON CONFLICT ("day", "productSku") DO UPDATE SET
      "views" = EXCLUDED."views",
      "ctaClicks" = EXCLUDED."ctaClicks",
      "sessions" = EXCLUDED."sessions"
  `;
}

/**
 * Sessions, conversions and revenue per first-touch source.
 *
 * First touch is taken with ARRAY_AGG(... ORDER BY occurredAt)[1], matching
 * lib/metrics.ts exactly — never the most recent value.
 */
async function rollupSourceDaily(since: Date): Promise<number> {
  return prisma.$executeRaw`
    INSERT INTO "SourceDaily" ("day", "source", "medium", "campaign", "sessions", "conversions", "revenue")
    WITH session_first AS (
      SELECT
        DATE_TRUNC('day', MIN(e."occurredAt") AT TIME ZONE 'UTC')::date AS day,
        e."sessionId" AS sid,
        (ARRAY_AGG(COALESCE(e."utmSource", e."referrer", 'direct') ORDER BY e."occurredAt"))[1] AS source,
        (ARRAY_AGG(COALESCE(e."utmMedium", '(none)') ORDER BY e."occurredAt"))[1] AS medium,
        (ARRAY_AGG(COALESCE(e."utmCampaign", '(none)') ORDER BY e."occurredAt"))[1] AS campaign
      FROM "Event" e
      WHERE e."occurredAt" >= ${since} AND e."sessionId" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
      GROUP BY e."sessionId"
    ),
    lead_first AS (
      SELECT
        e."leadId" AS lead_id,
        (ARRAY_AGG(COALESCE(e."utmSource", e."referrer", 'direct') ORDER BY e."occurredAt"))[1] AS source,
        (ARRAY_AGG(COALESCE(e."utmMedium", '(none)') ORDER BY e."occurredAt"))[1] AS medium,
        (ARRAY_AGG(COALESCE(e."utmCampaign", '(none)') ORDER BY e."occurredAt"))[1] AS campaign
      FROM "Event" e WHERE e."leadId" IS NOT NULL GROUP BY e."leadId"
    ),
    traffic AS (
      SELECT day, source, medium, campaign, COUNT(*)::int AS sessions
      FROM session_first GROUP BY 1,2,3,4
    ),
    money AS (
      SELECT
        DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date AS day,
        lf.source, lf.medium, lf.campaign,
        COUNT(*) FILTER (WHERE e."name" = 'lead_submitted')::int AS conversions,
        COALESCE(SUM((e."props"->>'value')::numeric) FILTER (WHERE e."name" = 'lead_won'), 0) AS revenue
      FROM "Event" e
      JOIN lead_first lf ON lf.lead_id = e."leadId"
      WHERE e."occurredAt" >= ${since} AND e."name" IN ('lead_submitted', 'lead_won')
      GROUP BY 1,2,3,4
    )
    SELECT
      COALESCE(t.day, m.day),
      COALESCE(t.source, m.source),
      COALESCE(t.medium, m.medium),
      COALESCE(t.campaign, m.campaign),
      COALESCE(t.sessions, 0),
      COALESCE(m.conversions, 0),
      COALESCE(m.revenue, 0)
    FROM traffic t
    FULL OUTER JOIN money m
      ON m.day = t.day AND m.source = t.source AND m.medium = t.medium AND m.campaign = t.campaign
    ON CONFLICT ("day", "source", "medium", "campaign") DO UPDATE SET
      "sessions" = EXCLUDED."sessions",
      "conversions" = EXCLUDED."conversions",
      "revenue" = EXCLUDED."revenue"
  `;
}

async function rollupSearchDaily(since: Date): Promise<number> {
  return prisma.$executeRaw`
    INSERT INTO "SearchDaily" ("day", "query", "searches", "zeroResults", "clicks")
    SELECT
      DATE_TRUNC('day', e."occurredAt" AT TIME ZONE 'UTC')::date,
      e."queryText",
      COUNT(*) FILTER (WHERE e."name" = 'search_performed')::int,
      COUNT(*) FILTER (WHERE e."name" = 'search_zero_results')::int,
      COUNT(*) FILTER (WHERE e."name" = 'search_result_clicked')::int
    FROM "Event" e
    WHERE e."occurredAt" >= ${since} AND e."queryText" IS NOT NULL AND ${raw(PUBLIC_TRAFFIC)}
    GROUP BY 1, 2
    ON CONFLICT ("day", "query") DO UPDATE SET
      "searches" = EXCLUDED."searches",
      "zeroResults" = EXCLUDED."zeroResults",
      "clicks" = EXCLUDED."clicks"
  `;
}

const PRUNE_BATCH = 5000;
const PRUNE_MAX_PER_RUN = 200_000;

/**
 * Delete raw events past the retention cutoff, in batches.
 *
 * Batched because a single unbounded DELETE over months of rows takes a lock long
 * enough to time out the function and roll back, leaving nothing pruned — the job
 * then fails identically every night while the table grows.
 */
async function pruneEvents(): Promise<number> {
  const cutoff = startOfDayUTC(retentionDays());
  let deleted = 0;

  while (deleted < PRUNE_MAX_PER_RUN) {
    const n = await prisma.$executeRaw`
      DELETE FROM "Event"
      WHERE "id" IN (
        SELECT "id" FROM "Event" WHERE "occurredAt" < ${cutoff} LIMIT ${PRUNE_BATCH}
      )
    `;
    deleted += n;
    if (n < PRUNE_BATCH) break;
  }

  return deleted;
}
