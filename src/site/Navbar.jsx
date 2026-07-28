import { useEffect, useState } from 'react'

import { SiteSearch } from '../SiteSearch.jsx'
import { BROCHURE_URL, NAV_LINKS, SEARCH_INDEX, SECTION_ROUTES, currentPath } from './data'
import { DownloadIcon } from './ui.jsx'

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Read once: this is a multi-page app, so the path cannot change without a
  // full document load, and there is no history event to subscribe to.
  const here = currentPath()

  /**
   * SiteSearch indexes by section, not by route. A hit on a section that lives
   * on this page still scrolls; a hit on one that has moved elsewhere navigates
   * and lets the browser resolve the fragment.
   */
  const navigate = (sectionId) => {
    const route = SECTION_ROUTES[sectionId] || '/'
    if (route === here) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
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
      <a href="/" aria-label="AquaVia — home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img src="/aquavia-logo.jpeg" alt="AquaVia" style={{ height: 48, borderRadius: 8, display: 'block' }} />
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
