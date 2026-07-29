import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

/**
 * The mount step, shared by all six route entries.
 *
 * Page components live in src/pages and only describe their sections; mounting
 * is separated out so a test can renderToString a page without a DOM and
 * without a #root to attach to.
 *
 * Two modes, chosen by what is already in #root:
 *
 * - **Hydrate** when scripts/prerender.mjs has stamped `data-prerendered`. The
 *   served HTML already contains the full page, and createRoot would throw all
 *   of it away and rebuild it from scratch — a blank frame on every load, and
 *   the entire point of prerendering lost. hydrateRoot adopts the existing DOM
 *   and only attaches behaviour to it.
 * - **Create** otherwise, which is `vite dev`: nothing prerenders there, #root
 *   is empty, and hydrateRoot against an empty container would warn on every
 *   page load.
 */
export function mount(Page) {
  const root = document.getElementById('root')
  const app = (
    <StrictMode>
      <Page />
    </StrictMode>
  )
  if (root.dataset.prerendered === 'true') hydrateRoot(root, app)
  else createRoot(root).render(app)
}
