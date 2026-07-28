import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * The mount step, shared by all six route entries.
 *
 * Page components live in src/pages and only describe their sections; mounting
 * is separated out so a test can renderToString a page without a DOM and
 * without a #root to attach to.
 */
export function mount(Page) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Page />
    </StrictMode>,
  )
}
