import { useEffect, useRef, useState } from 'react'

import { SiteSearch } from '../SiteSearch.jsx'
import { BROCHURE_URL, NAV_LINKS, SEARCH_INDEX, SECTION_ROUTES, currentPath } from './data'
import { DownloadIcon } from './ui.jsx'

// The droplet silhouette, lifted verbatim from the master logo artwork so the
// nav mark and the favicon are the same shape. Local coords, centred on (0,0):
// spans x -42..42, y -55..64.
const DROPLET = 'M 0 -55 C 22 -26, 42 -2, 42 20 C 42 46, 24 64, 0 64 C -24 64, -42 46, -42 20 C -42 -2, -22 -26, 0 -55 Z'

// Where to park the top of the water slab for a given 0..1 fill. 64 is the
// droplet's bottom edge and 125 a shade more than its 119 height, so fill=0
// leaves the waterline just below the silhouette and fill=1 carries it just
// above — neither end shows a seam.
const WATERLINE = (fill) => (64 - fill * 125).toFixed(2)

/**
 * The navbar lockup.
 *
 * Three things were burying the previous one, and only one of them was colour.
 * It was an <img> of aquavia-mark.svg, which carries the artwork's own opaque
 * #080D16 plate, so it read as a dark box rather than a mark — and a box reads
 * as chrome, not identity. That file's viewBox also runs out to the r=130 orbit
 * ring to keep the ring closed, which is the right call for a favicon and the
 * wrong one here: the ring is invisible at this size, so over half the logo's
 * area was rendering nothing and the droplet came out at ~20px. And the bar
 * never said "AquaVia" anywhere, so there was nothing to read.
 *
 * Hence: inline SVG cropped to the droplet alone, no plate, at roughly twice
 * the old size, with the wordmark set beside it.
 *
 * The droplet then doubles as the page's scroll gauge — its water level rises
 * from 35% at the top of the page to full at the footer. It is the only motion
 * in the bar, it is user-driven rather than ambient, and a vessel filling with
 * water is the product itself. The level is written straight to the node's SVG
 * transform attribute by the scroll handler, so scrolling never re-renders
 * React.
 */
function BrandLockup({ waterRef }) {
  return (
    <>
      <svg className="brand-drop" viewBox="-48 -61 96 131" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="bm-water" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#5CE0CC" />
            <stop offset="100%" stopColor="#13A89E" />
          </linearGradient>
          <clipPath id="bm-clip"><path d={DROPLET} /></clipPath>
        </defs>

        {/* the empty part of the vessel — faint, but never nothing */}
        <path d={DROPLET} fill="rgba(62,207,191,0.10)" />

        {/* the water. A slab far taller than the droplet, topped with a gentle
            meniscus, clipped to the silhouette and slid down by (1 - fill). The
            slab has to overshoot in both directions or the bottom edge lifts
            into view once the level gets high. */}
        <g clipPath="url(#bm-clip)">
          <path ref={waterRef} className="brand-water" fill="url(#bm-water)"
            transform={`translate(0 ${WATERLINE(0.35)})`}
            d="M -48 0 Q -24 -7, 0 0 T 48 0 L 48 200 L -48 200 Z" />
        </g>

        <path d={DROPLET} fill="none" stroke="var(--aqua)" strokeWidth="4" strokeOpacity="0.85" />
      </svg>
      <span className="brand-word">AQUAVIA</span>
    </>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const waterRef = useRef(null)

  useEffect(() => {
    // The gauge is the only thing in the bar that moves. If motion is unwelcome,
    // the droplet just sits full.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const handler = () => {
      setScrolled(window.scrollY > 60)
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const span = document.documentElement.scrollHeight - window.innerHeight
        const progress = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 1
        // Floored at 0.35: the gauge is the flourish, legibility is the job, and
        // a droplet drawn as an empty outline at the top of every page would
        // trade the second for the first.
        const fill = still.matches ? 1 : 0.35 + 0.65 * progress
        waterRef.current?.setAttribute('transform', `translate(0 ${WATERLINE(fill)})`)
      })
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)

    // Home's heavy sections mount lazily, so the document keeps growing after
    // the first paint. Without this the level is computed against a scrollHeight
    // that is about to change and reads high until the next scroll event.
    const grew = new ResizeObserver(handler)
    grew.observe(document.documentElement)

    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
      grew.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Read once: this is a multi-page app, so the path cannot change without a
  // full document load, and there is no history event to subscribe to.
  const here = currentPath()

  /**
   * SiteSearch indexes by section, not by route. A hit on a section that lives
   * on this page still scrolls; a hit on one that lives elsewhere navigates and
   * lets the browser resolve the fragment.
   *
   * Home renders every section, so from / the answer is always "it is on this
   * page" — sending someone to /pricing when the pricing table is a scroll away
   * would throw away their position in a page they are still reading.
   */
  const navigate = (sectionId) => {
    const route = here === '/' ? '/' : (SECTION_ROUTES[sectionId] || '/')
    if (route === here) {
      const el = document.getElementById(sectionId)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
      // Home's heavy sections are lazy, so the target may not be mounted yet.
      // Reloading with the fragment is what useLazySection(anchorId) reads to
      // mount it up front.
      window.location.href = `${route}#${sectionId}`
      return
    }
    window.location.href = `${route}#${sectionId}`
  }

  return (
    <nav className={scrolled ? 'nav-scrolled' : ''} style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 1000, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%', transition: 'all 0.4s ease', background: 'transparent'
    }}>
      {/* Logo */}
      <a className="brand-lockup" href="/" aria-label="AquaVia — home">
        <BrandLockup waterRef={waterRef} />
      </a>

      {/* Nav links
          Real anchors pointing at real routes. These were <button onClick={scrollTo}>,
          which left the rendered page with zero internal links — Google could
          see none of the site's structure and the page could not earn
          sitelinks. Now every one of them is a crawlable edge in the site graph,
          and middle-click / "open in new tab" work the way they should. */}
      <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {NAV_LINKS.map(({ href, label }) => {
          const active = href === here
          // The active link borrows the existing hover colour rather than
          // introducing a new treatment, so nothing about the bar looks new.
          const restColor = active ? 'var(--white)' : 'var(--muted)'
          return (
            <a key={href} href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                background: 'none', border: 'none', color: restColor, fontSize: 14,
                fontFamily: 'DM Sans, sans-serif', fontWeight: 500, cursor: 'pointer',
                transition: 'color 0.2s',
                padding: '4px 0', textDecoration: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
              // Resets to the resting colour for THIS link, not unconditionally
              // to muted — otherwise hovering the active link demotes it.
              onMouseLeave={e => e.currentTarget.style.color = restColor}
            >{label}</a>
          )
        })}
        <SiteSearch index={SEARCH_INDEX} onNavigate={navigate} />
      </div>

      {/* One CTA. The brochure is now the single primary action in the bar, so it
          takes the solid gradient pill and survives on mobile (the label collapses
          to the icon below 768px — see .nav-brochure). The contact path is still
          one tap away via the nav links and the footer. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a
          className="nav-brochure dl-btn"
          href={BROCHURE_URL}
          download
          target="_blank"
          rel="noopener"
          aria-label="Download the pricing brochure (PDF)"
          data-evt="pricing_brochure_downloaded"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
            border: 'none', borderRadius: 50, padding: '10px 22px',
            color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            fontSize: 14, cursor: 'pointer', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(62,207,191,0.18)',
            transition: 'transform 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(62,207,191,0.28)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,207,191,0.18)' }}
        >
          <DownloadIcon />
          <span className="nav-brochure-label">Brochure</span>
        </a>
      </div>
    </nav>
  )
}
