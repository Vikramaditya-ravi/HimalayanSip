import { afterEach, describe, expect, it } from 'vitest';
import { classifyReferrer } from '../src/analytics/attribution';
import {
  checkAdminPassword,
  createAdminSession,
  verifyAdminSession,
} from './identity';
import { rateLimit } from './ratelimit';
import { parseUA } from './ua';

/** Pure-logic verification for the pieces that guard identity, traffic quality,
 *  and rate limiting — the ones that fail silently rather than loudly. */

describe('user-agent parsing', () => {
  it('classifies real browsers by device', () => {
    const cases: Array<[string, string, string]> = [
      ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36', 'desktop', 'Chrome'],
      ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 'mobile', 'Safari'],
      ['Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1 Version/17.0 Safari/604.1', 'tablet', 'Safari'],
      ['Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36', 'mobile', 'Chrome'],
      ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0', 'desktop', 'Edge'],
    ];
    for (const [ua, device, browser] of cases) {
      const parsed = parseUA(ua);
      expect(parsed.device, ua.slice(0, 40)).toBe(device);
      expect(parsed.browser, ua.slice(0, 40)).toBe(browser);
    }
  });

  it('flags bots — they inflate every traffic metric if missed', () => {
    const bots = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0)',
      'ClaudeBot/1.0',
      'curl/8.4.0',
      'python-requests/2.31.0',
      'facebookexternalhit/1.1',
      'Mozilla/5.0 (compatible; SemrushBot/7~bl)',
      'node-fetch/1.0',
      'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0',
    ];
    for (const ua of bots) {
      expect(parseUA(ua).device, ua).toBe('bot');
    }
  });

  it('treats a missing user agent as automation, not a visitor', () => {
    expect(parseUA(undefined).device).toBe('bot');
    expect(parseUA('').device).toBe('bot');
  });
});

describe('referrer classification', () => {
  it('buckets known hosts', () => {
    expect(classifyReferrer('https://www.google.com/search?q=x')).toBe('search');
    expect(classifyReferrer('https://duckduckgo.com/')).toBe('search');
    expect(classifyReferrer('https://www.instagram.com/p/abc')).toBe('social');
    expect(classifyReferrer('https://wa.me/123')).toBe('social');
    expect(classifyReferrer('https://www.linkedin.com/feed')).toBe('social');
    expect(classifyReferrer('https://someblog.example/post')).toBe('referral');
    expect(classifyReferrer(null)).toBe('direct');
    expect(classifyReferrer('garbage')).toBe('direct');
  });
});

describe('rate limiting', () => {
  it('allows up to the limit then blocks within the window', () => {
    const key = `test-${Math.random()}`;
    const allowed = Array.from({ length: 70 }, () => rateLimit(key, 60)).filter(Boolean).length;
    expect(allowed).toBe(60);
  });

  it('tracks keys independently', () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 60; i++) rateLimit(a, 60);
    expect(rateLimit(a, 60)).toBe(false);
    expect(rateLimit(b, 60)).toBe(true);
  });
});

describe('admin session', () => {
  const ORIGINAL = process.env.ADMIN_SESSION_SECRET;
  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = ORIGINAL;
  });

  it('round-trips a signed session', () => {
    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    const token = createAdminSession();
    expect(token).toBeTruthy();
    expect(verifyAdminSession(token!)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    const token = createAdminSession()!;
    const [payload] = token.split('.');
    expect(verifyAdminSession(`${payload}.${'x'.repeat(43)}`)).toBe(false);
  });

  it('rejects a token forged under a different secret', () => {
    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    const token = createAdminSession()!;
    process.env.ADMIN_SESSION_SECRET = 'b'.repeat(32);
    expect(verifyAdminSession(token)).toBe(false);
  });

  it('rejects an expired token', () => {
    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    // Payload carries its own expiry; a past one must not verify even though
    // the signature over it is valid.
    const expired = `admin.${Date.now() - 1000}`;
    const crypto = require('node:crypto');
    const sig = crypto.createHmac('sha256', 'a'.repeat(32)).update(expired).digest('base64url');
    expect(verifyAdminSession(`${expired}.${sig}`)).toBe(false);
  });

  it('FAILS CLOSED when no secret is configured', () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(createAdminSession()).toBeNull();
    expect(verifyAdminSession('anything')).toBe(false);
    expect(verifyAdminSession('admin.99999999999999.sig')).toBe(false);
  });

  it('rejects junk tokens', () => {
    process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
    for (const junk of ['', 'nodots', 'a.b', '....']) {
      expect(verifyAdminSession(junk)).toBe(false);
    }
  });
});

describe('admin password', () => {
  const ORIGINAL = process.env.ADMIN_PASSWORD;
  afterEach(() => {
    process.env.ADMIN_PASSWORD = ORIGINAL;
  });

  it('accepts only the exact password', () => {
    process.env.ADMIN_PASSWORD = 'correct-horse';
    expect(checkAdminPassword('correct-horse')).toBe(true);
    expect(checkAdminPassword('correct-hors')).toBe(false);
    expect(checkAdminPassword('correct-horsee')).toBe(false);
    expect(checkAdminPassword('')).toBe(false);
    expect(checkAdminPassword(null)).toBe(false);
    expect(checkAdminPassword(123)).toBe(false);
  });

  it('fails closed when unset — an unset password is not an empty password', () => {
    delete process.env.ADMIN_PASSWORD;
    expect(checkAdminPassword('')).toBe(false);
    expect(checkAdminPassword('anything')).toBe(false);
  });
});

describe('cron authorization', () => {
  const ORIGINAL = process.env.CRON_SECRET;
  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL;
  });

  it('FAILS CLOSED when CRON_SECRET is unset', async () => {
    const { authorizeCron } = await import('./cron');
    delete process.env.CRON_SECRET;
    const req = { headers: { authorization: 'Bearer anything' }, query: { secret: 'anything' } } as never;
    // An unset secret must mean "nobody may run this", not "everybody may" —
    // this route deletes raw events.
    expect(authorizeCron(req).ok).toBe(false);
  });

  it('accepts the Vercel bearer header and the query fallback', async () => {
    const { authorizeCron } = await import('./cron');
    process.env.CRON_SECRET = 'sekret';
    expect(authorizeCron({ headers: { authorization: 'Bearer sekret' }, query: {} } as never).ok).toBe(true);
    expect(authorizeCron({ headers: {}, query: { secret: 'sekret' } } as never).ok).toBe(true);
    expect(authorizeCron({ headers: { authorization: 'Bearer wrong' }, query: {} } as never).ok).toBe(false);
    expect(authorizeCron({ headers: {}, query: {} } as never).ok).toBe(false);
  });
});
