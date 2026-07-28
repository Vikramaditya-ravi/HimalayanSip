import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        const file = ROUTE_FILES[path.replace(/\/$/, '') || '/']
        if (file) req.url = '/' + file + (query ? '?' + query : '')
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
