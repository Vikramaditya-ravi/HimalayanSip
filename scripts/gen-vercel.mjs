/**
 * Generates vercel.json from vercel.base.json plus the content index.
 *
 * Every content page needs two entries in vercel.json — a rewrite so /faq serves
 * faq.html, and a redirect so the .html spelling collapses onto the clean URL.
 * With ~23 pages that is ~46 hand-maintained entries whose only job is to
 * restate what src/content already knows, and the first one anybody forgets is a
 * 404 in production that works perfectly in dev.
 *
 * So the file is derived. `vercel.base.json` holds the parts a human decides —
 * crons, security headers, the six original routes — and this merges the
 * generated entries into it.
 *
 * Why vercel.json stays COMMITTED rather than gitignored: Vercel reads it to
 * configure the deployment before the build command runs, so a file that only
 * exists after `npm run build` would never be seen. The vitest assertion in
 * src/site/__tests__ fails the suite if the committed copy has drifted from what
 * this script would produce, which is what makes "generated but committed" safe.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Read the slugs without importing the modules.
 *
 * src/content/*.js import from src/site/data.js, which is fine for a bundler and
 * awkward for a bare `node scripts/…` invocation that has to run as a prebuild
 * step before anything is compiled. The index is a plain list of imports, so the
 * slugs can be read from the modules' own `slug:` declarations.
 */
export function contentSlugs() {
  const index = readFileSync(join(ROOT, 'src/content/index.js'), 'utf8')
  const files = [...index.matchAll(/from '\.\/([^']+)'/g)].map((m) => m[1])
  return files.map((file) => {
    const src = readFileSync(join(ROOT, 'src/content', file), 'utf8')
    const slug = src.match(/^\s*slug:\s*'([^']+)'/m)?.[1]
    if (!slug) throw new Error(`gen-vercel: no slug in src/content/${file}`)
    return slug
  })
}

export function buildVercelConfig() {
  const { '//': _note, ...base } = JSON.parse(readFileSync(join(ROOT, 'vercel.base.json'), 'utf8'))
  const slugs = contentSlugs().sort()

  return {
    ...base,
    // Longest paths first. Vercel evaluates these in order, and /for/hotels
    // must not be shadowed by a broader rule declared before it.
    redirects: [
      ...base.redirects,
      ...slugs.map((slug) => ({
        source: `/${slug}.html`,
        destination: `/${slug}`,
        permanent: true,
      })),
    ],
    rewrites: [
      ...base.rewrites,
      ...slugs.map((slug) => ({ source: `/${slug}`, destination: `/${slug}.html` })),
    ],
  }
}

export function serialise(config) {
  return `${JSON.stringify(config, null, 2)}\n`
}

// Only write when run directly, so the test can import and compare without
// rewriting the file it is checking.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const config = buildVercelConfig()
  writeFileSync(join(ROOT, 'vercel.json'), serialise(config))
  console.log(`  gen-vercel: wrote vercel.json (${config.rewrites.length} rewrites, ${config.redirects.length} redirects)`)
}
