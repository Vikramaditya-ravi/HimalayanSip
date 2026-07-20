import type { ApiRequest, ApiResponse } from '../../lib/http.js';
import { requireAdmin } from '../../lib/identity.js';
import * as m from '../../lib/metrics.js';

/**
 * Read API. GET /api/analytics/<metric>?days=N
 *
 * Behind the same auth as the dashboard. Every response carries `rolledUp`, so a
 * consumer can always tell whether it is looking at exact numbers or upper bounds.
 */

export const config = { runtime: 'nodejs' };

/**
 * Closed set of metric handlers. The URL selects a key in this map — it is never
 * used to build SQL, so there is no path from user input to a query.
 */
const HANDLERS = {
  overview: (days: number) => m.overview(days),
  traffic: (days: number) => m.trafficTrend(days),
  pages: (days: number) => m.topPages(days),
  // Fixed dimension keys, each mapped to a literal column inside metrics.ts.
  devices: (days: number) => m.dimensionBreakdown('device', days, 10),
  browsers: (days: number) => m.dimensionBreakdown('browser', days, 10),
  os: (days: number) => m.dimensionBreakdown('os', days, 10),
  countries: (days: number) => m.dimensionBreakdown('country', days, 15),
  cities: (days: number) => m.dimensionBreakdown('city', days, 15),
  funnel: (days: number) => m.funnel(days),
  intents: (days: number) => m.contactIntentSplit(days),
  sources: (days: number) => m.revenueBySource(days),
  velocity: (days: number) => m.velocity(days),
  depth: (days: number) => m.depth(days),
  retention: (days: number) => m.retention(days),
  search: (days: number) => m.searchQueries(days),
  products: (days: number) => m.productPerformance(days),
  live: () => m.liveVisitors(),
  recent: () => m.recentEvents(100),
  insights: () => m.latestInsights(),
  health: () => m.infraHealth(),
} as const;

type MetricKey = keyof typeof HANDLERS;

function isMetric(v: unknown): v is MetricKey {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(HANDLERS, v);
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const raw = req.query.metric;
  const metric = Array.isArray(raw) ? raw[0] : raw;

  if (!isMetric(metric)) {
    res.status(404).json({ error: 'unknown_metric', available: Object.keys(HANDLERS) });
    return;
  }

  const days = m.clampDays(Array.isArray(req.query.days) ? req.query.days[0] : req.query.days);

  try {
    const result = await HANDLERS[metric](days);
    res.status(200).json({
      metric,
      days,
      // Never let an estimate look like a fact: the client renders an
      // "approximate data" banner whenever this is true.
      rolledUp: result.rolledUp,
      retentionDays: m.retentionDays(),
      data: result.data,
    });
  } catch (err) {
    console.error(`[analytics] metric "${metric}" failed`, err);
    res.status(500).json({ error: 'metric_failed' });
  }
}

/** BigInt values from raw SQL are converted at the metric layer, but guard the
 *  serializer anyway — an unconverted BigInt would otherwise throw inside
 *  res.json() and turn a dashboard tile into a 500. */
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function toJSON(this: bigint) {
  return this.toString();
};
