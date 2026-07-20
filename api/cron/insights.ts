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

/** Critical findings are pushed at most once per detector per week. */
const NOTIFY_COOLDOWN_DAYS = 7;

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

    const notified = await notifyCritical(narrated);

    await track(
      'insights_generated',
      {
        props: {
          findings: narrated.length,
          critical: narrated.filter((f) => f.severity === 'critical').length,
          notified,
          narrated: Boolean(process.env.ANTHROPIC_API_KEY),
        },
      },
      systemContext(),
    );

    res.status(200).json({ ok: true, findings: narrated.length, notified });
  } catch (err) {
    console.error('[cron/insights] failed', err);
    res.status(500).json({ error: 'insights_failed' });
  }
}

/**
 * Push critical findings, deduped to once per detector per week.
 *
 * Without the cooldown a persistent problem would send the same alert every
 * night until it was fixed, which is the fastest way to teach someone to ignore
 * their own alerts.
 */
async function notifyCritical(findings: Array<{ detector: string; severity: string; title: string; narrative: string }>): Promise<number> {
  const critical = findings.filter((f) => f.severity === 'critical');
  if (critical.length === 0) return 0;

  const cutoff = new Date(Date.now() - NOTIFY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  let sent = 0;

  for (const f of critical) {
    const recent = await prisma.insight.findFirst({
      where: { detector: f.detector, notifiedAt: { gte: cutoff } },
      select: { id: true },
    });
    if (recent) continue;

    const ok = await send(f.title, f.narrative);
    if (!ok) continue;

    await prisma.insight.updateMany({
      where: { detector: f.detector, notifiedAt: null },
      data: { notifiedAt: new Date() },
    });
    sent += 1;
  }

  return sent;
}

/** Delivery via Web3Forms, reusing the key the lead endpoint already needs. */
async function send(title: string, body: string): Promise<boolean> {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) return false;
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: `AquaVia analytics: ${title}`,
        message: body,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[insights] notification failed', err);
    return false;
  }
}
