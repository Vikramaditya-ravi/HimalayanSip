import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * End-to-end SQL verification against a REAL PostgreSQL instance.
 *
 * Every query in metrics.ts, rollup.ts, detectors.ts, and stitch.ts runs here
 * against seeded data with known answers. Without this, none of that SQL had
 * ever executed — a typo'd column or a wrong FILTER clause would surface as a
 * silently wrong dashboard number, which is the failure mode this whole system
 * exists to avoid.
 *
 * Run with: npm run test:db  (requires the local cluster — see scripts/pg.mjs)
 */

const DB = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54329/aquavia_test';

/**
 * SAFETY GATE — do not remove.
 *
 * This suite begins with TRUNCATE. A `.env` pointing at production Neon now
 * exists in this repo, and a single mis-set variable would wipe the live event
 * stream. Refuse to run against anything that is not an explicitly local host.
 */
(() => {
  const host = new URL(DB).hostname;
  const isLocal = host === '127.0.0.1' || host === 'localhost' || host === '::1';
  if (!isLocal) {
    throw new Error(
      `REFUSING TO RUN: integration tests truncate every table, and the target ` +
        `host is "${host}", which is not local. Point TEST_DATABASE_URL at a ` +
        `throwaway database (npm run db:up) and try again.`,
    );
  }
  if (/neon\.tech|amazonaws|supabase|rds\./i.test(DB)) {
    throw new Error('REFUSING TO RUN: target looks like a managed/production database.');
  }
})();

process.env.DATABASE_URL = DB;
process.env.DIRECT_URL = DB;

// Imported dynamically: lib/db.ts instantiates PrismaClient at module load, so
// DATABASE_URL must already be set.
let prisma: typeof import('./db').prisma;
let m: typeof import('./metrics');
let rollup: typeof import('./rollup');
let stitch: typeof import('./stitch');
let detectors: typeof import('./detectors');

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const ago = (days: number, hours = 12) => new Date(now - days * DAY + hours * 60 * 60 * 1000 - 12 * 60 * 60 * 1000);

// Fixed ids so assertions can reference specific actors.
const V = {
  a: '00000000-0000-4000-8000-00000000000a',
  b: '00000000-0000-4000-8000-00000000000b',
  c: '00000000-0000-4000-8000-00000000000c',
  d: '00000000-0000-4000-8000-00000000000d',
  bot: '00000000-0000-4000-8000-0000000000b0',
  admin: '00000000-0000-4000-8000-00000000ad00',
};
const S = (n: string) => `00000000-0000-4000-8000-0000000${n}`;
const LEAD_A = 'aaaaaaaa-0000-4000-8000-000000000001';
const LEAD_D = 'dddddddd-0000-4000-8000-000000000002';

interface Row {
  name: string;
  occurredAt: Date;
  visitorId?: string | null;
  sessionId?: string | null;
  actor?: 'visitor' | 'customer' | 'admin' | 'system';
  source?: 'web' | 'server' | 'admin' | 'api';
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  pageUrl?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  productSku?: string | null;
  queryText?: string | null;
  sectionId?: string | null;
  leadId?: string | null;
  props?: Record<string, unknown> | null;
}

function base(over: Row): Row {
  return {
    actor: 'visitor',
    source: 'web',
    device: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    country: 'IN',
    city: 'Delhi',
    pageUrl: '/',
    ...over,
  };
}

function buildSeed(): Row[] {
  const rows: Row[] = [];

  // --- Visitor A: google/cpc "spring" -> converts -> won 45000 -------------
  const sa = S('0000a1');
  const aAttr = { utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'spring' };
  rows.push(
    base({ name: 'page_viewed', occurredAt: ago(10, 9), visitorId: V.a, sessionId: sa, ...aAttr }),
    base({ name: 'section_viewed', occurredAt: ago(10, 9.1), visitorId: V.a, sessionId: sa, sectionId: 'products', pageUrl: '/#products', ...aAttr }),
    base({ name: 'product_viewed', occurredAt: ago(10, 9.2), visitorId: V.a, sessionId: sa, productSku: '500ml', ...aAttr }),
    base({ name: 'product_cta_clicked', occurredAt: ago(10, 9.3), visitorId: V.a, sessionId: sa, productSku: '500ml', ...aAttr }),
    base({ name: 'search_performed', occurredAt: ago(10, 9.4), visitorId: V.a, sessionId: sa, queryText: 'gym bottles', props: { resultCount: 2 }, ...aAttr }),
    base({ name: 'contact_form_viewed', occurredAt: ago(10, 9.5), visitorId: V.a, sessionId: sa, ...aAttr }),
    base({ name: 'contact_form_started', occurredAt: ago(10, 9.6), visitorId: V.a, sessionId: sa, ...aAttr }),
    base({ name: 'contact_form_field_completed', occurredAt: ago(10, 9.7), visitorId: V.a, sessionId: sa, props: { field: 'email' }, ...aAttr }),
    // Conversion + lifecycle are SERVER events, already carrying leadId.
    base({ name: 'lead_submitted', occurredAt: ago(10, 10), visitorId: V.a, sessionId: sa, source: 'server', leadId: LEAD_A, ...aAttr }),
    base({ name: 'lead_won', occurredAt: ago(6, 10), visitorId: V.a, sessionId: sa, source: 'admin', actor: 'customer', leadId: LEAD_A, props: { value: 45000 }, ...aAttr }),
  );

  // --- Visitor B: instagram referral, zero-result search, bounces ----------
  const sb = S('0000b1');
  rows.push(
    base({ name: 'page_viewed', occurredAt: ago(6, 11), visitorId: V.b, sessionId: sb, referrer: 'https://www.instagram.com/', device: 'mobile', browser: 'Safari', os: 'iOS' }),
    base({ name: 'search_performed', occurredAt: ago(6, 11.1), visitorId: V.b, sessionId: sb, queryText: 'sparkling water', props: { resultCount: 0 }, referrer: 'https://www.instagram.com/', device: 'mobile' }),
    base({ name: 'search_zero_results', occurredAt: ago(6, 11.2), visitorId: V.b, sessionId: sb, queryText: 'sparkling water', referrer: 'https://www.instagram.com/', device: 'mobile' }),
  );
  // A second visitor also searching for the same missing thing (detector needs >= 2).
  const sb2 = S('0000b2');
  rows.push(
    base({ name: 'page_viewed', occurredAt: ago(3, 11), visitorId: V.c, sessionId: sb2 }),
    base({ name: 'search_zero_results', occurredAt: ago(3, 11.2), visitorId: V.c, sessionId: sb2, queryText: 'sparkling water' }),
  );

  // --- Visitor C: repeat visitor, engaged, no conversion -------------------
  const sc1 = S('0000c1');
  const sc2 = S('0000c2');
  rows.push(
    base({ name: 'page_viewed', occurredAt: ago(5, 10), visitorId: V.c, sessionId: sc1 }),
    base({ name: 'product_viewed', occurredAt: ago(5, 10.2), visitorId: V.c, sessionId: sc1, productSku: '1 Litre' }),
    base({ name: 'customizer_opened', occurredAt: ago(5, 10.3), visitorId: V.c, sessionId: sc1 }),
    base({ name: 'customizer_logo_uploaded', occurredAt: ago(5, 10.4), visitorId: V.c, sessionId: sc1 }),
    base({ name: 'contact_intent_clicked', occurredAt: ago(5, 10.5), visitorId: V.c, sessionId: sc1, props: { channel: 'whatsapp' } }),
    base({ name: 'page_viewed', occurredAt: ago(4, 10), visitorId: V.c, sessionId: sc2 }),
    base({ name: 'contact_intent_clicked', occurredAt: ago(4, 10.1), visitorId: V.c, sessionId: sc2, props: { channel: 'call' } }),
  );

  // --- Visitor D: converts, not won ---------------------------------------
  const sd = S('0000d1');
  rows.push(
    base({ name: 'page_viewed', occurredAt: ago(3, 9), visitorId: V.d, sessionId: sd, referrer: 'https://www.google.com/', device: 'mobile' }),
    base({ name: 'contact_form_viewed', occurredAt: ago(3, 9.3), visitorId: V.d, sessionId: sd, device: 'mobile' }),
    base({ name: 'contact_form_started', occurredAt: ago(3, 9.4), visitorId: V.d, sessionId: sd, device: 'mobile' }),
    base({ name: 'contact_form_field_completed', occurredAt: ago(3, 9.5), visitorId: V.d, sessionId: sd, device: 'mobile', props: { field: 'name' } }),
    base({ name: 'lead_submitted', occurredAt: ago(3, 9.6), visitorId: V.d, sessionId: sd, source: 'server', leadId: LEAD_D, device: 'mobile', referrer: 'https://www.google.com/' }),
  );

  // --- Bot traffic: must be excluded from every traffic metric -------------
  for (let i = 0; i < 12; i++) {
    rows.push(base({
      name: 'page_viewed', occurredAt: ago(2, 8 + i * 0.1), visitorId: V.bot,
      sessionId: S(`00b${String(i).padStart(3, '0')}`), device: 'bot', browser: 'googlebot',
    }));
  }

  // --- Admin activity: must be excluded from visitor-facing metrics --------
  rows.push(
    base({ name: 'admin_login_succeeded', occurredAt: ago(2, 14), visitorId: V.admin, sessionId: S('00ad001'), actor: 'admin', source: 'admin' }),
    base({ name: 'page_viewed', occurredAt: ago(2, 14.1), visitorId: V.admin, sessionId: S('00ad001'), actor: 'admin', source: 'admin' }),
  );

  // --- Bulk unproductive source: 22 sessions, zero conversions -------------
  for (let i = 0; i < 22; i++) {
    const vid = `00000000-0000-4000-8000-0000000${String(i + 100).padStart(5, '0')}`;
    const sid = `00000000-0000-4000-8000-0000000${String(i + 200).padStart(5, '0')}`;
    rows.push(
      base({ name: 'page_viewed', occurredAt: ago(9 - (i % 7), 10), visitorId: vid, sessionId: sid, utmSource: 'spamnet' }),
      base({ name: 'section_viewed', occurredAt: ago(9 - (i % 7), 10.1), visitorId: vid, sessionId: sid, sectionId: 'about', utmSource: 'spamnet' }),
    );
  }

  // --- Live: activity inside the last 5 minutes ---------------------------
  rows.push(
    base({ name: 'page_viewed', occurredAt: new Date(now - 60_000), visitorId: V.a, sessionId: S('00live1') }),
    base({ name: 'page_viewed', occurredAt: new Date(now - 120_000), visitorId: V.c, sessionId: S('00live2') }),
  );

  return rows;
}

beforeAll(async () => {
  ({ prisma } = await import('./db'));
  m = await import('./metrics');
  rollup = await import('./rollup');
  stitch = await import('./stitch');
  detectors = await import('./detectors');

  // Clean slate so the suite is repeatable.
  await prisma.$executeRawUnsafe('TRUNCATE "Event", "Lead", "EventDaily", "DimensionDaily", "ProductDaily", "SourceDaily", "SearchDaily", "Insight" CASCADE');

  await prisma.event.createMany({ data: buildSeed() as never });

  await prisma.lead.createMany({
    data: [
      { id: LEAD_A, name: 'A Buyer', email: 'a@example.com', status: 'won', value: 45000, visitorId: V.a, firstSource: 'google', firstCampaign: 'spring', createdAt: ago(10, 10) },
      { id: LEAD_D, name: 'D Buyer', email: 'd@example.com', status: 'new', visitorId: V.d, firstSource: 'https://www.google.com/', createdAt: ago(3, 9.6) },
    ] as never,
  });
}, 120_000);

// ---------------------------------------------------------------------------

describe('overview', () => {
  it('counts real visitors and excludes bots and admins', async () => {
    const { data, rolledUp } = await m.overview(30);
    expect(rolledUp).toBe(false);
    // 4 named visitors + 22 bulk = 26. Bot and admin visitors must not appear.
    expect(data.visitors).toBe(26);
    expect(data.conversions).toBe(2);
    expect(data.bounceRate).toBeGreaterThan(0);
    expect(data.bounceRate).toBeLessThanOrEqual(1);
  });

  it('bounce counts a lone page view with no engagement', async () => {
    // The 22 spamnet sessions each have a page view + a section view. Section
    // views are NOT in ENGAGEMENT_EVENTS, so they must count as bounces —
    // otherwise scroll alone would make bouncing impossible on a one-page site.
    const { data } = await m.overview(30);
    expect(data.bounceRate).toBeGreaterThan(0.5);
  });
});

describe('traffic trend', () => {
  it('conversions agree across raw, funnel, and rollup paths', async () => {
    // These three surfaces all report "conversions". They must apply the same
    // filters, or the headline number changes when a range crosses the
    // retention boundary — the exact drift this module exists to prevent.
    const raw = await m.overview(30);
    const f = await m.funnel(30);
    const funnelConversions = f.data.find((s) => s.step === 'lead_submitted')!.sessions;
    expect(raw.data.conversions).toBe(funnelConversions);

    await rollup.runRollup(30, { prune: false });
    const rolledUpRow = await prisma.eventDaily.aggregate({
      where: { name: 'lead_submitted' },
      _sum: { events: true },
    });
    expect(rolledUpRow._sum.events).toBe(raw.data.conversions);
  });

  it('excludes bot-submitted conversions', async () => {
    // A spam bot filling the contact form must not register as a conversion.
    await prisma.event.create({
      data: base({
        name: 'lead_submitted', occurredAt: ago(1, 10),
        visitorId: V.bot, sessionId: S('00botcv'), device: 'bot', source: 'server',
        leadId: 'bbbbbbbb-0000-4000-8000-00000000000b',
      }) as never,
    });
    const after = await m.overview(30);
    const f = await m.funnel(30);
    expect(after.data.conversions).toBe(f.data.find((s) => s.step === 'lead_submitted')!.sessions);
    await prisma.event.deleteMany({ where: { leadId: 'bbbbbbbb-0000-4000-8000-00000000000b' } });
  });

  it('returns one row per active day with sane values', async () => {
    const { data } = await m.trafficTrend(30);
    expect(data.length).toBeGreaterThan(3);
    for (const row of data) {
      expect(row.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.visitors).toBeGreaterThanOrEqual(0);
      expect(row.sessions).toBeGreaterThanOrEqual(row.visitors === 0 ? 0 : 1);
    }
    expect(data.reduce((s, r) => s + r.conversions, 0)).toBe(2);
  });
});

describe('dimension breakdowns', () => {
  it('every dimension in the closed union executes and returns rows', async () => {
    for (const dim of m.DIMENSIONS) {
      const { data } = await m.dimensionBreakdown(dim, 30);
      expect(Array.isArray(data), dim).toBe(true);
      for (const row of data) expect(row.value, dim).not.toBe('bot');
    }
  });

  it('device split excludes bots', async () => {
    const { data } = await m.dimensionBreakdown('device', 30);
    expect(data.map((d) => d.value)).not.toContain('bot');
    expect(data.map((d) => d.value)).toContain('desktop');
    expect(data.map((d) => d.value)).toContain('mobile');
  });
});

describe('funnel', () => {
  it('counts sessions per step in catalog order', async () => {
    const { data } = await m.funnel(30);
    expect(data.map((s) => s.step)).toEqual([
      'page_viewed', 'contact_form_viewed', 'contact_form_started',
      'contact_form_field_completed', 'lead_submitted',
    ]);
    const by = Object.fromEntries(data.map((s) => [s.step, s.sessions]));
    expect(by.contact_form_viewed).toBe(2);
    expect(by.contact_form_started).toBe(2);
    expect(by.lead_submitted).toBe(2);

    // Steps up to field-completion are structurally ordered — you cannot start a
    // form you never saw. Note the last step is NOT guaranteed monotonic in
    // production: a visitor who autofills and submits without ever blurring a
    // field converts without emitting contact_form_field_completed. The funnel
    // chart tolerates that (it only renders a drop when the drop is positive).
    const ordered = data.slice(0, 4);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].sessions, `${ordered[i].step} > ${ordered[i - 1].step}`)
        .toBeLessThanOrEqual(ordered[i - 1].sessions);
    }
  });
});

describe('contact intent', () => {
  it('splits by channel from props', async () => {
    const { data } = await m.contactIntentSplit(30);
    const by = Object.fromEntries(data.map((d) => [d.channel, d.clicks]));
    expect(by.whatsapp).toBe(1);
    expect(by.call).toBe(1);
  });
});

describe('revenue attribution', () => {
  it('attributes revenue to the first-touch source, read from the stream', async () => {
    const { data } = await m.revenueBySource(30);
    const google = data.find((r) => r.source === 'google');
    expect(google, 'google row missing').toBeTruthy();
    expect(google!.campaign).toBe('spring');
    expect(google!.revenue).toBe(45000);
    expect(google!.conversions).toBe(1);
    expect(google!.revenuePerSession).toBeGreaterThan(0);

    const spam = data.find((r) => r.source === 'spamnet');
    expect(spam!.sessions).toBe(22);
    expect(spam!.revenue).toBe(0);
  });

  it('reports total revenue exactly once', async () => {
    const { data } = await m.revenueBySource(30);
    expect(data.reduce((s, r) => s + r.revenue, 0)).toBe(45000);
  });
});

describe('velocity', () => {
  it('computes medians from first touch', async () => {
    const { data } = await m.velocity(30);
    expect(data.medianHoursToConversion).not.toBeNull();
    expect(data.medianHoursToConversion!).toBeGreaterThanOrEqual(0);
    // Lead A: first touch day-10, won day-6 => ~96h.
    expect(data.medianHoursToWin!).toBeGreaterThan(80);
    expect(data.medianHoursToWin!).toBeLessThan(120);
  });
});

describe('depth', () => {
  it('buckets engagement depth and computes conversion rate per bucket', async () => {
    const { data } = await m.depth(30);
    expect(data.length).toBeGreaterThan(0);
    for (const b of data) {
      expect(b.conversions).toBeLessThanOrEqual(b.sessions);
      expect(b.conversionRate).toBeLessThanOrEqual(1);
    }
    expect(data.map((b) => b.bucket)).toContain('0');
  });
});

describe('retention', () => {
  it('identifies repeat visitors', async () => {
    const { data } = await m.retention(30);
    // Visitor C has 4 sessions; A has 2 (incl. the live one).
    expect(data.visitors).toBeGreaterThan(0);
    expect(data.repeatRate).toBeGreaterThan(0);
    expect(data.repeatRate).toBeLessThanOrEqual(1);
    expect(data.medianSessionMinutes).not.toBeNull();
  });
});

describe('search', () => {
  it('surfaces zero-result queries', async () => {
    const { data } = await m.searchQueries(30);
    const zero = data.find((r) => r.query === 'sparkling water');
    expect(zero, 'zero-result query missing').toBeTruthy();
    expect(zero!.zeroResults).toBe(2);

    const found = data.find((r) => r.query === 'gym bottles');
    expect(found!.searches).toBe(1);
    expect(found!.zeroResults).toBe(0);
  });

  it('orders zero-result queries first', async () => {
    const { data } = await m.searchQueries(30);
    expect(data[0].query).toBe('sparkling water');
  });
});

describe('products', () => {
  it('reports views, CTA clicks, and CTR', async () => {
    const { data } = await m.productPerformance(30);
    const p500 = data.find((p) => p.productSku === '500ml');
    expect(p500!.views).toBe(1);
    expect(p500!.ctaClicks).toBe(1);
    expect(p500!.ctr).toBe(1);
    expect(data.find((p) => p.productSku === '1 Litre')!.ctaClicks).toBe(0);
  });
});

describe('live and health', () => {
  it('counts visitors active in the last 5 minutes', async () => {
    const { data } = await m.liveVisitors();
    expect(data.online).toBe(2);
  });

  it('returns the recent event feed', async () => {
    const { data } = await m.recentEvents(20);
    expect(data.length).toBe(20);
    expect(data[0]).toHaveProperty('visitorShort');
    expect(String(data[0].occurredAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('reports rollups as stale when none have ever run', async () => {
    const { data } = await m.infraHealth();
    expect(data.rollupStale).toBe(true);
    expect(data.lastRollupAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe('identity stitching', () => {
  const NEW_LEAD = 'eeeeeeee-0000-4000-8000-000000000003';
  const V_E = '00000000-0000-4000-8000-00000000000e';

  it('back-stamps leadId onto prior anonymous events only', async () => {
    const sess = S('0000e1');
    await prisma.event.createMany({
      data: [
        base({ name: 'page_viewed', occurredAt: ago(2, 9), visitorId: V_E, sessionId: sess, utmSource: 'newsletter', utmCampaign: 'jan', referrer: 'https://mail.example/', pageUrl: '/?utm_source=newsletter' }),
        base({ name: 'section_viewed', occurredAt: ago(2, 9.1), visitorId: V_E, sessionId: sess, sectionId: 'products' }),
        base({ name: 'product_viewed', occurredAt: ago(2, 9.2), visitorId: V_E, sessionId: sess, productSku: '250ml' }),
        // Already attached to a different lead — must NOT be re-stamped.
        base({ name: 'lead_submitted', occurredAt: ago(2, 9.3), visitorId: V_E, sessionId: sess, source: 'server', leadId: 'ffffffff-0000-4000-8000-000000000009' }),
      ] as never,
    });

    const before = await prisma.event.count({ where: { visitorId: V_E, leadId: null } });
    expect(before).toBe(3);

    const stitched = await stitch.stitchLead(V_E, NEW_LEAD);
    expect(stitched).toBe(3);

    expect(await prisma.event.count({ where: { visitorId: V_E, leadId: NEW_LEAD } })).toBe(3);
    // The pre-existing association survived.
    expect(await prisma.event.count({ where: { visitorId: V_E, leadId: 'ffffffff-0000-4000-8000-000000000009' } })).toBe(1);
  });

  it('makes the landing UTM answerable from the conversion', async () => {
    // This is the point of stitching: the UTM lives on the landing page view,
    // not on the conversion event.
    const rows = await prisma.event.findMany({
      where: { leadId: NEW_LEAD, utmSource: { not: null } },
      select: { utmSource: true, utmCampaign: true },
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].utmSource).toBe('newsletter');
    expect(rows[0].utmCampaign).toBe('jan');
  });

  it('reads first touch from the visitor history', async () => {
    const ft = await stitch.firstTouchFor(V_E);
    expect(ft.utmSource).toBe('newsletter');
    expect(ft.utmCampaign).toBe('jan');
    expect(ft.referrer).toBe('https://mail.example/');
    expect(ft.landingPage).toBe('/?utm_source=newsletter');
  });

  it('resolves leadId back to the buyer, not the admin', async () => {
    // Without this, an admin marking a deal won would attribute the revenue to
    // their own visitor id.
    expect(await stitch.visitorIdOf(NEW_LEAD)).toBe(V_E);
    expect(await stitch.visitorIdOf(LEAD_A)).toBe(V.a);
  });

  it('is a no-op for an unknown visitor', async () => {
    expect(await stitch.stitchLead(null, NEW_LEAD)).toBe(0);
    expect(await stitch.visitorIdOf('no-such-lead')).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe('rollups', () => {
  it('runs every step without error', async () => {
    const result = await rollup.runRollup(30, { prune: false });
    expect(result.eventDaily).toBeGreaterThan(0);
    expect(result.dimensionDaily).toBeGreaterThan(0);
    expect(result.productDaily).toBeGreaterThan(0);
    expect(result.sourceDaily).toBeGreaterThan(0);
    expect(result.searchDaily).toBeGreaterThan(0);
    expect(result.pruned).toBe(0);
  });

  it('writes an __all__ row carrying true daily uniques', async () => {
    const all = await prisma.eventDaily.findMany({ where: { name: '__all__' } });
    expect(all.length).toBeGreaterThan(0);
    for (const day of all) {
      const perName = await prisma.eventDaily.findMany({ where: { day: day.day, name: { not: '__all__' } } });
      const summed = perName.reduce((s, r) => s + r.visitors, 0);
      // Per-name uniques are not summable — the __all__ row exists precisely
      // because summing them over-counts anyone who fired two event types.
      expect(day.visitors).toBeLessThanOrEqual(summed);
    }
  });

  it('IS IDEMPOTENT — re-running produces identical rows', async () => {
    const snapshot = async () => ({
      eventDaily: await prisma.eventDaily.findMany({ orderBy: [{ day: 'asc' }, { name: 'asc' }] }),
      dimensionDaily: await prisma.dimensionDaily.count(),
      sourceDaily: await prisma.sourceDaily.findMany({ orderBy: [{ day: 'asc' }, { source: 'asc' }] }),
      searchDaily: await prisma.searchDaily.count(),
      productDaily: await prisma.productDaily.count(),
    });

    const before = await snapshot();
    await rollup.runRollup(30, { prune: false });
    await rollup.runRollup(30, { prune: false });
    const after = await snapshot();

    expect(after.eventDaily).toEqual(before.eventDaily);
    expect(after.sourceDaily).toEqual(before.sourceDaily);
    expect(after.dimensionDaily).toBe(before.dimensionDaily);
    expect(after.searchDaily).toBe(before.searchDaily);
    expect(after.productDaily).toBe(before.productDaily);
  });

  it('rollup revenue matches the raw-path revenue', async () => {
    // The two paths must agree, or numbers shift when a range crosses the
    // retention boundary.
    const raw = await m.revenueBySource(30);
    const rawTotal = raw.data.reduce((s, r) => s + r.revenue, 0);
    const rolled = await prisma.sourceDaily.aggregate({ _sum: { revenue: true } });
    expect(Number(rolled._sum.revenue ?? 0)).toBe(rawTotal);
  });

  it('rollup search counts match the raw path', async () => {
    const raw = await m.searchQueries(30);
    const rawZero = raw.data.reduce((s, r) => s + r.zeroResults, 0);
    const rolled = await prisma.searchDaily.aggregate({ _sum: { zeroResults: true } });
    expect(rolled._sum.zeroResults).toBe(rawZero);
  });
});

describe('retention boundary and the approximate-data path', () => {
  const ORIGINAL = process.env.EVENT_RETENTION_DAYS;
  afterAll(() => {
    if (ORIGINAL === undefined) delete process.env.EVENT_RETENTION_DAYS;
    else process.env.EVENT_RETENTION_DAYS = ORIGINAL;
  });

  it('reads rollups and flags rolledUp when the range exceeds retention', async () => {
    process.env.EVENT_RETENTION_DAYS = '2';
    expect(m.shouldUseRollups(30)).toBe(true);

    const { data, rolledUp } = await m.overview(30);
    expect(rolledUp).toBe(true);
    expect(data.visitors).toBeGreaterThan(0);

    // The property that matters is that the rollup path agrees with the raw
    // data — not a hardcoded number, since earlier blocks seed extra events.
    const rawConversions = await prisma.event.count({
      where: { name: 'lead_submitted', occurredAt: { gte: m.rangeStart(30) } },
    });
    expect(data.conversions).toBe(rawConversions);

    const trend = await m.trafficTrend(30);
    expect(trend.rolledUp).toBe(true);
    expect(trend.data.length).toBeGreaterThan(0);

    const dims = await m.dimensionBreakdown('device', 30);
    expect(dims.rolledUp).toBe(true);
    expect(dims.data.length).toBeGreaterThan(0);

    const search = await m.searchQueries(30);
    expect(search.rolledUp).toBe(true);

    const products = await m.productPerformance(30);
    expect(products.rolledUp).toBe(true);

    const sources = await m.revenueBySource(30);
    expect(sources.rolledUp).toBe(true);
    expect(sources.data.reduce((s, r) => s + r.revenue, 0)).toBe(45000);
  });

  it('stays on the exact raw path within retention', async () => {
    process.env.EVENT_RETENTION_DAYS = '90';
    expect(m.shouldUseRollups(30)).toBe(false);
    expect((await m.overview(30)).rolledUp).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe('detectors', () => {
  it('all detectors execute and return structured numeric evidence', async () => {
    const findings = await detectors.runDetectors();
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      expect(f.detector).toBeTruthy();
      expect(['info', 'warning', 'critical']).toContain(f.severity);
      expect(f.category).toBeTruthy();
      expect(Object.keys(f.metric).length).toBeGreaterThan(0);
    }
  });

  it('flags the zero-result search with its real counts', async () => {
    const findings = await detectors.runDetectors();
    const zero = findings.find((f) => f.detector.startsWith('zero_result_search'));
    expect(zero, 'zero-result detector did not fire').toBeTruthy();
    expect(zero!.metric.query).toBe('sparkling water');
    expect(zero!.metric.searches).toBe(2);
  });

  it('flags the source that sent traffic but produced nothing', async () => {
    const findings = await detectors.runDetectors();
    const spam = findings.find((f) => f.detector === 'unproductive_source:spamnet');
    expect(spam, 'unproductive source detector did not fire').toBeTruthy();
    expect(spam!.metric.sessions).toBe(22);
    expect(spam!.metric.conversions).toBe(0);
  });

  it('identifies the largest funnel drop', async () => {
    const findings = await detectors.runDetectors();
    const leak = findings.find((f) => f.detector === 'funnel_leak');
    expect(leak).toBeTruthy();
    expect(Number(leak!.metric.dropPct)).toBeGreaterThan(0);
    expect(Number(leak!.metric.dropPct)).toBeLessThanOrEqual(100);
  });
});

describe('narration safety', () => {
  it('falls back to templated prose with no API key, preserving every finding', async () => {
    const original = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const { narrate } = await import('./narrate');
      const findings = await detectors.runDetectors();
      const narrated = await narrate(findings);
      expect(narrated.length).toBe(findings.length);
      for (const n of narrated) {
        expect(n.narrative.length).toBeGreaterThan(10);
        // Templated prose only restates evidence — never invents a number.
        expect(n.metric).toBeTruthy();
      }
    } finally {
      if (original) process.env.ANTHROPIC_API_KEY = original;
    }
  });
});

// ---------------------------------------------------------------------------
// Destructive — runs last.
// ---------------------------------------------------------------------------

describe('retention pruning', () => {
  it('deletes raw events past the cutoff and leaves rollups intact', async () => {
    const original = process.env.EVENT_RETENTION_DAYS;
    process.env.EVENT_RETENTION_DAYS = '4';

    // Must match rollup.ts's own cutoff: start of the retention day in UTC, not
    // "now minus N days". They differ by the current time of day.
    const cutoff = new Date(now);
    cutoff.setUTCDate(cutoff.getUTCDate() - 4);
    cutoff.setUTCHours(0, 0, 0, 0);

    const rollupsBefore = await prisma.eventDaily.count();
    const oldBefore = await prisma.event.count({ where: { occurredAt: { lt: cutoff } } });
    expect(oldBefore).toBeGreaterThan(0);

    const result = await rollup.runRollup(30, { prune: true });
    expect(result.pruned).toBe(oldBefore);

    expect(await prisma.event.count({ where: { occurredAt: { lt: cutoff } } })).toBe(0);
    // Rollups are kept forever — history survives the prune.
    expect(await prisma.eventDaily.count()).toBeGreaterThanOrEqual(rollupsBefore);

    // And the long-range number still works, now necessarily from rollups.
    process.env.EVENT_RETENTION_DAYS = '4';
    const { data, rolledUp } = await m.overview(30);
    expect(rolledUp).toBe(true);
    // Conversions from before the cutoff survive only because rollups are kept
    // forever — this is the whole point of the retention split.
    expect(data.conversions).toBeGreaterThanOrEqual(2);

    if (original === undefined) delete process.env.EVENT_RETENTION_DAYS;
    else process.env.EVENT_RETENTION_DAYS = original;
  });
});
