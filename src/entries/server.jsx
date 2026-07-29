import { renderToString } from 'react-dom/server'

import { AboutPage } from '../pages/About.jsx'
import { ContactPage } from '../pages/Contact.jsx'
import { HomePage } from '../pages/Home.jsx'
import { PricingPage } from '../pages/Pricing.jsx'
import { ProcessPage } from '../pages/Process.jsx'
import { ProductsPage } from '../pages/Products.jsx'
import { ROUTES, SITE_URL } from '../site/data'
import { GLOBAL_CSS } from '../site/styles'

/**
 * The build-time render entry.
 *
 * `vite build --ssr` compiles this into a single Node-loadable bundle that
 * scripts/prerender.mjs imports. Everything the prerenderer needs to produce a
 * finished HTML document is re-exported from here, so the script itself contains
 * no knowledge of the site's content — it only moves strings around.
 *
 * Rendering these pages server-side is not a new capability being introduced:
 * src/analytics/__tests__/render.test.tsx has run all six through renderToString
 * in a node environment since the multi-page split. This makes the same
 * operation part of the build instead of only part of the test suite.
 */

export const ROUTE_PAGES = {
  home: HomePage,
  products: ProductsPage,
  pricing: PricingPage,
  process: ProcessPage,
  about: AboutPage,
  contact: ContactPage,
}

/** Which built HTML file each route's markup belongs in. */
export const ROUTE_FILES = {
  home: 'index.html',
  products: 'products.html',
  pricing: 'pricing.html',
  process: 'process.html',
  about: 'about.html',
  contact: 'contact.html',
}

export { ROUTES, SITE_URL, GLOBAL_CSS }

/** Markup for one of the six hand-built routes. */
export function renderRoute(route) {
  const Page = ROUTE_PAGES[route]
  if (!Page) throw new Error(`unknown route: ${route}`)
  return renderToString(<Page />)
}

// ─── Generated content pages ──────────────────────────────────────────────────

export { CONTENT_PAGES, contentPageBySlug } from '../content/index.js'
export { contentMeta, renderContentPage } from '../content/render.jsx'
export { graphFor, graphForContent } from '../site/schema'
