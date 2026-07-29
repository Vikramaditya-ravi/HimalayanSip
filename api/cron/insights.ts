import { Prisma } from '@prisma/client';
import { authorizeCron } from '../../lib/cron.js';
import { prisma } from '../../lib/db.js';
import { runDetectors } from '../../lib/detectors.js';
import type { ApiRequest, ApiResponse } from '../../lib/http.js';
import { narrate } from '../../lib/narrate.js';
import { systemContext, track } from '../../lib/track.js';

/**
 * events -> detectors -> narrator -> insight rows -> dashboard cards.
 *
 * One row per (day, detector), unique-constrained, so re-running the job
 * refreshes today's insights rather than duplicating them.
 */

// 60s is the Vercel Hobby ceiling; raise to 300 on Pro if a backfill ever needs it.
// A normal nightly rollup over this data volume finishes in well under a second.
export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const auth = authorizeCron(req);
  if (!auth.ok) {
    console.error(`[cron/insights] refused: ${auth.reason}`);
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const findings = await runDetectors();
    const narrated = await narrate(findings);

    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);

    for (const f of narrated) {
      await prisma.insight.upsert({
        where: { day_detector: { day, detector: f.detector } },
        create: {
          day,
          detector: f.detector,
          severity: f.severity,
          category: f.category,
          title: f.title,
          metric: f.metric as Prisma.InputJsonValue,
          narrative: f.narrative,
        },
        update: {
          severity: f.severity,
          category: f.category,
          title: f.title,
          metric: f.metric as Prisma.InputJsonValue,
          narrative: f.narrative,
        },
      });
    }

    await track(
      'insights_generated',
      {
        props: {
          findings: narrated.length,
          critical: narrated.filter((f) => f.severity === 'critical').length,
          narrated: Boolean(process.env.ANTHROPIC_API_KEY),
        },
      },
      systemContext(),
    );

    res.status(200).json({ ok: true, findings: narrated.length });
  } catch (err) {
    console.error('[cron/insights] failed', err);
    res.status(500).json({ error: 'insights_failed' });
  }
}
