import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CLAIMS, outstandingClaims } from '../claims';
import { buildVercelConfig, serialise } from '../../../scripts/gen-vercel.mjs';

/**
 * Guardrails for the build output.
 *
 * The prerender step is the difference between a crawler receiving 85 words and
 * receiving the whole page, and it fails silently: if #root stops being replaced,
 * or a page loses its <h1>, or a canonical drifts from its route table entry,
 * the build still succeeds and the site still works in a browser. The only
 * symptom is that the engines this work targets quietly stop seeing anything.
 *
 * So these assertions run against the built files themselves rather than against
 * components. They are skipped when dist/ is absent, because `npm run test` must
 * stay runnable without a build — but they run in full after `npm run build`,
 * which is when they matter.
 */

const DIST = resolve(__dirname, '../../../dist');
const built = existsSync(DIST);

/** Visible text: markup, scripts and styles removed. */
function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'assets') walk(path);
      } else if (entry.name.endsWith('.html')) {
        out.push(path);
      }
    }
  };
  walk(DIST);
  // The admin dashboard is noindex, client-only and deliberately not
  // prerendered — none of these assertions apply to it.
  return out.filter((f) => !f.endsWith('admin.html'));
}

/**
 * The URL slug a built file stands for.
 *
 * join() emits the platform separator, so on Windows a nested page comes back as
 * `for\corporate-offices` and every URL derived from it disagrees with the one
 * the prerenderer actually wrote. The prerendered output is correct on both
 * platforms — only this derivation was platform-dependent.
 */
function slugOf(file: string): string {
  return file.slice(DIST.length + 1).replace(/\.html$/, '').replace(/\\/g, '/');
}

describe.skipIf(!built)('prerendered output', () => {
  it('renders real content into every page, not an empty root', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      expect(html, `${file} was not prerendered`).toContain('data-prerendered="true"');
      // 1,500 characters is roughly 250 words. The pre-prerender baseline was
      // ~85 words of hand-written <noscript>; anything near that means the
      // markup injection silently did nothing.
      expect(textOf(html).length, `${file} has almost no extractable text`).toBeGreaterThan(1500);
    }
  });

  it('gives every page exactly one h1', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      const count = (html.match(/<h1[\s>]/g) ?? []).length;
      expect(count, `${file} has ${count} <h1> elements`).toBe(1);
    }
  });

  it('leaves no <noscript> duplicate of the page behind', () => {
    for (const file of htmlFiles()) {
      expect(readFileSync(file, 'utf8'), `${file} still has a <noscript> block`).not.toContain('<noscript>');
    }
  });

  it('inlines the stylesheet and sets js-on before paint', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      expect(html, `${file} has no inlined stylesheet`).toContain('<style id="aq-global">');
      expect(html, `${file} does not set js-on`).toContain('classList.add("js-on")');
    }
  });

  it('gives every page a canonical that matches its own URL', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical, `${file} has no canonical`).toBeTruthy();

      const slug = slugOf(file);
      const expected =
        slug === 'index'
          ? 'https://www.aquaviaworld.com/'
          : `https://www.aquaviaworld.com/${slug}`;
      expect(canonical, `${file} canonical does not match its path`).toBe(expected);
    }
  });

  it('emits JSON-LD that parses and whose @id references all resolve', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      const raw = html.match(/<script type="application\/ld\+json" id="hs-schema">([\s\S]*?)<\/script>/)?.[1];
      expect(raw, `${file} has no JSON-LD`).toBeTruthy();

      const graph = JSON.parse(raw!.replace(/\\u003c/g, '<'));
      expect(graph['@graph'], `${file} JSON-LD is not a @graph`).toBeInstanceOf(Array);

      // Every node this graph defines...
      const defined = new Set<string>(
        graph['@graph'].map((node: Record<string, unknown>) => node['@id']).filter(Boolean),
      );

      // ...must cover every {'@id': …} pointer inside it. A reference to a node
      // that is not in the same document is a dangling edge: the engine reads
      // "seller: <something>" and cannot resolve what.
      const referenced: string[] = [];
      const walk = (value: unknown) => {
        if (Array.isArray(value)) return value.forEach(walk);
        if (!value || typeof value !== 'object') return;
        const node = value as Record<string, unknown>;
        const keys = Object.keys(node);
        if (keys.length === 1 && keys[0] === '@id') referenced.push(String(node['@id']));
        else Object.values(node).forEach(walk);
      };
      walk(graph['@graph']);

      for (const id of referenced) {
        expect(defined.has(id), `${file} references ${id} but does not define it`).toBe(true);
      }
    }
  });

  it('never publishes Review or AggregateRating markup', () => {
    // The testimonials are illustrative, not consented attributed quotes. Review
    // markup for them would be a manual-action risk that costs more than every
    // other gain here combined — this is the assertion that keeps someone from
    // adding it back without reading src/site/data.js first.
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      expect(html, `${file} emits Review markup`).not.toContain('"@type":"Review"');
      expect(html, `${file} emits AggregateRating markup`).not.toContain('"@type":"AggregateRating"');
    }
  });

  it('writes a sitemap and llms.txt covering every built page', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
    expect(existsSync(join(DIST, 'llms.txt'))).toBe(true);
    expect(existsSync(join(DIST, 'llms-full.txt'))).toBe(true);

    for (const file of htmlFiles()) {
      const slug = slugOf(file);
      const url =
        slug === 'index' ? 'https://www.aquaviaworld.com/' : `https://www.aquaviaworld.com/${slug}`;
      expect(sitemap, `sitemap is missing ${url}`).toContain(`<loc>${url}</loc>`);
    }
  });
});

describe('claims register', () => {
  it('never renders a value for an unverified claim', () => {
    // The whole point of the register: a TODO claim cannot reach a page, so a
    // placeholder cannot be forgotten and shipped as fact.
    for (const { key } of outstandingClaims()) {
      expect(CLAIMS[key as keyof typeof CLAIMS]).not.toHaveProperty('value');
    }
  });

  it('attaches an attribution to every supplier-attested claim', () => {
    for (const [key, claim] of Object.entries(CLAIMS)) {
      if (claim.status !== 'SUPPLIER_ATTESTED') continue;
      expect(claim, `${key} is attested but names no source`).toHaveProperty('attribution');
    }
  });
});

describe('generated vercel.json', () => {
  it('matches what scripts/gen-vercel.mjs would write', () => {
    // vercel.json has to be committed — Vercel reads it before the build command
    // runs, so a file that only exists after `npm run build` would never be seen.
    // That makes drift possible, and this is what makes it loud: add a content
    // page without running the generator and this fails.
    const committed = readFileSync(resolve(__dirname, '../../../vercel.json'), 'utf8');
    expect(committed).toBe(serialise(buildVercelConfig()));
  });
});
