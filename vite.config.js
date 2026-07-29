import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Content routes, read from the content index without importing it.
 *
 * The dev server needs to map /guides/foo to a page, and the build needs to know
 * the content entry exists. Reading the slugs as text keeps this config free of
 * the JSX and app imports that src/content pulls in — a vite.config that imports
 * application code is a config that can fail to load because of an app bug.
 */
function contentSlugs() {
  const index = readFileSync(resolve(__dirname, 'src/content/index.js'), 'utf8')
  return [...index.matchAll(/from '\.\/([^']+)'/g)]
    .map(([, file]) => readFileSync(resolve(__dirname, 'src/content', file), 'utf8'))
    .map((src) => src.match(/^\s*slug:\s*'([^']+)'/m)?.[1])
    .filter(Boolean)
}

// Every extensionless route and the file that serves it. Production does this
// with rewrites in vercel.json; this table is what keeps `vite dev` agreeing
// with it, and is the single place a new route has to be registered.
const ROUTE_FILES = {
  '/': 'index.html',
  '/products': 'products.html',
  '/pricing': 'pricing.html',
  '/process': 'process.html',
  '/resources': 'resources.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/admin': 'admin.html',
}

/**
 * Content pages all share one HTML template and one bundle, so in dev every
 * /guides/... and /for/... path resolves to content.html and the entry reads
 * which page it is from the URL. In production each has its own prerendered
 * file, written by scripts/prerender.mjs and routed by the generated
 * vercel.json.
 */
const CONTENT_ROUTES = Object.fromEntries(contentSlugs().map((slug) => [`/${slug}`, 'content.html']))

/**
 * Clean URLs in the dev server.
 *
 * With appType 'mpa' Vite serves products.html only at /products.html, so
 * /products — the URL production actually uses, and the one every link in the
 * app points at — would 404 locally. This rewrites the request before Vite's
 * own middleware sees it, so the two environments address pages identically.
 */
function mpaCleanUrls() {
  return {
    name: 'mpa-clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query] = req.url.split('?')
        const clean = path.replace(/\/$/, '') || '/'
        const file = ROUTE_FILES[clean] ?? CONTENT_ROUTES[clean]
        if (file) {
          // The content entry reads data-route from #root in production. In dev
          // there is no prerender to write it, so the slug rides along as a
          // query parameter and content.jsx falls back to it.
          const extra = CONTENT_ROUTES[clean] ? `route=${encodeURIComponent(clean.slice(1))}` : ''
          const qs = [query, extra].filter(Boolean).join('&')
          req.url = '/' + file + (qs ? '?' + qs : '')
        }
        next()
      })
    },
  }
}

/**
 * The loading shimmer.
 *
 * A page is blank from the first byte until the bundle has parsed and React has
 * committed — around 1.7s on the measurement in index.html. What used to fill
 * that window was nothing in production and a frame of unstyled DOM in dev; this
 * fills it with a skeleton of the layout that is about to arrive.
 *
 * Injected by a plugin rather than pasted into all nine HTML files because it is
 * one thing: nine copies of it is nine places to forget. transformIndexHtml runs
 * for `vite dev` and for the build alike, so both environments get the identical
 * shell.
 *
 * Three rules make it disappear at the right moment, in this order of speed:
 *
 *   1. Prerendered pages (`#root[data-prerendered]`) already carry the real page
 *      in the served HTML, so the shimmer must never paint over it. Pure CSS, so
 *      this resolves before the first paint rather than after the bundle lands.
 *   2. `useGlobalStyles()` removes the node once a route has mounted.
 *   3. The @media (prefers-reduced-motion) rule stills the sweep — a full-screen
 *      animated gradient is exactly what that preference is about.
 *
 * It carries no text and is aria-hidden, so nothing here is content a crawler or
 * a screen reader has to reason about.
 */
function bootShimmer() {
  const css = `
    #aq-boot {
      position: fixed; inset: 0; z-index: 2000;
      background: #080D16; padding: 0 5%;
      font-size: 0; pointer-events: none;
    }
    #root[data-prerendered] ~ #aq-boot { display: none; }
    .aq-boot-bar {
      display: flex; align-items: center; gap: 20px;
      height: 64px; border-bottom: 1px solid rgba(62,207,191,0.22);
    }
    .aq-sk {
      background: #0b2244;
      background-image: linear-gradient(100deg, transparent 20%, rgba(62,207,191,0.13) 50%, transparent 80%);
      background-size: 260% 100%;
      border-radius: 6px;
      animation: aqSweep 1.25s ease-in-out infinite;
    }
    @keyframes aqSweep { from { background-position: 140% 0 } to { background-position: -140% 0 } }
    .aq-sk-mark { width: 46px; height: 46px; border-radius: 50%; flex: none; }
    .aq-sk-word { width: 132px; height: 26px; flex: none; }
    .aq-sk-link { width: 62px; height: 12px; flex: none; }
    .aq-sk-cta { width: 150px; height: 40px; border-radius: 50px; flex: none; margin-left: auto; }
    .aq-boot-body { padding-top: 92px; max-width: 760px; }
    .aq-boot-body .aq-sk { height: 20px; margin-bottom: 18px; }
    .aq-sk-h1 { height: 46px !important; width: 78%; margin-bottom: 34px !important; }
    .aq-sk-l2 { width: 92%; }
    .aq-sk-l3 { width: 84%; }
    .aq-sk-l4 { width: 46%; }
    .aq-boot-cards { display: flex; gap: 24px; margin-top: 54px; }
    .aq-boot-cards .aq-sk { flex: 1; height: 190px; border-radius: 20px; }
    @media (max-width: 900px) {
      .aq-sk-link, .aq-sk-cta, .aq-boot-cards > .aq-sk:nth-child(n+3) { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .aq-sk { animation: none; } }
  `
  const markup = `
    <div id="aq-boot" aria-hidden="true">
      <div class="aq-boot-bar">
        <div class="aq-sk aq-sk-mark"></div>
        <div class="aq-sk aq-sk-word"></div>
        <div class="aq-sk aq-sk-link"></div>
        <div class="aq-sk aq-sk-link"></div>
        <div class="aq-sk aq-sk-link"></div>
        <div class="aq-sk aq-sk-cta"></div>
      </div>
      <div class="aq-boot-body">
        <div class="aq-sk aq-sk-h1"></div>
        <div class="aq-sk"></div>
        <div class="aq-sk aq-sk-l2"></div>
        <div class="aq-sk aq-sk-l3"></div>
        <div class="aq-sk aq-sk-l4"></div>
      </div>
      <div class="aq-boot-cards">
        <div class="aq-sk"></div><div class="aq-sk"></div><div class="aq-sk"></div>
      </div>
    </div>`

  return {
    name: 'aq-boot-shimmer',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('</head>', `  <style id="aq-boot-css">${css}</style>\n  </head>`)
          .replace('</body>', `${markup}\n  </body>`)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), mpaCleanUrls(), bootShimmer()],
  // Not 'spa': the SPA fallback would serve index.html for any unmatched path,
  // so a broken route would silently render the home page in dev and only fail
  // in production.
  appType: 'mpa',
  build: {
    rollupOptions: {
      // Multi-page build. One entry per route, so each page's HTML carries its
      // own crawler-readable head. The admin dashboard is a separate entry so
      // none of its chart code, tables, or polling logic ends up in the
      // marketing bundle that every visitor downloads.
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        process: resolve(__dirname, 'process.html'),
        resources: resolve(__dirname, 'resources.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        admin: resolve(__dirname, 'admin.html'),
        // Not a page. It is the template that makes Rollup emit a hashed bundle
        // for the shared content entry; scripts/prerender.mjs reuses its asset
        // tags for all ~23 generated pages and deletes the file from dist.
        content: resolve(__dirname, 'content.html'),
      },
    },
  },
  server: {
    proxy: {
      // `vite dev` serves the SPA; `vercel dev` serves the functions. Proxying
      // lets the normal Vite dev server work against a locally running API.
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
