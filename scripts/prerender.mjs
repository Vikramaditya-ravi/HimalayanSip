/**
 * Build-time prerender.
 *
 * The problem this solves, measured before it was written: fetching any route as
 * GPTBot returned about 85 words. The served <body> was an empty
 * `<div id="root">` plus a hand-maintained <noscript> block, because every page
 * was client-rendered. Googlebot executes JavaScript and eventually saw the real
 * page; GPTBot, ClaudeBot, PerplexityBot and CCBot generally do not, so the
 * content that would earn a citation was invisible to precisely the engines this
 * work targets.
 *
 * So: render every page to a string at build time and write it into the HTML
 * that ships. The pages have been renderToString-compatible since the multi-page
 * split — src/analytics/__tests__/render.test.tsx has been doing exactly this in
 * CI — so this is a build step, not a rewrite.
 *
 * What it does, in order:
 *
 *   1. reads dist/content.html for the hashed asset tags Vite emitted for the
 *      shared content bundle, then deletes it (it is a template, not a page);
 *   2. injects markup + inlined CSS into the six hand-built route files;
 *   3. writes a complete HTML document for each of the ~23 content pages;
 *   4. emits sitemap.xml, llms.txt and llms-full.txt from the same route data.
 *
 * Everything it needs comes from dist-ssr/server.js, built by
 * `vite build --ssr src/entries/server.jsx`. This script contains no knowledge
 * of the site's content — it moves strings.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { renderToString } from 'react-dom/server'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

// Imported through pathToFileURL rather than as a bare path: Node's ESM loader
// accepts only file:, data: and node: URLs, and on Windows an absolute path
// reads as protocol 'c:' and throws ERR_UNSUPPORTED_ESM_URL_SCHEME.
const {
  ROUTES, ROUTE_FILES, SITE_URL, GLOBAL_CSS,
  CONTENT_PAGES, renderRoute, renderContentPage, contentMeta, graphFor, graphForContent,
} = await import(pathToFileURL(join(ROOT, 'dist-ssr/server.js')).href)

// ─── Head fragments ───────────────────────────────────────────────────────────

/**
 * Sets html.js-on before first paint.
 *
 * The .reveal rules in styles.js are scoped to this class. Unscoped they are
 * `opacity: 0` waiting for an IntersectionObserver, which on a prerendered page
 * would mean a crawler receiving a complete document and rendering all of it
 * invisible, and a visitor watching the content paint and then disappear. Inline
 * and synchronous in <head> so the class is present before the browser paints
 * anything at all.
 */
const JS_ON = '<script>document.documentElement.classList.add("js-on")</script>'

const inlineCss = () => `<style id="aq-global">${GLOBAL_CSS}</style>`

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * JSON-LD, escaped for embedding.
 *
 * `<` inside a JSON string would otherwise let a value containing "</script>"
 * terminate the block early. Nothing in this site's data does that today, which
 * is exactly the kind of thing that stops being true later.
 */
const jsonLd = (graph) =>
  `<script type="application/ld+json" id="hs-schema">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`

function headTags(meta, graph, canonical) {
  const ogImage = `${SITE_URL}/og-cover.jpg`
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.keywords ? `<meta name="keywords" content="${esc(meta.keywords)}" />` : '',
    '<meta name="robots" content="index, follow" />',
    '<meta name="author" content="AquaVia" />',
    '<meta name="theme-color" content="#080D16" />',
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    '<meta property="og:site_name" content="AquaVia" />',
    '<meta property="og:locale" content="en_IN" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    '<meta name="twitter:site" content="@AquaVia" />',
    jsonLd(graph),
  ].filter(Boolean).join('\n    ')
}

// ─── The six hand-built routes ────────────────────────────────────────────────

/**
 * Tags this script now owns, stripped from a route's hand-written head before
 * the generated ones are inserted.
 *
 * Everything NOT in this list is left alone — the favicons, the font
 * preconnects, and the hero-image preload that belongs only on the home page.
 * Those are genuine per-route decisions. The SEO tags are not: they were
 * duplicated by hand from ROUTES in src/site/data.js under a comment insisting
 * the two "must stay byte-identical", which is an invariant maintained by
 * remembering. Generating them is what retires it.
 */
const OWNED_HEAD_TAGS = [
  /<title>[\s\S]*?<\/title>\s*/,
  /<meta name="(description|keywords|robots|author|theme-color)"[^>]*>\s*/g,
  /<link rel="canonical"[^>]*>\s*/,
  /<meta property="og:[^"]*"[^>]*>\s*/g,
  /<meta name="twitter:[^"]*"[^>]*>\s*/g,
  /<script type="application\/ld\+json" id="hs-schema">[\s\S]*?<\/script>\s*/,
]

/**
 * Injects markup and a generated head into a route's existing HTML file.
 *
 * These six files stay hand-maintained, because each carries route-specific
 * decisions worth keeping. But their SEO head is now generated from the same
 * ROUTES entry and the same schema builder the component renders from, so the
 * served <title>, canonical and JSON-LD cannot disagree with the page — which
 * they already had: these files still carried the flat LocalBusiness blob that
 * src/site/schema.js replaced with a connected @graph.
 */
function prerenderRoute(route) {
  const file = join(DIST, ROUTE_FILES[route])
  let html = readFileSync(file, 'utf8')
  const meta = ROUTES[route]
  const canonical = meta.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${meta.path}`
  const markup = renderRoute(route)

  for (const pattern of OWNED_HEAD_TAGS) html = html.replace(pattern, '')

  // Replaces #root and everything inside it, which is where the <noscript>
  // block lived. That block was a hand-written parallel copy of the page for
  // non-executing crawlers; now that they receive the real page it would be
  // duplicate content inside the same document, and a second copy of the truth
  // guaranteed to drift from the first.
  //
  // The non-greedy match stops at the first </div>, which is #root's own —
  // nothing inside it contains a nested <div>. The assertion below is what
  // catches it if that ever stops being true.
  const before = html
  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    () => `<div id="root" data-prerendered="true">${markup}</div>`,
  )
  if (html === before) throw new Error(`prerender: could not find #root in ${ROUTE_FILES[route]}`)
  if (html.includes('<noscript>')) {
    throw new Error(`prerender: <noscript> survived in ${ROUTE_FILES[route]} — #root match was too short`)
  }

  html = html.replace(
    '</head>',
    `  ${headTags(meta, graphFor(route, meta), canonical)}\n    ${inlineCss()}\n    ${JS_ON}\n  </head>`,
  )
  writeFileSync(file, html)
  return markup.length
}

// ─── Generated content pages ──────────────────────────────────────────────────

/**
 * The shared shell for content pages.
 *
 * dist/content.html is what Vite produced from the content.html template at the
 * repo root: a document carrying the correct hashed <script> and <link> tags for
 * src/entries/content.jsx. Splitting it at #root gives a prefix and a suffix
 * that every generated page reuses, so the asset hashes can never go stale
 * against the bundle — they come from the build that just ran.
 */
function loadShell() {
  const path = join(DIST, 'content.html')
  const html = readFileSync(path, 'utf8')
  rmSync(path)
  const [head, rest] = html.split('<div id="root"></div>')
  if (rest === undefined) throw new Error('prerender: content.html shell has no #root')
  return { head, tail: rest }
}

function prerenderContent(page, shell) {
  const meta = contentMeta(page)
  const canonical = `${SITE_URL}${meta.path}`
  const graph = graphForContent(page, page.schema?.() ?? [])
  const markup = renderToString(renderContentPage(page))

  const head = shell.head
    .replace('<title>AquaVia</title>', '')
    .replace('<meta name="robots" content="noindex, nofollow" />', '')
    .replace('</head>', `  ${headTags(meta, graph, canonical)}\n    ${inlineCss()}\n    ${JS_ON}\n  </head>`)

  const html =
    head +
    `<div id="root" data-prerendered="true" data-route="${esc(page.slug)}">${markup}</div>` +
    shell.tail

  const out = join(DIST, `${page.slug}.html`)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, html)
  return markup.length
}

// ─── Generated artefacts ──────────────────────────────────────────────────────

function writeSitemap() {
  const urls = [
    ...Object.entries(ROUTES).map(([, meta]) => ({
      loc: meta.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${meta.path}`,
      priority: meta.path === '/' ? '1.0' : '0.8',
      changefreq: 'monthly',
    })),
    ...CONTENT_PAGES.map((p) => ({
      loc: `${SITE_URL}/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: p.updatedAt,
    })),
  ]
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')
  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  )
  return urls.length
}

/**
 * llms.txt and llms-full.txt.
 *
 * Framed honestly: Google has said it does not use llms.txt, and it is not a
 * ranking factor anywhere. It is generated from the same index that builds the
 * pages, costs nothing to maintain, cannot go stale, and some assistants do
 * fetch it. Low cost, non-zero upside — that is the entire argument for it.
 */
function writeLlmsTxt() {
  const lines = [
    '# AquaVia',
    '',
    '> Custom branded bottled water for businesses across Delhi NCR. AquaVia prints client branding on 250ml, 500ml and 1 litre packaged drinking water bottles, bottled by a licensed partner plant, and delivers them in bulk.',
    '',
    'AquaVia is the brand owner, not the bottler. BIS IS 14543 and FSSAI licences for the plant are held by the bottling partner. Figures we have not verified are not published — see /specifications.',
    '',
    '## Core pages',
    '',
    ...Object.entries(ROUTES).map(
      ([, m]) => `- [${m.title}](${SITE_URL}${m.path === '/' ? '/' : m.path}): ${m.description}`,
    ),
    '',
    '## Reference and guides',
    '',
    ...CONTENT_PAGES.map((p) => `- [${p.h1}](${SITE_URL}/${p.slug}): ${p.description}`),
    '',
  ]
  writeFileSync(join(DIST, 'llms.txt'), lines.join('\n'))

  const full = [
    '# AquaVia — full content',
    '',
    ...CONTENT_PAGES.flatMap((p) => [
      `## ${p.h1}`,
      `URL: ${SITE_URL}/${p.slug}`,
      `Updated: ${p.updatedAt}`,
      '',
      p.answerBlock,
      '',
      ...(p.keyFacts ?? []).map((f) => `- ${f.term}: ${f.detail}`),
      '',
      ...p.sections.flatMap((s) => [
        `### ${s.heading}`,
        ...(s.body ?? []),
        ...(s.list ?? []).map((i) => (typeof i === 'string' ? `- ${i}` : `- ${i.term}: ${i.detail}`)),
        ...(s.steps ?? []).map((i, n) => `${n + 1}. ${i.term}: ${i.detail}`),
        ...(s.table ? [tableToMarkdown(s.table)] : []),
        ...(s.after ?? []),
        '',
      ]),
      ...(p.faqs ?? []).flatMap((f) => [`**${f.q}**`, f.a, '']),
      '',
    ]),
  ]
  writeFileSync(join(DIST, 'llms-full.txt'), full.join('\n'))
}

function tableToMarkdown(t) {
  const head = `| ${t.head.join(' | ')} |`
  const rule = `| ${t.head.map(() => '---').join(' | ')} |`
  const rows = t.rows.map((r) => `| ${r.join(' | ')} |`)
  return [t.caption ? `_${t.caption}_` : '', head, rule, ...rows].filter(Boolean).join('\n')
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const shell = loadShell()

let routeChars = 0
for (const route of Object.keys(ROUTE_FILES)) routeChars += prerenderRoute(route)

let contentChars = 0
for (const page of CONTENT_PAGES) contentChars += prerenderContent(page, shell)

const urlCount = writeSitemap()
writeLlmsTxt()

// public/sitemap.xml is copied into dist verbatim by Vite, so a stale one left in
// the repo would be overwritten by this script — or worse, would overwrite it if
// the order ever changed. It has been deleted from public/; this asserts the
// generated file actually exists rather than assuming it.
if (!existsSync(join(DIST, 'sitemap.xml'))) throw new Error('prerender: sitemap.xml not written')

console.log(
  `\n  prerendered ${Object.keys(ROUTE_FILES).length} routes (${Math.round(routeChars / 1000)}kB markup)` +
    ` and ${CONTENT_PAGES.length} content pages (${Math.round(contentChars / 1000)}kB markup)` +
    `\n  wrote sitemap.xml (${urlCount} urls), llms.txt, llms-full.txt\n`,
)
