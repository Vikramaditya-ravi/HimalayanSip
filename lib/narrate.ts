import Anthropic from '@anthropic-ai/sdk';
import type { Finding } from './detectors.js';

/**
 * Narration.
 *
 * The model's ONLY job is to rank and write up findings the SQL already
 * produced. It never computes a number, never estimates, never infers a trend
 * that isn't in the evidence. Every figure in the prose must be one that
 * appears verbatim in `metric`.
 *
 * That constraint is the reason this layer is safe to put on a dashboard: the
 * numbers are auditable SQL, and the prose is only a reading of them. Without
 * it, an LLM that confidently invents "conversions fell 23%" is worse than no
 * insights layer at all.
 *
 * Degrades to templated prose with no API key or on outage — an insights panel
 * that disappears when a vendor has a bad day trains people to ignore it.
 */

const MODEL = 'claude-opus-4-8';

export interface NarratedFinding extends Finding {
  narrative: string;
  rank: number;
}

const SYSTEM = `You write short analytics briefings for the owner of AquaVia, a
small B2B business in Delhi NCR that sells custom-branded bottled water.

You are given findings produced by SQL queries over a first-party event stream.
Each finding carries a "metric" object containing its numeric evidence.

Rules, in order of importance:

1. NEVER compute, estimate, derive, or infer any number. You may only restate
   numbers that appear verbatim in a finding's "metric" object. Do not add
   percentages, ratios, totals, projections, or comparisons that are not already
   there. If a number you want does not exist in the evidence, do not use it.
2. Never speculate about causes as though they were established. Write "worth
   checking whether..." rather than "this happened because...".
3. Rank findings by what would actually change a decision for a small business
   owner, not by how dramatic they sound.
4. Two or three sentences per finding. Plain language. No jargon, no bullet
   points, no headings.
5. Say what to do about it when there is an obvious next step, and say nothing
   when there isn't.

Return one entry per finding you were given, in your ranked order.`;

function templated(f: Finding): string {
  const m = f.metric;
  switch (true) {
    case f.detector.startsWith('zero_result_search'):
      return `${m.searches} searches for "${m.query}" from ${m.distinctVisitors} visitors returned nothing in the last ${m.windowDays} days. Worth checking whether this is something you can supply.`;
    case f.detector === 'traffic_shift':
      return `Visitors went from ${m.previousWeekVisitors} last week to ${m.currentWeekVisitors} this week, a change of ${m.changePct}%.`;
    case f.detector === 'funnel_leak':
      return `The biggest drop-off is between ${m.fromStep} and ${m.toStep}: ${m.fromSessions} sessions down to ${m.toSessions}, a ${m.dropPct}% drop over ${m.windowDays} days.`;
    case f.detector.startsWith('unproductive_source'):
      return `${m.source} sent ${m.sessions} sessions in the last ${m.windowDays} days and produced no enquiries.`;
    case f.detector.startsWith('product_interest_gap'):
      return `${m.productSku} was viewed ${m.views} times in ${m.windowDays} days with no "Order Now" clicks.`;
    case f.detector === 'mobile_conversion_gap':
      return `Mobile converted ${m.mobileRatePct}% across ${m.mobileSessions} sessions, against ${m.desktopRatePct}% on desktop across ${m.desktopSessions}.`;
    case f.detector === 'bot_surge':
      return `${m.botSharePct}% of raw events in the last ${m.windowDays} days came from bots. Dashboard figures already exclude them.`;
    default:
      return f.title;
  }
}

/** Fallback path: preserves ordering and evidence, just without the prose. */
function fallback(findings: Finding[]): NarratedFinding[] {
  return findings.map((f, i) => ({ ...f, rank: i, narrative: templated(f) }));
}

export async function narrate(findings: Finding[]): Promise<NarratedFinding[]> {
  if (findings.length === 0) return [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[narrate] ANTHROPIC_API_KEY unset — using templated prose');
    return fallback(findings);
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              findings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    detector: { type: 'string' },
                    narrative: { type: 'string' },
                  },
                  required: ['detector', 'narrative'],
                  additionalProperties: false,
                },
              },
            },
            required: ['findings'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: 'user',
          content:
            'Rank and narrate these findings. Use only the numbers present in each ' +
            'metric object.\n\n' +
            JSON.stringify(findings, null, 2),
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      console.warn('[narrate] model declined — using templated prose');
      return fallback(findings);
    }

    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') return fallback(findings);

    const parsed = JSON.parse(text.text) as { findings: Array<{ detector: string; narrative: string }> };
    const byDetector = new Map(findings.map((f) => [f.detector, f]));

    const narrated: NarratedFinding[] = [];
    parsed.findings.forEach((entry, i) => {
      const source = byDetector.get(entry.detector);
      // Only findings the SQL actually produced survive. If the model invents a
      // detector name, it is dropped rather than shown.
      if (!source) return;
      narrated.push({ ...source, rank: i, narrative: entry.narrative });
      byDetector.delete(entry.detector);
    });

    // Anything the model omitted still gets shown, with templated prose. A
    // finding must never disappear because the narrator overlooked it.
    let rank = narrated.length;
    for (const leftover of byDetector.values()) {
      narrated.push({ ...leftover, rank: rank++, narrative: templated(leftover) });
    }

    return narrated;
  } catch (err) {
    console.error('[narrate] failed — using templated prose', err);
    return fallback(findings);
  }
}
