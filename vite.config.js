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

export default defineConfig({
  plugins: [react(), mpaCleanUrls()],
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
