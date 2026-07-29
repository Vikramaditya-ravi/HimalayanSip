import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { useEffect } from 'react'

import { ConsentBanner } from '../analytics/consent.jsx'
import { initDelegatedTracking } from '../analytics/delegate'
import { initTracker } from '../analytics/tracker'
import { Footer } from './Footer.jsx'
import { Navbar } from './Navbar.jsx'
import { WhatsAppButton } from './WhatsAppButton.jsx'
import { ROUTES, SITE_URL } from './data'
import { GeoContext, RouteContext, useGeoContent, useGeoTarget, useSEO } from './hooks'
import { graphFor } from './schema'
import { NAV_CLEAR, useGlobalStyles } from './styles'

/**
 * The trail of links above a page's heading.
 *
 * Rendered as an ordered list inside a labelled <nav>, which is what assistive
 * technology and extraction alike expect — and mirrored exactly by the
 * BreadcrumbList node in the page's JSON-LD, so the visible trail and the
 * machine-readable one cannot describe different sites.
 *
 * Home is deliberately not given a breadcrumb: a trail with one entry that
 * points at the page you are already on is noise.
 */
function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        <li><a href="/">Home</a></li>
        {trail.map((crumb, i) => (
          <li key={crumb.path}>
            <span aria-hidden="true" className="crumb-sep">/</span>
            {i === trail.length - 1
              ? <span aria-current="page">{crumb.name}</span>
              : <a href={crumb.path}>{crumb.name}</a>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

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
 *
 * Three things it now owns that it did not before:
 *
 * 1. **The route**, published on RouteContext. The navbar and footer used to ask
 *    window.location which page they were on, which is unanswerable at build
 *    time — see the note on useCurrentPath.
 * 2. **The page's `<h1>`**, from ROUTES[route].h1. Five of six routes had no h1
 *    at all in the rendered DOM: their top heading was a section `<h2>`, so
 *    Google saw five headless pages. Home is the exception — HeroSection carries
 *    the site's h1 and passing `h1` there too would produce two.
 * 3. **The breadcrumb trail**, visible and structured, on every non-home route.
 */
export function PageShell({ route, meta: metaProp, schema: schemaProp, padTop = true, children, trail }) {
  // Generated content pages (src/content) are not in ROUTES — there are two
  // dozen of them and they are data, not hand-registered routes — so they pass
  // their own meta and their own graph instead of a key into the route table.
  const meta = metaProp ?? ROUTES[route]
  const crumbs = trail ?? meta.trail ?? (meta.breadcrumb ? [{ name: meta.breadcrumb, path: meta.path }] : null)

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
    schema: schemaProp ?? graphFor(route, meta),
  })

  /**
   * Resolve the URL fragment ourselves, once.
   *
   * The browser looks for #faq while parsing the served HTML. On a prerendered
   * page the target now exists at parse time and the browser gets there on its
   * own; this still runs for `vite dev`, where #root is empty until React
   * commits, and it corrects the offset in both cases.
   *
   * Deliberately not scrollIntoView, for the same reason scrollToFiltration
   * isn't: #filtration sits inside a section with overflow:hidden, which is its
   * own scrollport, and scrollIntoView stops there. Scrolling the window against
   * the absolute offset skips the intervening scrollport.
   */
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    // 'instant' because the deep link IS the destination — animating a scroll
    // the visitor did not initiate, under html { scroll-behavior: smooth }, would
    // sweep them through the whole page to get there.
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_CLEAR, behavior: 'instant' })
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
    /* `strict` makes any `motion.*` import throw and forces the `m.*` form, so
       the LazyMotion feature bundle stays the thing that decides what ships.
       One careless `import { motion }` would otherwise pull the full feature
       set back into every route's chunk without any visible symptom.

       reducedMotion="user" is not optional here: the blanket
       prefers-reduced-motion rule in styles.js only zeroes CSS animation
       durations, and has no effect whatsoever on JS-driven transforms. */
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <RouteContext.Provider value={meta.path}>
          <GeoContext.Provider value={{ geo, content }}>
            <div style={{ fontFamily:'DM Sans, sans-serif' }}>
              <Navbar />
              {/* A real <main>, not role="main" on a div. The ARIA role was
                  correct as far as it went, but the element carries the same
                  semantics natively and is what extraction heuristics look for
                  when deciding which part of a document is the content. */}
              <main style={padTop ? { paddingTop: NAV_CLEAR } : undefined}>
                {crumbs && (
                  <div className="page-head">
                    <Breadcrumbs trail={crumbs} />
                    <h1 className="page-h1">{meta.h1}</h1>
                    {/* The lede is written to be lifted: one self-contained
                        paragraph, directly under the h1, that answers what the
                        page is about without needing the rest of the page for
                        context. That is the shape an assistant quotes. */}
                    {meta.lede && <p className="page-lede answer-block">{meta.lede}</p>}
                  </div>
                )}
                {children}
              </main>
              <Footer />
              <WhatsAppButton />
              <ConsentBanner />
            </div>
          </GeoContext.Provider>
        </RouteContext.Provider>
      </MotionConfig>
    </LazyMotion>
  )
}
