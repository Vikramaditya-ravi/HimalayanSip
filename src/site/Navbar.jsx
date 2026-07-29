import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SiteSearch } from '../SiteSearch.jsx'
import { CONTENT_SEARCH_ENTRIES, RESOURCES_PATH } from '../content/index.js'
import { ResourceMenuColumns } from './Resources.jsx'
import { BROCHURE_URL, NAV_LINKS, SEARCH_INDEX, SECTION_ROUTES } from './data'
import { useCurrentPath, useIsomorphicLayoutEffect } from './hooks'
import { DownloadIcon } from './ui.jsx'

/**
 * What site search looks through.
 *
 * SEARCH_INDEX covers the home page's sections. CONTENT_SEARCH_ENTRIES covers
 * the twenty-three pages under src/content, which were unsearchable on their own
 * site until now — the index could not be built in src/site/data.js because the
 * content modules import that file, so the two halves are joined here, at the
 * one component that consumes them.
 */
const FULL_SEARCH_INDEX = [...SEARCH_INDEX, ...CONTENT_SEARCH_ENTRIES]

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
/** Ring the droplet sits inside, centred on the droplet's own visual centre. */
const RING_CY = 5
const RING_R = 70

/**
 * Light points around the emblem: angle in degrees, distance from the ring
 * centre, radius, and the delay that staggers each across the shared 3.2s
 * `twinkle` cycle so they never pulse in unison.
 *
 * These live in SVG user units rather than as absolutely-positioned spans, so
 * they scale with the mark instead of needing their pixel offsets retuned every
 * time its rendered height changes.
 */
const RAYS = [
  { a: -90, r: RING_R, s: 3.4, d: 0 },
  { a: -34, r: RING_R, s: 2.4, d: 0.5 },
  { a: 22, r: RING_R, s: 2.9, d: 1.0 },
  { a: 92, r: RING_R, s: 2.4, d: 1.5 },
  { a: 150, r: RING_R, s: 2.9, d: 2.0 },
  { a: -148, r: RING_R, s: 2.4, d: 2.6 },
  { a: -62, r: 84, s: 2.6, d: 0.8 },
  { a: 137, r: 83, s: 2.1, d: 1.8 },
  { a: -118, r: 82, s: 2.1, d: 2.4 },
]

const polar = (a, r) => [
  (r * Math.cos((a * Math.PI) / 180)).toFixed(2),
  (RING_CY + r * Math.sin((a * Math.PI) / 180)).toFixed(2),
]

function BrandLockup({ waterRef }) {
  return (
    <>
      <span className="brand-mark">
        <svg className="brand-drop" viewBox="-92 -87 184 184" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="bm-water" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#5CE0CC" />
              <stop offset="100%" stopColor="#13A89E" />
            </linearGradient>
            <clipPath id="bm-clip"><path d={DROPLET} /></clipPath>
            {/* Halo behind the droplet. A radial gradient rather than a
                feGaussianBlur: same look, no filter region to manage, and no
                per-frame blur cost on an element that sits on every page. */}
            <radialGradient id="bm-halo">
              <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#3ecfbf" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="0" cy={RING_CY} r="86" fill="url(#bm-halo)" />

          {/* The ring, and a fainter one inside it. Two weights rather than one
              heavy stroke — the emblem has to read at 54px, and a single thick
              circle at that size closes up into a disc. */}
          <circle className="brand-ring" cx="0" cy={RING_CY} r={RING_R}
            fill="none" stroke="var(--aqua)" strokeWidth="2.6" strokeOpacity="0.82" />
          <circle cx="0" cy={RING_CY} r={RING_R - 9}
            fill="none" stroke="var(--aqua)" strokeWidth="1" strokeOpacity="0.2" />

          {RAYS.map((p, i) => {
            const [cx, cy] = polar(p.a, p.r)
            // svg-anim supplies transform-box: fill-box, without which the
            // twinkle scale would pivot on the viewBox origin and fling each
            // point across the mark instead of pulsing it in place.
            return (
              <circle key={i} className="brand-ray svg-anim" cx={cx} cy={cy} r={p.s}
                fill="var(--aqua)" style={{ animationDelay: `${p.d}s` }} />
            )
          })}

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
      </span>
      <span className="brand-text">
        <span className="brand-word">AQUAVIA</span>
        <span className="brand-sub">Premium Packaged Drinking Water</span>
      </span>
    </>
  )
}

/**
 * The Resources menu, on desktop.
 *
 * Deliberately built around a real anchor rather than a <button>. The label
 * itself navigates to /resources, so the hub is reachable with JavaScript off,
 * by a crawler, and by anyone who clicks rather than hovers — the menu is an
 * accelerator into the four categories, never the only way in. That is also why
 * there is no `role="menu"`: this is a group of links, and ARIA menu semantics
 * would tell a screen reader to expect arrow-key application behaviour that
 * plain navigation links do not provide.
 *
 * It opens on hover and on focus, and closes on Escape, on blur out of the
 * subtree, and on pointer-down elsewhere. The hover intent is deliberately
 * asymmetric: opening is immediate, closing waits ~180ms, because the pointer
 * has to cross a gap between the trigger and the panel and a menu that vanishes
 * mid-travel is worse than no menu.
 */
function ResourcesMenu({ active, onNavigate }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const closeTimer = useRef(0)

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = 0 }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => cancelClose, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false) }
    const onPointerDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div
      ref={wrapRef}
      className={`nav-menu${open ? ' nav-menu-open' : ''}`}
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={scheduleClose}
      // Focus moving anywhere outside this subtree closes the panel, which is
      // what makes tabbing straight past it behave the way tabbing should.
      onFocus={() => { cancelClose(); setOpen(true) }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}
    >
      <a
        className="nav-link nav-menu-trigger"
        href={RESOURCES_PATH}
        aria-current={active ? 'page' : undefined}
        aria-expanded={open}
        aria-controls="nav-resources-panel"
      >
        Resources
        <span className={`nav-caret${open ? ' nav-caret-up' : ''}`} aria-hidden="true" />
        {active && <span className="nav-link-dot" aria-hidden="true" />}
      </a>

      {/* Rendered only while open. A permanently-mounted panel hidden with
          display:none would put twenty-odd links in the tab order of every page
          on the site — the same reason the mobile drawer is conditional. */}
      {open && (
        <div id="nav-resources-panel" className="nav-menu-panel">
          <div className="nav-menu-grid">
            <ResourceMenuColumns limit={5} placement="nav_menu" onNavigate={onNavigate} />
          </div>
          <a className="nav-menu-all" href={RESOURCES_PATH} onClick={onNavigate}>
            Browse all resources<span className="res-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      )}
    </div>
  )
}

/**
 * The Resources group inside the mobile drawer.
 *
 * A button plus conditional content rather than a native <details>, for one
 * unobvious reason: the delegated tracker in analytics/delegate.ts listens for
 * `toggle` on any <details> and would attribute the expand to `faq_opened`,
 * while the click on the summary would ALSO resolve through the click listener —
 * one interaction, two events, one of them under the wrong name. React state
 * costs four lines and reports nothing it should not.
 *
 * The panel is unmounted when collapsed, so its links are never in the tab order
 * of a drawer that is not showing them.
 */
function DrawerResources({ onNavigate }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="nav-drawer-group">
      <button
        type="button"
        className="nav-drawer-toggle"
        aria-expanded={open}
        aria-controls="drawer-resources"
        onClick={() => setOpen((v) => !v)}
      >
        Browse resources
        <span className={`nav-caret${open ? ' nav-caret-up' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id="drawer-resources" className="nav-drawer-sub">
          <ResourceMenuColumns limit={4} placement="nav_drawer" onNavigate={onNavigate} />
          <a className="nav-menu-all" href={RESOURCES_PATH} onClick={onNavigate}>
            Browse all resources<span className="res-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      )}
    </div>
  )
}

const COMPACT_QUERY = '(max-width: 900px)'

/**
 * Whether the bar is too narrow to hold the six links inline.
 *
 * This decides which of the two layouts is *rendered*, rather than rendering
 * both and hiding one in CSS — which is what the bar used to do, via
 * `.nav-links { display: none }`. Two reasons it has to work this way now:
 * SiteSearch renders `id="site-search"` with a matching <label for>, so a
 * second hidden copy would put a duplicate id in the document and break the
 * association for whichever the browser resolved first; and a display:none
 * drawer is still in the tab order's DOM, so keyboard users would tab into
 * invisible links.
 *
 * Starts `false` ALWAYS — including in a browser that is plainly narrow enough
 * to want the burger. That is not an oversight, and it is not the same as the
 * old lazy `window.matchMedia()` read that used to sit here.
 *
 * The served HTML is now prerendered at build time, where there is no viewport
 * to measure, so it necessarily contains the wide layout. If the first client
 * render consulted matchMedia it would ask for the burger on a phone, disagree
 * with the markup React was handed, and hydration would fail — React discards
 * the mismatched subtree, re-renders the whole navbar, and logs a warning.
 * Rendering `false` first and correcting immediately is the contract hydration
 * asks for.
 *
 * The correction runs in a layout effect, so on a narrow screen it lands in the
 * same frame as hydration, before the browser paints. Nobody sees the wide bar.
 *
 * `false` is also the right answer for a non-executing crawler, not merely the
 * safe one: it emits all six nav links as real anchors. Compact would render a
 * burger button and no links at all — the "page with zero internal links"
 * problem the anchors were introduced to fix.
 */
function useCompact() {
  const [compact, setCompact] = useState(false)
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY)
    const onChange = (e) => setCompact(e.matches)
    mq.addEventListener('change', onChange)
    setCompact(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return compact
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const waterRef = useRef(null)
  const drawerRef = useRef(null)
  const burgerRef = useRef(null)
  const compact = useCompact()

  useEffect(() => {
    // The gauge is the only thing in the bar that moves. If motion is unwelcome,
    // the droplet just sits full.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const handler = () => {
      // 16px, not 60: between the two the bar is still a translucent detached
      // pill with page content sliding through it, which is the exact thing the
      // docked state exists to stop. Dock as soon as the page has moved at all.
      setScrolled(window.scrollY > 16)
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

  // Widening the viewport past the breakpoint has to close the drawer, or it
  // stays mounted and floating over a bar that has already grown its inline
  // links back.
  useEffect(() => { if (!compact) setOpen(false) }, [compact])

  const close = useCallback((refocus) => {
    setOpen(false)
    if (refocus) burgerRef.current?.focus()
  }, [])

  /**
   * Drawer keyboard and pointer behaviour, mounted only while it is open.
   *
   * The trap is a plain wrap-around over the drawer's own focusables plus the
   * burger — the burger is included deliberately, so Shift+Tab from the first
   * link lands on the control that opened the panel rather than jumping behind
   * it into the page.
   */
  useEffect(() => {
    if (!open) return

    const focusables = () => {
      const inDrawer = drawerRef.current
        // `button` covers the Resources group's toggle, which has to be in the
        // trap or Tab would run past it and out of the panel it controls.
        ? Array.from(drawerRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])'))
        : []
      return burgerRef.current ? [burgerRef.current, ...inDrawer] : inDrawer
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { close(true); return }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    const onPointerDown = (e) => {
      if (drawerRef.current?.contains(e.target)) return
      if (burgerRef.current?.contains(e.target)) return
      close(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    // Focus the first link rather than the panel itself, so a screen reader
    // announces a destination instead of an empty group.
    drawerRef.current?.querySelector('a[href]')?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open, close])

  // Read once: this is a multi-page app, so the path cannot change without a
  // full document load, and there is no history event to subscribe to.
  const here = useCurrentPath()

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

  /* Real anchors pointing at real routes. These were <button onClick={scrollTo}>,
     which left the rendered page with zero internal links — Google could see
     none of the site's structure and the page could not earn sitelinks. Now
     every one of them is a crawlable edge in the site graph, and middle-click /
     "open in new tab" work the way they should. */
  const links = NAV_LINKS.map(({ href, label, menu }) => {
    // The path is "active" for the hub if we are ON the hub, and also if we are
    // on any page the hub collects — a reader inside a guide should be able to
    // see which part of the site they are in, and the guides have no other
    // representation in the bar.
    const active = href === here || (menu && here.startsWith(RESOURCES_PATH))

    // The dropdown is a desktop affordance. In the drawer the same destination
    // is rendered as an expandable group instead — see the drawer below — so
    // this branch only fires for the inline bar.
    if (menu && !compact) {
      return <ResourcesMenu key={href} active={active} onNavigate={() => close(false)} />
    }

    return (
      <a key={href} className="nav-link" href={href}
        aria-current={active ? 'page' : undefined}
        onClick={() => close(false)}
      >
        {label}
        {active && !compact && <span className="nav-link-dot" aria-hidden="true" />}
      </a>
    )
  })

  return (
    <>
      <nav className={`nav-bar glass${scrolled ? ' nav-scrolled' : ''}`}>
        {/* Logo */}
        <a className="brand-lockup" href="/" aria-label="AquaVia — home">
          <BrandLockup waterRef={waterRef} />
        </a>

        {/* Layout (display/gap) lives in CSS on .nav-links so the gap can
            tighten between 900 and 1200px, where the links, the search field
            and the brochure pill together ran past the right edge. */}
        {!compact && (
          <div className="nav-links">
            {links}
          </div>
        )}

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search lives in the bar on desktop and inside the drawer on
              mobile — one instance either way, never both. */}
          {!compact && <SiteSearch index={FULL_SEARCH_INDEX} onNavigate={navigate} />}

          {/* One CTA. The brochure is the single primary action in the bar, so
              it takes the solid gradient pill and survives on mobile (the label
              collapses to the icon below 768px — see .nav-brochure). The
              contact path is still one tap away via the nav links and footer. */}
          <m.a
            className="nav-brochure dl-btn"
            href={BROCHURE_URL}
            download
            target="_blank"
            rel="noopener"
            aria-label="Download the pricing brochure (PDF)"
            data-evt="pricing_brochure_downloaded"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(62,207,191,0.28)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
              border: 'none', borderRadius: 50, padding: '10px 22px',
              color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              fontSize: 14, cursor: 'pointer', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(62,207,191,0.18)',
            }}
          >
            <DownloadIcon />
            <span className="nav-brochure-label">Brochure</span>
          </m.a>

          {compact && (
            <button
              ref={burgerRef}
              type="button"
              className="nav-burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="nav-drawer"
              onClick={() => (open ? close(false) : setOpen(true))}
            >
              <BurgerIcon open={open} />
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {compact && open && (
          <m.div
            id="nav-drawer"
            ref={drawerRef}
            className={`nav-drawer glass${scrolled ? ' nav-drawer-docked' : ''}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav-drawer-inner">
              {links}
              {/* The library, on a phone. The Resources row above it is a plain
                  link to the hub — this is the shortcut past it, collapsed by
                  default so the six routes stay the first thing in the drawer
                  rather than being pushed off the bottom by twenty-three
                  guides. */}
              <DrawerResources onNavigate={() => close(false)} />
              <div style={{ padding: '10px 14px 4px' }}>
                <SiteSearch index={FULL_SEARCH_INDEX} onNavigate={navigate} />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Burger / close glyph. Two bars that cross, rather than three that collapse —
 * with only two strokes both states are the same two elements at different
 * angles, so nothing has to fade in or out of nowhere.
 *
 * Plain spans rather than SVG paths on purpose. Morphing a path's `d` needs the
 * two strings to share a command structure and is not something the
 * domAnimation feature bundle guarantees, and SVG transform-origin resolves
 * against the viewBox rather than the element unless transform-box is set.
 * A div rotates about its own centre with no such caveats.
 */
const BURGER_BAR = {
  position: 'absolute', left: '50%', top: '50%',
  width: 16, height: 1.8, marginLeft: -8, marginTop: -0.9,
  borderRadius: 2, background: 'currentColor',
}

function BurgerIcon({ open }) {
  const spring = { type: 'spring', stiffness: 500, damping: 34 }
  return (
    <span style={{ position: 'relative', display: 'block', width: 20, height: 20 }} aria-hidden="true">
      <m.span style={{ ...BURGER_BAR }}
        animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
        transition={spring} />
      <m.span style={{ ...BURGER_BAR }}
        animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
        transition={spring} />
    </span>
  )
}
