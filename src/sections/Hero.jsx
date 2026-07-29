import * as m from 'motion/react-m'
import { useEffect, useRef } from 'react'

import { useGeo } from '../site/hooks'
import { BottleIcon, SparkleIcon } from '../site/ui.jsx'
import { NAV_CLEAR } from '../site/styles'

/**
 * The hero artwork, and why it is a raster.
 *
 * This was three hand-drawn SVG bottles floating over a CSS ripple. Vector can
 * be made to look expensive, but it cannot be made to look photographed —
 * moulded PET ribbing, refraction through a curved wall, bubbles, a real splash
 * with caustics — and photographed is what the brief is. So the hero alone uses
 * an image, cut from the concept artwork by scripts/make-hero-bottles.mjs.
 *
 * BottleSVG is untouched and still draws the Products cards and the Customizer,
 * where the label carries the visitor's own uploaded logo and therefore has to
 * stay dynamic. The two never appear together.
 *
 * The file has a real alpha channel baked in, so it needs no blend mode and no
 * @supports guard — see the script for why that beats mix-blend-mode:screen.
 */
const ART = { src: '/hero-bottles.webp', width: 836, height: 680 }

/**
 * Hero scroll parallax: the artwork drifts as the hero leaves.
 *
 * Same shape as the navbar's water gauge in site/Navbar.jsx — an rAF-throttled
 * scroll listener writing straight to the node. That pattern is the reason this
 * page carries no scroll-animation library; GSAP + ScrollTrigger was 46 KB
 * gzipped to drive one property off one already-cheap scroll position.
 *
 * Nothing here is load-bearing for legibility. If the effect never runs, the
 * artwork simply sits still. The copy column's entrance is CSS keyframes for
 * the same reason, and the H1 — the LCP element — is never animated at all.
 *
 * The blanket prefers-reduced-motion rule in styles.js only zeroes CSS
 * animation durations and has no effect on anything written from JS, so the
 * preference is checked here explicitly.
 */
function useHeroParallax(artRef) {
  useEffect(() => {
    const hero = document.getElementById('hero')
    const art = artRef.current
    if (!hero || !art) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)')

    const apply = () => {
      if (still.matches) { art.style.transform = ''; return }
      const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)))
      art.style.transform = `translate3d(0, ${(46 * p).toFixed(2)}px, 0)`
    }

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => { frame = 0; apply() })
    }

    // Direct, not through the throttle: the resting state has to be correct on
    // the first paint even if no frame is ever served.
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    still.addEventListener('change', apply)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      still.removeEventListener('change', apply)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [artRef])
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const { geo, content } = useGeo()
  const artRef = useRef(null)

  useHeroParallax(artRef)

  return (
    <section id="hero" className="hero" aria-labelledby="main-heading" style={{ paddingTop: NAV_CLEAR }}>
      {/* Deliberately empty behind the art. This carried a teal Himalayan
          mountain silhouette and two glow orbs; against them the artwork had
          nothing to be brighter than, and the whole hero read flat. The only
          light in here now comes off the water. */}
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-copy">
        {content?.badge && !geo?.loading && (
          <div className="hero-enter hero-enter-1" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(62,207,191,0.1)', border:'1px solid rgba(62,207,191,0.3)', borderRadius:50, padding:'6px 16px', marginBottom:12 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#3ecfbf', display:'inline-block', boxShadow:'0 0 6px rgba(62,207,191,0.45)' }} />
            <span style={{ fontSize:13, color:'var(--aqua)', fontWeight:500 }}>{content.badge}</span>
          </div>
        )}

        {/* Never animated, by anything. It is the LCP element, so it paints at
            full opacity on the first frame — see .hero-enter in styles.js. */}
        <h1 className="hero-h1" id="main-heading">
          Pure Water.<br />
          <span style={{ color:'var(--aqua)' }}>Your Brand.</span>
        </h1>

        {/* The reservation lives in .hero-sub rather than an inline minHeight,
            because it has to change with the measure. The ipapi.co lookup lands
            ~1.7s after first paint and swaps this copy for the regional one,
            which is a different length; without a reservation tall enough for
            the LONGER of the two, everything below it jumps. Three lines (95px)
            covers both across the desktop measures this paragraph actually gets
            (405–470px), but a phone gives it ~350px and four lines, so the
            stylesheet raises it there. Inline it could not. */}
        <div className="hero-sub hero-enter hero-enter-2">
          {/* No inline fallback string. useGeoContent always returns a
              GEO_CONTENT entry, so this can never be empty — and the fallback
              that used to sit here claimed "Trusted by 500+ brands", the same
              invented number the stats row above was removed for. Dead code is
              not a safe place to keep a claim nobody can stand behind. */}
          <p style={{ color:'var(--muted)', fontSize:18, lineHeight:1.75, maxWidth:470 }}>
            {content?.heroSubheading}
          </p>
        </div>

        <SampleRequestBar />

        <div className="hero-enter hero-enter-4" style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          <m.a href="/products#customizer"
            whileHover={{ y: -3, boxShadow: '0 14px 40px rgba(62,207,191,0.42)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              display:'inline-block', textDecoration:'none',
              background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))', border:'none',
              borderRadius:50, padding:'15px 34px', color:'var(--navy)', fontFamily:'DM Sans, sans-serif',
              fontWeight:600, fontSize:15, cursor:'pointer',
              boxShadow:'0 8px 30px rgba(62,207,191,0.3)'
            }}
          >Design Your Bottle →</m.a>
          <m.a href="/products"
            whileHover={{ y: -3, backgroundColor: 'rgba(62,207,191,0.09)', borderColor: 'rgba(62,207,191,0.75)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              display:'inline-block', textDecoration:'none',
              backgroundColor:'rgba(62,207,191,0)', border:'1px solid rgba(62,207,191,0.4)',
              borderRadius:50, padding:'15px 34px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
              fontWeight:500, fontSize:15, cursor:'pointer'
            }}
          >View Products</m.a>
        </div>

      </div>

      {/* After the copy in the DOM so it stacks below on a phone, where it stops
          being absolutely positioned. fetchpriority high because this is almost
          certainly the LCP element at desktop widths and there is no point
          discovering it late. */}
      <img
        ref={artRef}
        className="hero-art"
        src={ART.src}
        width={ART.width}
        height={ART.height}
        alt="Three AquaVia bottles — 250ml, 500ml and 1 litre — with custom-branded labels, standing in water."
        fetchpriority="high"
        decoding="async"
      />
    </section>
  )
}

/**
 * The low-commitment ask.
 *
 * Sits above the two CTAs rather than closing the hero. The sample request is
 * the smallest thing anyone here can say yes to, so it reads better as the
 * option offered before the commitment than as a footnote after it — and it no
 * longer has to be positioned against the hero's own height, which is what kept
 * pushing it below the fold.
 */
function SampleRequestBar() {
  return (
    <div className="sample-card glass hero-enter hero-enter-3">
      <div className="sample-cell">
        <span className="sample-icon"><SparkleIcon size={24} /></span>
        <span>
          <span className="sample-title">Try before you commit</span>
          <span className="sample-note">Quality you can trust.</span>
        </span>
      </div>
      <div className="sample-cell">
        <span className="sample-icon"><BottleIcon size={24} /></span>
        <span>
          <a className="sample-title" href="/contact">Request a Sample Bottle →</a>
          <span className="sample-note">Experience the Aquavia difference.</span>
        </span>
      </div>
    </div>
  )
}
