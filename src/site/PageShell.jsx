import { useEffect } from 'react'

import { ConsentBanner } from '../analytics/consent.jsx'
import { initDelegatedTracking } from '../analytics/delegate'
import { initTracker } from '../analytics/tracker'
import { Footer } from './Footer.jsx'
import { Navbar } from './Navbar.jsx'
import { WhatsAppButton } from './WhatsAppButton.jsx'
import { ROUTES, SITE_URL } from './data'
import { GeoContext, useGeoContent, useGeoTarget, useSEO } from './hooks'
import { useGlobalStyles } from './styles'

/**
 * Everything every route shares.
 *
 * This is the old App() wrapper, minus the section list. Each of the six page
 * entries renders one of these around its own sections, which is what lets the
 * navbar, footer, floating WhatsApp button, consent banner, global stylesheet
 * and analytics boot exist once per page without being copied six times.
 *
 * `padTop` clears the 72px fixed navbar. Home passes false because HeroSection
 * carries its own paddingTop:72 (it always has — it was the only section that
 * ever sat directly under the bar).
 */
export function PageShell({ route, padTop = true, children }) {
  const meta = ROUTES[route]

  useGlobalStyles()
  const geo = useGeoTarget()
  const content = useGeoContent(geo)

  // Analytics boot. Both are idempotent, which matters because React Strict Mode
  // double-invokes effects in development — without the guard every visitor would
  // record two page views locally and none of the numbers would be trustworthy.
  useEffect(() => {
    initTracker()
    initDelegatedTracking()
  }, [])

  useSEO({
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    // Trailing slash on the root only, matching what the sitemap declares.
    canonical: meta.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${meta.path}`,
    schema: meta.schema,
  })

  /**
   * Resolve the URL fragment ourselves, once.
   *
   * The browser looks for #faq while parsing the served HTML — at which point
   * the shell is an empty <div id="root"> and React has rendered nothing, so it
   * finds no such element and the document never moves. On the single-page site
   * this never came up: every anchor was already in the DOM and navigation went
   * through scrollIntoView on a live node. Now that sections live on separate
   * routes, /products#customizer, /pricing#faq and every cross-route SiteSearch
   * hit depend on this running after the tree is committed.
   *
   * Deliberately not scrollIntoView, for the same reason scrollToFiltration
   * isn't: #filtration sits inside a section with overflow:hidden, which is its
   * own scrollport, and scrollIntoView stops there. Scrolling the window against
   * the absolute offset skips the intervening scrollport. 96px clears the navbar.
   */
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    // 'instant' because the deep link IS the destination — animating a scroll
    // the visitor did not initiate, under html { scroll-behavior: smooth }, would
    // sweep them through the whole page to get there.
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'instant' })
  }, [])

  useEffect(() => {
    document.documentElement.lang = 'en-IN'
    const setLink = (rel, href, extra) => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const l = document.createElement('link'); l.rel = rel; l.href = href
      if (extra) Object.assign(l, extra)
      document.head.appendChild(l)
    }
    // Font preconnects live as static tags in each route's HTML — adding them
    // from here fired them at ~1.7s, long after they could help. Only the
    // ipapi.co hint is still worth setting at runtime.
    //
    // This is a single-language site, so there are no rel=alternate hreflang
    // tags to emit.
    setLink('dns-prefetch', 'https://ipapi.co')
  }, [])

  return (
    <GeoContext.Provider value={{ geo, content }}>
      <div role="main" style={{ fontFamily:'DM Sans, sans-serif' }}>
        <Navbar />
        <div style={padTop ? { paddingTop: 72 } : undefined}>
          {children}
        </div>
        <Footer />
        <WhatsAppButton />
        <ConsentBanner />
      </div>
    </GeoContext.Provider>
  )
}
