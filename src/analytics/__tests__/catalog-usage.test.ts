import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CLIENT_EMITTABLE, EVENTS, PRODUCT_SKUS, isEventName, normalizeProductSku } from '../catalog';

/**
 * The compile-error guarantee, reconstructed for plain JS.
 *
 * `EventName` is derived from the catalog, so TypeScript call sites are checked by
 * the compiler. The marketing site (src/sections, src/site, src/pages) is plain
 * JS and is not. This test closes that gap: any tracking call or data-evt
 * attribute naming an event that isn't in the catalog fails CI. The walker is
 * path-agnostic, so it picked up the multi-page split with no change.
 *
 * Without this, a typo like track('contact_form_submited') would silently emit
 * nothing forever, and the dashboard would show a funnel that simply stops.
 */

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const SCAN_DIRS = ['src', 'lib', 'api'];
const EXTS = /\.(jsx?|tsx?)$/;
const SKIP = /node_modules|dist|__tests__/;

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (SKIP.test(full)) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.test(full)) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));

interface Usage {
  name: string;
  file: string;
  line: number;
  clientSide: boolean;
}

function collectUsages(): Usage[] {
  const usages: Usage[] = [];
  // track('x') / trackPageView is excluded; data-evt="x"; { name: 'x' } in trackMany.
  const callRe = /\btrack\(\s*['"]([a-z0-9_]+)['"]/g;
  const attrRe = /data-evt=["']([a-z0-9_]+)["']/g;

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    const isBrowser = rel.startsWith('src');
    const lines = src.split('\n');

    lines.forEach((line, i) => {
      for (const re of [callRe, attrRe]) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line)) !== null) {
          usages.push({
            name: m[1],
            file: rel,
            line: i + 1,
            clientSide: isBrowser || re === attrRe,
          });
        }
      }
    });
  }
  return usages;
}

describe('event catalog usage', () => {
  const usages = collectUsages();

  // Guards against the whole suite passing vacuously: if the scan regexes stop
  // matching (a refactor renames track(), say), every assertion below would go
  // green while checking nothing at all.
  it('actually finds tracking usages to check', () => {
    expect(files.length).toBeGreaterThan(0);
    expect(usages.length).toBeGreaterThan(0);
  });

  it('every tracked event name exists in the catalog', () => {
    const unknown = usages.filter((u) => !isEventName(u.name));
    expect(
      unknown.map((u) => `${u.file}:${u.line} -> "${u.name}"`),
      'Tracking call references an event that is not in src/analytics/catalog.ts. ' +
        'Add it to the catalog (or fix the typo) — an unknown name emits nothing.',
    ).toEqual([]);
  });

  it('browser code only emits client-emittable events', () => {
    const forged = usages.filter(
      (u) => u.clientSide && isEventName(u.name) && !CLIENT_EMITTABLE.has(u.name),
    );
    expect(
      forged.map((u) => `${u.file}:${u.line} -> "${u.name}"`),
      'Browser code is trying to emit a server-truth event. Conversions, money, and ' +
        'status changes must be emitted server-side after the row is written.',
    ).toEqual([]);
  });
});

describe('catalog integrity', () => {
  it('every client-emittable name is a real catalog entry', () => {
    for (const name of CLIENT_EMITTABLE) {
      expect(isEventName(name), `${name} is in CLIENT_EMITTABLE but not the catalog`).toBe(true);
    }
  });

  it('no conversion, money, or lifecycle event is client-emittable', () => {
    const serverOnly = Object.keys(EVENTS).filter(
      (n) => n.startsWith('lead_') || n.startsWith('admin_') || n.startsWith('rollup_'),
    );
    for (const name of serverOnly) {
      expect(
        CLIENT_EMITTABLE.has(name as never),
        `${name} must never be forgeable from a browser`,
      ).toBe(false);
    }
  });

  it('folds every display label onto one canonical SKU', () => {
    // The bug this exists to prevent: the cards said "1 Litre", the customizer
    // said "1L", and one bottle occupied two rows in the products dashboard.
    expect(normalizeProductSku('1 Litre')).toBe('1L');
    expect(normalizeProductSku('1 litre')).toBe('1L');
    expect(normalizeProductSku('  1L  ')).toBe('1L');
    expect(normalizeProductSku('1000ml')).toBe('1L');
    expect(normalizeProductSku('500 ml')).toBe('500ml');
  });

  it('leaves canonical SKUs and unknown values alone', () => {
    for (const sku of PRODUCT_SKUS) {
      expect(normalizeProductSku(sku)).toBe(sku);
    }
    // A size added later must reach the dashboard as itself, not disappear
    // because nobody remembered to extend the alias map.
    expect(normalizeProductSku('750ml')).toBe('750ml');
    expect(normalizeProductSku(null)).toBe(null);
    expect(normalizeProductSku('')).toBe(null);
  });

  it('every event has a non-empty description', () => {
    for (const [name, def] of Object.entries(EVENTS)) {
      expect(def.description.length, `${name} needs a description`).toBeGreaterThan(10);
    }
  });
});
