import { clientIp } from '../lib/geo.js';
import { type ApiRequest, type ApiResponse, readJsonBody } from '../lib/http.js';
import { rateLimit } from '../lib/ratelimit.js';
import { contextFromRequest, track } from '../lib/track.js';
import { parseUA } from '../lib/ua.js';

/**
 * Crawler hit ingest.
 *
 * The gap this closes: every existing metric on this site is built from events
 * the CLIENT tracker emits, and crawlers do not execute JavaScript. GPTBot,
 * ClaudeBot, PerplexityBot and CCBot could fetch every page on the site every
 * day and the dashboard would show nothing at all — the one class of traffic
 * this whole programme is aimed at was the one class it could not measure.
 *
 * So the observation happens at the edge instead. middleware.js already runs on
 * every document request; when the user-agent is a bot it fires a
 * non-blocking request here through `waitUntil`, and this writes the row.
 *
 * Deliberately NOT in CLIENT_EMITTABLE: `crawler_fetch` is server truth. A
 * browser that could post it would be able to invent an AI-crawler visit, which
 * is exactly the number someone would be tempted to inflate.
 *
 * No new table. The Event model already carries name, pageUrl, device and
 * browser, and every existing metric filters on NOT_BOT (see lib/metrics.ts), so
 * these rows are invisible to the visitor dashboards by construction rather than
 * by remembering to exclude them.
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  // A crawler sweeping the site hits every URL in quick succession, which is
  // normal and should be recorded — but the ceiling stops a broken loop or a
  // spoofed caller from filling the table. Higher than the lead limit for that
  // reason.
  if (!rateLimit(`crawl:${clientIp(req.headers)}`, 240)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }

  const body = readJsonBody(req) as Record<string, unknown> | null;
  const ua = typeof body?.ua === 'string' ? body.ua : '';
  const path = typeof body?.path === 'string' ? body.path.slice(0, 512) : null;

  const { device, browser } = parseUA(ua);

  // Only bots are recorded. The middleware already checks this; re-checking here
  // means a stray call cannot inject a human pageview under a bot's name, and
  // costs one regex.
  if (device !== 'bot') {
    res.status(204).end();
    return;
  }

  const ctx = contextFromRequest(req, 'server');

  await track(
    'crawler_fetch',
    {
      pageUrl: path,
      props: {
        // The normalised agent name from lib/ua.ts — gptbot, claudebot,
        // perplexitybot, ccbot, googlebot, bingbot, applebot… This is the
        // column the admin panel groups by.
        agent: browser,
        path,
        // Full UA kept for the agents parseUA does not yet name, so a new
        // crawler shows up as an unrecognised string rather than not at all.
        ua: ua.slice(0, 300),
      },
    },
    // device is forced to 'bot' so these rows are excluded from every visitor
    // metric by the NOT_BOT filter that already guards them.
    { ...ctx, device: 'bot', browser },
  );

  res.status(204).end();
}
