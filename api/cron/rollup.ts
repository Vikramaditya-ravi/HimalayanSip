import { authorizeCron } from '../../lib/cron.js';
import type { ApiRequest, ApiResponse } from '../../lib/http.js';
import { runRollup } from '../../lib/rollup.js';
import { systemContext, track } from '../../lib/track.js';

/**
 * Nightly rollup + retention prune.
 *
 * `?days=N` runs a backfill over the last N days and SKIPS pruning — a backfill
 * exists to rebuild derived tables, and deleting its own input mid-run would make
 * the next backfill produce less data than this one.
 */

// 60s is the Vercel Hobby ceiling; raise to 300 on Pro if a backfill ever needs it.
// A normal nightly rollup over this data volume finishes in well under a second.
export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const auth = authorizeCron(req);
  if (!auth.ok) {
    console.error(`[cron/rollup] refused: ${auth.reason}`);
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const rawDays = Array.isArray(req.query.days) ? req.query.days[0] : req.query.days;
  const backfill = rawDays !== undefined;
  const days = Math.min(Math.max(Number(rawDays) || 2, 1), 730);

  try {
    const result = await runRollup(days, { prune: !backfill });

    // Infrastructure reporting on itself. A stalled rollup and a quiet fortnight
    // produce identical dashboards — the ABSENCE of this event is the alarm, and
    // the dashboard raises a banner when it goes missing for 36 hours.
    await track('rollup_completed', { props: { ...result, backfill } }, systemContext());

    if (result.pruned > 0) {
      await track('events_pruned', { props: { deleted: result.pruned } }, systemContext());
    }

    res.status(200).json({ ok: true, backfill, ...result });
  } catch (err) {
    console.error('[cron/rollup] failed', err);
    // Deliberately NOT emitting rollup_completed here. A failed run must leave no
    // trace of success, so the staleness banner fires.
    res.status(500).json({ error: 'rollup_failed' });
  }
}
