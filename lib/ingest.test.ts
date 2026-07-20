import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Ingest endpoint behaviour, verified without a database.
 *
 * The sink is mocked so we can assert on exactly which rows would have been
 * written. These are the properties that matter most and are easiest to break
 * silently — a forged conversion or a leaked identity produces no error, just
 * wrong numbers on a dashboard nobody re-checks.
 */

const written: Array<Record<string, unknown>[]> = [];

vi.mock('./sinks', () => ({
  dbSink: {
    name: 'test',
    requiresConsent: false,
    write: async (rows: Record<string, unknown>[]) => {
      written.push(rows);
    },
  },
  vendorSinks: [],
  sinksFor: () => ({
    primary: {
      name: 'test',
      requiresConsent: false,
      write: async (rows: Record<string, unknown>[]) => {
        written.push(rows);
      },
    },
    background: [],
  }),
}));

const { default: handler } = await import('../api/events');

const VID = '11111111-1111-4111-8111-111111111111';
const SID = '22222222-2222-4222-8222-222222222222';

function makeReq(body: unknown, cookies: Record<string, string> = { vid: VID, sid: SID }) {
  return {
    method: 'POST',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250) + 1}`,
      'x-vercel-ip-country': 'IN',
      'x-vercel-ip-city': 'Delhi',
    },
    query: {},
    body,
    cookies,
  } as never;
}

function makeRes() {
  const state = { code: 0, ended: false, headers: {} as Record<string, unknown> };
  const res = {
    status(code: number) { state.code = code; return res; },
    setHeader(name: string, value: unknown) { state.headers[name] = value; return res; },
    json() { state.ended = true; },
    send() { state.ended = true; },
    end() { state.ended = true; },
  };
  return { res: res as never, state };
}

const rows = () => written.flat();

beforeEach(() => {
  written.length = 0;
});

describe('POST /api/events', () => {
  it('always returns 204 on a valid batch', async () => {
    const { res, state } = makeRes();
    await handler(makeReq({ events: [{ name: 'page_viewed', t: Date.now() }] }), res);
    expect(state.code).toBe(204);
    expect(rows()).toHaveLength(1);
  });

  it('returns 204 — never an error — on malformed input', async () => {
    for (const body of [null, 'not json', { events: 'nope' }, {}, { events: [] }]) {
      const { res, state } = makeRes();
      await handler(makeReq(body), res);
      // A tracking endpoint must never surface an error to a browser.
      expect(state.code, `body: ${JSON.stringify(body)}`).toBe(204);
    }
  });

  it('silently drops server-truth events — a browser cannot forge a conversion', async () => {
    const { res, state } = makeRes();
    await handler(
      makeReq({
        events: [
          { name: 'lead_won', props: { value: 999999 } },
          { name: 'lead_submitted' },
          { name: 'rollup_completed' },
        ],
      }),
      res,
    );
    expect(state.code).toBe(204);
    expect(rows()).toHaveLength(0);
  });

  it('silently drops names that are not in the catalog', async () => {
    const { res } = makeRes();
    await handler(makeReq({ events: [{ name: 'totally_made_up' }, { name: 'page_viewed' }] }), res);
    expect(rows().map((r) => r.name)).toEqual(['page_viewed']);
  });

  it('ignores identity supplied in the body and stamps it from cookies', async () => {
    const { res } = makeRes();
    await handler(
      makeReq({
        events: [{ name: 'page_viewed', visitorId: 'attacker', sessionId: 'attacker', actor: 'admin' }],
      }),
      res,
    );
    const row = rows()[0];
    expect(row.visitorId).toBe(VID);
    expect(row.sessionId).toBe(SID);
    expect(row.actor).toBe('visitor');
  });

  it('rejects a malformed cookie rather than trusting it', async () => {
    const { res } = makeRes();
    await handler(makeReq({ events: [{ name: 'page_viewed' }] }, { vid: 'not-a-uuid', sid: 'bad' }), res);
    const row = rows()[0];
    // A fresh id is minted instead of accepting the junk value.
    expect(row.visitorId).not.toBe('not-a-uuid');
    expect(String(row.visitorId)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('caps a batch at 20 events', async () => {
    const { res } = makeRes();
    await handler(
      makeReq({ events: Array.from({ length: 50 }, () => ({ name: 'page_viewed' })) }),
      res,
    );
    expect(rows()).toHaveLength(20);
  });

  it('clamps a wildly wrong client clock into a believable window', async () => {
    const { res } = makeRes();
    const now = Date.now();
    await handler(
      makeReq({
        events: [
          { name: 'page_viewed', t: now - 5 * 24 * 60 * 60 * 1000 }, // 5 days ago
          { name: 'section_viewed', t: now + 5 * 24 * 60 * 60 * 1000 }, // 5 days ahead
        ],
      }),
      res,
    );
    const times = rows().map((r) => (r.occurredAt as Date).getTime());
    expect(times[0]).toBeGreaterThanOrEqual(now - 30 * 60 * 1000 - 1000);
    expect(times[1]).toBeLessThanOrEqual(now + 5 * 60 * 1000 + 1000);
  });

  it('preserves same-batch ordering after clamping', async () => {
    const { res } = makeRes();
    const t = Date.now();
    await handler(
      makeReq({
        events: [
          { name: 'page_viewed', t },
          { name: 'section_viewed', t },
          { name: 'product_viewed', t, productSku: '500ml' },
        ],
      }),
      res,
    );
    const times = rows().map((r) => (r.occurredAt as Date).getTime());
    // Without the 1ms offset these would collide and first-touch ordering
    // would be arbitrary.
    expect(times[1]).toBeGreaterThan(times[0]);
    expect(times[2]).toBeGreaterThan(times[1]);
  });

  it('replays batch attribution onto every event', async () => {
    const { res } = makeRes();
    await handler(
      makeReq({
        events: [{ name: 'page_viewed' }, { name: 'contact_form_viewed' }],
        attribution: { utmSource: 'google', utmCampaign: 'spring', referrer: 'https://google.com/' },
      }),
      res,
    );
    for (const row of rows()) {
      expect(row.utmSource).toBe('google');
      expect(row.utmCampaign).toBe('spring');
    }
  });

  it('never persists an IP and records geo from edge headers', async () => {
    const { res } = makeRes();
    await handler(makeReq({ events: [{ name: 'page_viewed' }] }), res);
    const row = rows()[0];
    expect(row.country).toBe('IN');
    expect(row.city).toBe('Delhi');
    expect(JSON.stringify(row)).not.toContain('10.0.0.');
  });

  it('caps oversized props instead of storing them', async () => {
    const { res } = makeRes();
    await handler(
      makeReq({ events: [{ name: 'page_viewed', props: { blob: 'x'.repeat(20000) } }] }),
      res,
    );
    const props = rows()[0].props as Record<string, unknown>;
    expect(props._truncated).toBe(true);
    expect(JSON.stringify(props).length).toBeLessThan(200);
  });

  it('rejects non-POST methods with 204', async () => {
    const { res, state } = makeRes();
    const req = makeReq({ events: [{ name: 'page_viewed' }] });
    (req as { method: string }).method = 'GET';
    await handler(req, res);
    expect(state.code).toBe(204);
    expect(rows()).toHaveLength(0);
  });
});
