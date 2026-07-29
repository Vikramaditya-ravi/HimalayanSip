import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

import { ContentPage } from '../content/render.jsx'
import { contentPageBySlug } from '../content/index.js'

/**
 * The one client entry shared by every generated content page.
 *
 * There are two dozen content pages and they all render through the same
 * component, so giving each its own HTML shell and its own entry file — the way
 * the six hand-built routes work — would produce ~50 near-identical files for no
 * benefit. Instead this single bundle is served by all of them, and reads which
 * page it is from `data-route` on the root element, written there by
 * scripts/prerender.mjs.
 *
 * Consequence worth knowing: a visitor who has read one guide has already
 * downloaded the bundle for every other one, so navigation between content pages
 * costs a document fetch and nothing else.
 */
const root = document.getElementById('root')

// data-route is written by the prerenderer. In `vite dev` nothing prerenders, so
// the dev-server middleware in vite.config.js passes the slug as ?route= instead
// — see mpaCleanUrls there.
const slug = root.dataset.route ?? new URLSearchParams(location.search).get('route') ?? ''
const page = contentPageBySlug(slug)

if (page) {
  const app = (
    <StrictMode>
      <ContentPage page={page} />
    </StrictMode>
  )
  // Same rule as src/entries/mount.jsx: adopt the prerendered DOM rather than
  // throwing it away, and only fall back to a fresh render if it is not there.
  if (root.dataset.prerendered === 'true') hydrateRoot(root, app)
  else createRoot(root).render(app)
} else if (import.meta.env.DEV) {
  console.error(`[content] no content module for route "${slug}"`)
}
