import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import { initTracker, track } from './analytics/tracker'
import { initDelegatedTracking } from './analytics/delegate'
import { TrackInView } from './analytics/TrackInView.jsx'
import { ConsentBanner } from './analytics/consent.jsx'
import { SiteSearch } from './SiteSearch.jsx'

// The Web3Forms key used to live here, in the client bundle, in version control.
// The enquiry form that used it has since been removed entirely (see
// ContactSection), so nothing on this page posts a lead any more. /api/lead and
// its Web3Forms forward still exist server-side and are unreferenced from the
// browser. Rotate the old key regardless: it is in the git history.

// ─── Global Style Injection ───────────────────────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --navy: #04101f;
        --navy-mid: #081b35;
        --navy-card: #0b2244;
        --aqua: #3ecfbf;
        --aqua-dim: #1a8a80;
        --aqua-glow: rgba(62,207,191,0.15);
        --gold: #c8a44a;
        --white: #f5faff;
        --muted: #7a9bb5;
        --glass: rgba(255,255,255,0.04);
        --glass-border: rgba(255,255,255,0.09);
      }

      html { scroll-behavior: smooth; }
      body { font-family: 'DM Sans', sans-serif; background: var(--navy); color: var(--white); overflow-x: hidden; }

      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: var(--navy); }
      ::-webkit-scrollbar-thumb { background: var(--aqua); border-radius: 3px; }

      @keyframes floatA { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-22px) rotate(-6deg)} }
      @keyframes floatB { 0%,100%{transform:translateY(-10px) rotate(4deg)} 50%{transform:translateY(12px) rotate(4deg)} }
      @keyframes floatC { 0%,100%{transform:translateY(4px) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(-2deg)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
      @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
      @keyframes waBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes floatD { 0%,100%{transform:translateY(0px) rotate(5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
      @keyframes shimmerSweep { 0%{left:-80%} 100%{left:130%} }
      @keyframes badgePulse { 0%,100%{transform:translateX(-50%) scale(1);box-shadow:0 4px 20px rgba(200,164,74,0.4)} 50%{transform:translateX(-50%) scale(1.06);box-shadow:0 6px 28px rgba(200,164,74,0.7)} }
      @keyframes borderGlow { 0%,100%{border-color:rgba(62,207,191,0.4)} 50%{border-color:rgba(62,207,191,0.9)} }
      @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes sonarPulse { 0%{transform:scale(0.1);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }
      @keyframes dropRise { 0%{transform:translateY(0);opacity:0} 20%{opacity:0.9} 80%{opacity:0.9} 100%{transform:translateY(-80px);opacity:0} }
      @keyframes filterLight { 0%,100%{opacity:0.15} 50%{opacity:0.95} }
      @keyframes orbitSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes fillBottle { 0%,100%{transform:translateY(85px)} 45%,75%{transform:translateY(0)} }
      @keyframes burstLine { 0%{stroke-dashoffset:68;opacity:1} 60%{stroke-dashoffset:0;opacity:0.6} 100%{stroke-dashoffset:0;opacity:0} }
      @keyframes twinkle { 0%,100%{opacity:0.1;transform:scale(0.5)} 50%{opacity:1;transform:scale(1.3)} }
      @keyframes truckWobble { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      @keyframes snowFloat { from{transform:translate(0,0);opacity:0.5} to{transform:translate(8px,-12px);opacity:0.08} }
      @keyframes speedLine { from{opacity:0.35;transform:scaleX(1)} to{opacity:0;transform:scaleX(0.1)} }
      @keyframes stageIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
      @keyframes flowRight { 0%{transform:translateX(0);opacity:0} 8%{opacity:1} 90%{opacity:1} 100%{transform:translateX(640px);opacity:0} }
      @keyframes dashFlow { to{stroke-dashoffset:-36} }
      @keyframes stageHalo { 0%,100%{opacity:0.22;transform:scale(0.94)} 50%{opacity:0.6;transform:scale(1.06)} }
      @keyframes gritFall { 0%{transform:translateY(-6px);opacity:0} 25%{opacity:0.75} 100%{transform:translateY(30px);opacity:0} }

      .svg-anim { transform-box: fill-box; transform-origin: center center; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }


      .marquee-wrapper { overflow:hidden; -webkit-mask-image:linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%); mask-image:linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%); }
      .marquee-track { display:flex; width:max-content; }
      .marquee-track:hover { animation-play-state:paused !important; }

      .reveal { opacity:0; transform:translateY(28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      .reveal.visible { opacity:1; transform:translateY(0); }
      .reveal-left { opacity:0; transform:translateX(-28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      .reveal-left.visible { opacity:1; transform:translateX(0); }
      .reveal-right { opacity:0; transform:translateX(28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      .reveal-right.visible { opacity:1; transform:translateX(0); }

      .glass-card {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(16px);
        border-radius: 20px;
        transition: all 0.35s;
      }
      .glass-card:hover {
        transform: translateY(-6px);
        border-color: rgba(62,207,191,0.3);
        box-shadow: 0 24px 60px rgba(62,207,191,0.1);
      }

      .nav-scrolled {
        background: rgba(4,16,31,0.92) !important;
        backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid var(--glass-border) !important;
      }

      /* One vertical rhythm for every heading-plus-content section.
         The ceiling is 64px, not the 100px this page used to carry, because a
         section is only doing its job if its heading and the thing it
         introduces land in the same view: on a 1080p laptop that is roughly
         850px, and a pricing heading block plus a full tier card has to clear
         it. Below ~1160px viewport width the clamp tightens further on its
         own, which is where the grids start stacking anyway. */
      :root { --sec-pad: clamp(44px, 5.5vw, 64px); --head-gap: 32px; }
      .sec { padding: var(--sec-pad) 5%; }
      .sec-head { text-align: center; margin-bottom: var(--head-gap); }

      /* Direct-lines panel. One opaque Navy Card surface holding three rows
         divided by hairlines — deliberately not three separate cards, which
         would flatten WhatsApp, phone, and email into equal weight when they
         are not equal. The primary row carries a teal wash; the other two are
         bare. Rows are real <a> elements so the delegated click listener in
         analytics/delegate.ts instruments them from their href alone. */
      .ch-panel {
        background: var(--navy-card);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        overflow: hidden;
      }
      .ch-row {
        display: grid;
        grid-template-columns: 46px 1fr 20px;
        align-items: center;
        gap: 18px;
        padding: 22px 26px;
        text-decoration: none;
        border-top: 1px solid var(--glass-border);
        transition: background-color 0.3s cubic-bezier(0.22,1,0.36,1);
      }
      .ch-row:first-child { border-top: none; }
      .ch-row:hover { background: rgba(62,207,191,0.05); }
      .ch-row:focus-visible { outline: 2px solid var(--aqua); outline-offset: -3px; }
      /* The primary row is taller and pre-tinted: WhatsApp is where these
         buyers actually start, so it should not have to be found. */
      .ch-row-primary { padding: 28px 26px; background: rgba(62,207,191,0.07); }
      .ch-row-primary:hover { background: rgba(62,207,191,0.11); }

      .ch-disc {
        width: 46px; height: 46px; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(62,207,191,0.1);
        border: 1px solid rgba(62,207,191,0.22);
        color: var(--aqua);
        transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), background-color 0.3s;
      }
      .ch-row:hover .ch-disc { transform: scale(1.07); background: rgba(62,207,191,0.18); }
      .ch-row-primary .ch-disc { background: rgba(62,207,191,0.16); border-color: rgba(62,207,191,0.4); }

      .ch-title { display: block; color: var(--white); font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
      .ch-row-primary .ch-title { font-size: 17px; font-weight: 700; }
      .ch-note { display: block; color: var(--muted); font-size: 13px; line-height: 1.5; margin-top: 3px; }
      .ch-value { display: block; color: var(--aqua); font-size: 13.5px; font-weight: 500; margin-top: 7px; letter-spacing: 0.01em; }

      .ch-arrow {
        color: var(--muted); font-size: 17px; line-height: 1;
        transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), color 0.3s;
      }
      .ch-row:hover .ch-arrow { transform: translateX(4px); color: var(--aqua); }

      /* The panel foot is the low-commitment exit: a buyer who is not ready to
         talk to anyone still leaves with the rate card. */
      .ch-foot {
        border-top: 1px solid var(--glass-border);
        background: rgba(4,16,31,0.35);
        padding: 20px 26px;
        display: flex; flex-wrap: wrap; align-items: center; gap: 14px;
      }
      @media (max-width: 600px) {
        .ch-row { padding: 20px; gap: 14px; grid-template-columns: 42px 1fr 16px; }
        .ch-row-primary { padding: 24px 20px; }
        .ch-disc { width: 42px; height: 42px; }
        .ch-foot { padding: 18px 20px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ch-row:hover .ch-disc, .ch-row:hover .ch-arrow { transform: none; }
      }

      .step-card:hover .step-num { background: var(--aqua); color: var(--navy); }
      .industry-chip:hover { border-color:var(--aqua) !important; background:rgba(62,207,191,0.08) !important; transform:translateX(4px); }
      .bottle-card {
        transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease, border-color 0.3s ease !important;
        position: relative !important;
      }
      .bottle-card::after {
        content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
        transform:skewX(-18deg); pointer-events:none; z-index:2;
      }
      .bottle-card:hover {
        transform: translateY(-12px) scale(1.02) !important;
        box-shadow: 0 32px 64px rgba(0,0,0,0.45), 0 0 50px rgba(62,207,191,0.12) !important;
      }
      .bottle-card:hover::after { animation: shimmerSweep 0.65s ease forwards; }
      .bottle-card svg { transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.3s ease; }
      .bottle-card:hover svg { transform: scale(1.06) !important; filter: drop-shadow(0 24px 48px rgba(62,207,191,0.45)) !important; }
      /* The stage cards enter in flow order, 01 → 07, so the reveal reads as water
         moving down the filtration train rather than seven boxes appearing at once.
         fill-mode is 'backwards' on purpose: 'both' would pin transform after the
         animation and silently kill the .glass-card:hover lift. */
      .stage-card-in { animation: stageIn 0.5s cubic-bezier(0.22,1,0.36,1) backwards; }
      .stage-btn {
        text-align: left; background: var(--navy-card); cursor: pointer;
        border: 1px solid var(--glass-border); border-radius: 16px; padding: 16px 18px;
        font-family: 'DM Sans', sans-serif; width: 100%;
        /* A button centres its content vertically; the grid stretches these to a
           common height, so without this the seven headings sit at seven
           different heights across the row. */
        display: flex; flex-direction: column; align-items: flex-start;
        transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, opacity 0.3s ease, box-shadow 0.4s ease;
      }
      .stage-btn:focus-visible { outline: 2px solid var(--aqua); outline-offset: 3px; }
      .filtration-rail { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
      @media (max-width: 1080px) { .filtration-rail { grid-template-columns: repeat(4, 1fr); } }
      @media (max-width: 768px)  { .filtration-rail { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 460px)  { .filtration-rail { grid-template-columns: 1fr; } }
      .stage-toggle { transition: opacity 0.25s cubic-bezier(0.22,1,0.36,1); }
      .stage-toggle:hover { opacity: 0.78; }
      .stage-toggle:focus-visible { outline: 2px solid var(--aqua); outline-offset: 4px; border-radius: 4px; }
      .stage-toggle-icon { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }

      .featured-badge { animation: badgePulse 2.4s ease-in-out infinite; }
      .featured-card { animation: borderGlow 2.5s ease-in-out infinite; }

      /* Download icon: the tray stays put, the arrow drops into it on hover.
         Two separate transforms so the arrow can also fade at the bottom of the
         travel and reappear at the top, which reads as a repeating download. */
      .dl-icon { flex: none; overflow: visible; }
      .dl-icon .dl-arrow { transform-origin: 50% 50%; }
      /* Sheen sweep. Lives on ::after so it needs its own stacking context,
         otherwise the clip would also catch the button's outer glow. */
      .dl-btn { position: relative; overflow: hidden; isolation: isolate; }
      .dl-btn::after {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        transform: translateX(-130%);
        background: linear-gradient(100deg, transparent 25%, rgba(255,255,255,0.38) 50%, transparent 75%);
      }
      .dl-btn-ghost::after {
        background: linear-gradient(100deg, transparent 25%, rgba(62,207,191,0.22) 50%, transparent 75%);
      }
      .dl-btn:hover::after { animation: dl-sheen 0.9s ease-out; }
      @keyframes dl-sheen { to { transform: translateX(130%); } }
      /* The icon sits in a tinted disc so the glyph reads as a badge, not a bullet. */
      .dl-chip {
        display: inline-flex; align-items: center; justify-content: center; flex: none;
        width: 34px; height: 34px; border-radius: 50%;
        background: rgba(4,26,43,0.14); transition: background 0.3s, transform 0.3s;
      }
      .dl-btn-ghost .dl-chip { background: rgba(62,207,191,0.14); }
      .dl-btn:hover .dl-chip { background: rgba(4,26,43,0.22); transform: scale(1.06); }
      .dl-btn-ghost:hover .dl-chip { background: rgba(62,207,191,0.24); }
      .dl-btn:hover .dl-icon .dl-arrow { animation: dl-drop 0.9s ease-in-out infinite; }
      .dl-btn:hover .dl-icon .dl-tray { animation: dl-pulse 0.9s ease-in-out infinite; }
      @keyframes dl-drop {
        0%   { transform: translateY(-1px); opacity: 1; }
        55%  { transform: translateY(3px);  opacity: 1; }
        70%  { transform: translateY(4px);  opacity: 0; }
        71%  { transform: translateY(-4px); opacity: 0; }
        100% { transform: translateY(-1px); opacity: 1; }
      }
      @keyframes dl-pulse {
        0%, 45%, 100% { transform: translateY(0); }
        62%           { transform: translateY(1px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .dl-btn:hover .dl-icon .dl-arrow,
        .dl-btn:hover .dl-icon .dl-tray,
        .dl-btn:hover::after { animation: none; }
        .dl-btn:hover .dl-chip { transform: none; }
      }

      .products-grid { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
      .products-grid::-webkit-scrollbar { height: 4px; }
      .products-grid::-webkit-scrollbar-track { background: transparent; }
      .products-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

      @media (max-width: 768px) {
        :root { --sec-pad: 40px; --head-gap: 26px; }
        .hero-grid { grid-template-columns: 1fr !important; }
        .about-grid { grid-template-columns: 1fr !important; }
        .products-grid { grid-template-columns: 1fr !important; }
        .pricing-grid { grid-template-columns: 1fr !important; }
        .contact-grid { grid-template-columns: 1fr !important; }
        .how-grid { grid-template-columns: 1fr 1fr !important; }
        .industries-grid { grid-template-columns: 1fr !important; }
        .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
        .nav-links { display: none !important; }
        /* The brochure pill stays on mobile but drops to icon-only — it is the
           only CTA in the bar now, and the label is what costs the width. */
        .nav-brochure { padding: 11px !important; }
        .nav-brochure-label { display: none !important; }
        .hero-bottles { display: none !important; }
        .hero-bottle-single { display: flex !important; }
        .hero-h1 { font-size: clamp(36px,8vw,52px) !important; }
        .services-numbered { grid-template-columns: 1fr !important; }
        .testimonials-grid { grid-template-columns: 1fr !important; }
        .journey-row-grid { grid-template-columns: 1fr !important; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
}

// ─── Custom Hook: useReveal ───────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

// ─── useSEO ───────────────────────────────────────────────────────────────────
function useSEO({ title, description, keywords, canonical, schema }) {
  useEffect(() => {
    document.title = title
    const setMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    setMeta('name', 'description', description)
    setMeta('name', 'keywords', keywords)
    setMeta('name', 'robots', 'index, follow')
    setMeta('name', 'author', 'AquaVia')
    setMeta('name', 'theme-color', '#04101f')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', 'https://himalayan-sip.vercel.app/og-cover.jpg')
    setMeta('property', 'og:site_name', 'AquaVia')
    setMeta('property', 'og:locale', 'en_IN')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', 'https://himalayan-sip.vercel.app/og-cover.jpg')
    setMeta('name', 'twitter:site', '@AquaVia')
    let link = document.querySelector("link[rel='canonical']")
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link) }
    link.setAttribute('href', canonical)
    if (schema) {
      let el = document.getElementById('hs-schema')
      if (!el) { el = document.createElement('script'); el.id = 'hs-schema'; el.type = 'application/ld+json'; document.head.appendChild(el) }
      el.textContent = JSON.stringify(schema)
    }
  }, [title, description, keywords, canonical])
}

// ─── useGeoTarget ─────────────────────────────────────────────────────────────
function useGeoTarget() {
  const [geoData, setGeoData] = useState({ city: null, region: null, country: null, detected: false, loading: true })
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setGeoData({ city: d.city, region: d.region, country: d.country_name, countryCode: d.country_code, detected: true, loading: false }))
      .catch(() => setGeoData({ city: null, region: null, country: 'India', detected: false, loading: false }))
  }, [])
  return geoData
}

// ─── GEO_CONTENT ─────────────────────────────────────────────────────────────
const DELHI_NCR_CITIES = new Set(['delhi', 'new delhi', 'gurugram', 'gurgaon', 'noida', 'faridabad', 'ghaziabad', 'greater noida'])

const GEO_CONTENT = {
  'delhi-ncr': {
    heroSubheading: "Supplying premium branded bottled water to Delhi NCR's corporates, 5-star hotels, government offices, and large-scale events.",
    badge: '📍 Serving Delhi NCR',
    deliveryNote: 'Same-week delivery: Delhi · Gurugram · Noida · Faridabad · Ghaziabad',
    localTestimonial: {
      name: 'Amit Verma', title: 'Procurement Manager, Connaught Corp Delhi', initials: 'AV',
      text: "Our boardroom always has AquaVia branded bottles. The quality and precision of the labels is outstanding — delivered on time, every time.",
      rating: 5,
    },
    phone: '+91 76248 03460',
    whatsappMsg: "Hi! I'm in Delhi NCR and want to order custom branded water bottles.",
    seoTitle: 'Custom Branded Water Bottles Delhi NCR | AquaVia',
    seoDescription: 'Premium customized water bottles with your logo for Delhi NCR businesses. Serving Connaught Place, Gurugram, Noida, Greater Noida. Bulk orders available.',
    seoKeywords: 'custom water bottles Delhi, branded water bottles Delhi NCR, corporate water bottle Gurugram, bulk water bottle Noida',
  },
  'default': {
    heroSubheading: 'Currently serving Delhi and Delhi NCR. Pan-India expansion coming soon — register your interest today.',
    badge: null,
    deliveryNote: 'Currently serving Delhi NCR. Expanding pan-India soon.',
    localTestimonial: null,
    phone: '+91 76248 03460',
    whatsappMsg: "Hi! I'm interested in customized water bottles for my business.",
    seoTitle: 'AquaVia — Customized Branded Water Bottles | Delhi NCR',
    seoDescription: 'AquaVia provides premium customized bottled water with your company logo. Serving Delhi NCR — corporate offices, hotels, events, hospitals.',
    seoKeywords: 'custom branded water bottles Delhi, personalized water bottles business India, bulk water bottle orders Delhi NCR',
  },
}

function useGeoContent(geo) {
  return useMemo(() => {
    if (!geo.detected || !geo.city) return GEO_CONTENT['default']
    const key = geo.city.toLowerCase()
    return DELHI_NCR_CITIES.has(key) ? GEO_CONTENT['delhi-ncr'] : GEO_CONTENT['default']
  }, [geo.detected, geo.city])
}

// ─── useLazySection ───────────────────────────────────────────────────────────
function useLazySection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { rootMargin: '200px' })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const HS_SCHEMA = [
  {
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: 'AquaVia',
    description: 'Premium customized branded bottled water solutions for businesses in Delhi NCR',
    url: 'https://himalayan-sip.vercel.app',
    telephone: '+91-76248-03460', email: 'info@aquaviaworld.com',
    priceRange: '₹₹', currenciesAccepted: 'INR', paymentAccepted: 'Cash, Credit Card, UPI, Bank Transfer',
    areaServed: { '@type': 'City', name: 'Delhi NCR' },
    address: { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressRegion: 'Delhi', postalCode: '110001', addressCountry: 'IN' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' }],
    sameAs: ['https://www.instagram.com/aquavia.official?igsh=eHVmM3F3MnI2OTl0','https://www.linkedin.com/company/aquavia'],
  },
  {
    '@context': 'https://schema.org', '@type': 'Product',
    name: 'Custom Branded Water Bottles',
    description: 'Personalized bottled water with your company logo, sold by the case across three corporate pricing tiers. Available in 250ml, 500ml, and 1L sizes.',
    brand: { '@type': 'Brand', name: 'AquaVia' },
    // One offer per size we actually sell, priced from the brochure.
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR', lowPrice: '4.61', highPrice: '8.33', offerCount: 3,
      availability: 'https://schema.org/InStock',
      offers: [
        { '@type': 'Offer', name: '250ml Custom Bottle', price: '4.89', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', name: '500ml Custom Bottle', price: '5.67', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', name: '1L Custom Bottle',    price: '8.33', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      ],
    },
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is the minimum order quantity for custom water bottles?', acceptedAnswer: { '@type': 'Answer', text: 'Minimum order is 500 units for 250ml, 250 units for 500ml, and 150 units for 1L bottles.' } },
      { '@type': 'Question', name: 'How is your pricing structured?', acceptedAnswer: { '@type': 'Answer', text: 'Pricing is per case across three partnership tiers based on weekly dispatch volume: Signature (1–10 dispatches/week), Preferred (11–50) and Enterprise (51+). A case is 12 × 1L, 24 × 500ml or 36 × 250ml. Rates start at ₹100, ₹136 and ₹176 per case respectively and fall with volume. GST and transportation are quoted separately.' } },
      { '@type': 'Question', name: 'Which areas do you currently serve?', acceptedAnswer: { '@type': 'Answer', text: 'We currently serve Delhi and Delhi NCR including Gurugram, Noida, Faridabad and Ghaziabad.' } },
      { '@type': 'Question', name: 'How long does production and delivery take?', acceptedAnswer: { '@type': 'Answer', text: 'Design proof in 24–48 hours. Production + delivery in 5–10 business days.' } },
      { '@type': 'Question', name: 'Can I get a sample bottle before placing a bulk order?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, we offer sample bottles so you can verify quality and design before committing to a bulk order.' } },
    ],
  },
]

// ─── FAQSection ───────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is the minimum order quantity?', a: '500 units for 250ml, 250 units for 500ml, and 150 units for 1L bottles.' },
  { q: 'How is your pricing structured?', a: 'Pricing is per case across three partnership tiers set by weekly dispatch volume — Signature (1–10 / week), Preferred (11–50) and Enterprise (51+). A case is 12 × 1L, 24 × 500ml or 36 × 250ml. Rates start at ₹100 / ₹136 / ₹176 per case and fall with volume. GST and transportation are quoted separately.' },
  { q: 'Which areas do you currently serve?', a: 'We currently serve Delhi and Delhi NCR — including Gurugram, Noida, Faridabad, and Ghaziabad.' },
  { q: 'How long does production and delivery take?', a: 'Design proof in 24–48 hours. Production + delivery in 5–10 business days. Rush orders available.' },
  { q: 'What file format should I send my logo in?', a: 'We accept PNG, SVG, PDF, and AI files. Vector formats (SVG, AI) yield the sharpest print results.' },
  { q: 'Can I get a sample before placing a bulk order?', a: 'Absolutely — request a free sample bottle through our contact form.' },
  { q: 'What label materials do you offer?', a: 'BOPP (waterproof), matte paper, glossy paper, and premium metallic foil labels.' },
]

function FAQSection() {
  const [open, setOpen] = useState(null)
  const ref = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="faq" className="sec" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div ref={ref} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {FAQS.map((item, i) => (
            <div key={i} className="glass-card" style={{ overflow:'hidden' }}>
              <button
                onClick={() => {
                  const opening = open !== i
                  setOpen(opening ? i : null)
                  // Only on open. A collapse is not a question being asked.
                  if (opening) track('faq_opened', { sectionId: 'faq', props: { question: item.q } })
                }}
                aria-expanded={open === i}
                style={{
                  width:'100%', background:'none', border:'none', cursor:'pointer',
                  display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px',
                  textAlign:'left'
                }}
              >
                <span style={{ fontWeight:600, fontSize:16, color:'var(--white)', paddingRight:16 }}>{item.q}</span>
                <span style={{ fontSize:22, color:'var(--aqua)', flexShrink:0, transition:'transform 0.3s', transform: open===i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              <div style={{ display:'grid', gridTemplateRows: open===i ? '1fr' : '0fr', transition:'grid-template-rows 0.4s ease', overflow:'hidden' }}>
                <div style={{ overflow:'hidden' }}>
                  <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:15, padding:'0 24px 20px', maxWidth:'68ch' }}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:40 }}>
          <button onClick={() => scrollTo('contact')} style={{
            background:'transparent', border:'1px solid rgba(62,207,191,0.4)', borderRadius:50,
            padding:'12px 28px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
            fontSize:15, fontWeight:500, cursor:'pointer',
          }}>Have more questions? Contact us →</button>
        </div>
      </div>
    </section>
  )
}

// ─── SVG Components ───────────────────────────────────────────────────────────
function BottleSVG({ logo, color = '#3ecfbf', label = '500ml', size = 200, animationClass = '' }) {
  const id = `grad-${color.replace('#', '')}-${size}`
  const waterColor = color + 'aa'
  return (
    <svg
      viewBox="0 0 110 260"
      width={size * 0.42}
      height={size}
      style={{ filter: 'drop-shadow(0 20px 40px rgba(62,207,191,0.3))', animation: animationClass, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0f0f8" />
          <stop offset="100%" stopColor="#a8dce8" />
        </linearGradient>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <clipPath id={`body-clip-${id}`}>
          <rect x="18" y="50" width="74" height="194" rx="10" />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect x="36" y="6" width="38" height="22" rx="6" fill={`url(#cap-${id})`} />
      <rect x="38" y="8" width="20" height="6" rx="3" fill="white" fillOpacity="0.3" />

      {/* Neck */}
      <path d="M36 26 L28 50 L82 50 L74 26 Z" fill={color} fillOpacity="0.5" />

      {/* Body */}
      <rect x="18" y="50" width="74" height="194" rx="10" fill={`url(#body-${id})`} />

      {/* Water fill */}
      <g clipPath={`url(#body-clip-${id})`}>
        <rect x="18" y="145" width="74" height="99" fill={`url(#water-${id})`} />
        {/* Wave */}
        <path d="M18 148 Q37 138 55 148 Q73 158 92 148 L92 160 Q73 170 55 160 Q37 150 18 160 Z" fill={color} fillOpacity="0.4" />
      </g>

      {/* Label area background */}
      <rect x="24" y="74" width="62" height="100" rx="6" fill="white" />

      {/* Label top strip */}
      <rect x="24" y="74" width="62" height="22" rx="6" fill={color} />
      <rect x="24" y="84" width="62" height="12" fill={color} />
      <text x="55" y="89" textAnchor="middle" fill="white" fontSize="8" fontFamily="serif" fontWeight="bold" letterSpacing="1">AQUAVIA</text>

      {/* Label center — logo or placeholder */}
      {logo ? (
        <image href={logo} x="30" y="98" width="50" height="50" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <circle cx="55" cy="122" r="18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="55" y="118" textAnchor="middle" fill={color} fontSize="7" fontFamily="DM Sans, sans-serif">YOUR</text>
          <text x="55" y="128" textAnchor="middle" fill={color} fontSize="7" fontFamily="DM Sans, sans-serif">LOGO</text>
        </>
      )}

      {/* Label bottom strip */}
      <rect x="24" y="162" width="62" height="12" rx="0" fill={color} />
      <rect x="24" y="168" width="62" height="6" rx="6" fill={color} />

      {/* Shine overlay */}
      <rect x="18" y="50" width="20" height="194" rx="10" fill={`url(#shine-${id})`} />
    </svg>
  )
}

function MountainBg() {
  return (
    <svg viewBox="0 0 1440 300" width="100%" height="300"
      style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.12, pointerEvents: 'none' }}
      preserveAspectRatio="none">
      <defs>
        <linearGradient id="mtn-grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtn-grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtn-grad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 300 L200 120 L400 220 L600 60 L800 180 L1000 40 L1200 160 L1440 80 L1440 300 Z" fill="url(#mtn-grad1)" />
      <path d="M0 300 L300 160 L500 240 L700 100 L900 200 L1100 80 L1300 190 L1440 120 L1440 300 Z" fill="url(#mtn-grad2)" />
      <path d="M0 300 L150 200 L350 260 L550 150 L750 230 L950 130 L1150 220 L1350 160 L1440 200 L1440 300 Z" fill="url(#mtn-grad3)" />
    </svg>
  )
}

function MoonMountainIllustration() {
  return (
    <svg viewBox="0 0 320 260" width="320" height="260">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04101f" />
          <stop offset="100%" stopColor="#081b35" />
        </linearGradient>
        <linearGradient id="mtn-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a8a80" />
          <stop offset="100%" stopColor="#0b2244" />
        </linearGradient>
        <linearGradient id="mtn-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0b2244" />
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="320" height="260" fill="url(#sky-grad)" rx="16" />
      {/* Stars */}
      {[[40,30],[80,20],[130,40],[170,15],[220,35],[270,25],[300,45],[60,55],[250,50],[160,60]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%3===0?1.5:1} fill="white" fillOpacity={0.6+i*0.04} />
      ))}
      {/* Moon */}
      <circle cx="260" cy="55" r="26" fill="#c8a44a" fillOpacity="0.9" />
      <circle cx="272" cy="48" r="22" fill="#081b35" />
      {/* Back mountain */}
      <path d="M60 200 L160 60 L260 200 Z" fill="url(#mtn-a)" />
      <path d="M140 95 L160 60 L180 95 Z" fill="white" fillOpacity="0.8" />
      {/* Front mountain */}
      <path d="M0 220 L120 80 L240 220 Z" fill="url(#mtn-b)" />
      <path d="M100 112 L120 80 L140 112 Z" fill="white" fillOpacity="0.9" />
      {/* River */}
      <path d="M0 240 Q80 220 160 235 Q240 250 320 230 L320 260 L0 260 Z" fill="url(#river)" />
      <path d="M20 242 Q80 228 140 238" stroke="#3ecfbf" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
    </svg>
  )
}

// ─── Reusable UI ─────────────────────────────────────────────────────────────
function SectionTag({ children }) {
  return (
    <div style={{
      display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
      borderRadius: 50, padding: '5px 16px', marginBottom: 12
    }}>{children}</div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: '🎨', title: 'Custom Label Design', desc: 'Professional designers craft labels matching your brand identity, colors, and messaging perfectly.' },
  { icon: '📦', title: 'Bulk Corporate Orders', desc: 'Volume pricing that scales with your business. MOQ suited for companies of all sizes.' },
  { icon: '🎪', title: 'Event & Conference Branding', desc: 'Make a lasting impression at every corporate event or product launch with branded hydration.' },
  { icon: '🏨', title: 'Hotel & Restaurant Supply', desc: 'Elevate the guest experience with premium water that carries your brand\'s story.' },
  { icon: '🏢', title: 'Office & Enterprise', desc: 'Reinforce company culture daily with beautifully branded water on every desk.' },
  { icon: '🚚', title: 'Express Delivery', desc: 'Reliable pan-India delivery. Rush orders welcomed. Real-time shipment tracking.' },
]

const STEPS = [
  { num: '01', title: 'Share Your Logo', desc: 'Upload your logo, colors, and design preferences through our simple online portal.' },
  { num: '02', title: 'Select & Specify', desc: 'Choose bottle size (250ml / 500ml / 1L), quantity, and label material type.' },
  { num: '03', title: 'Approve Design', desc: 'Receive a digital proof within 24 hours. Unlimited revisions until you\'re 100% satisfied.' },
  { num: '04', title: 'Get Delivery', desc: 'Your branded bottles arrive at your doorstep, packaged and ready to impress.' },
]

// The range is exactly the three sizes the corporate pricing brochure quotes.
// Prices are its Signature (entry) tier — what a first-time buyer actually pays.
//
// `size` is the caption; `sku` is what analytics groups by. They differ for the
// litre bottle on purpose — see PRODUCT_SKUS in analytics/catalog.ts.
const PRODUCTS = [
  { size: '250ml', sku: '250ml', name: 'Petite', desc: 'Ideal for flights, meetings & premium gift hampers', price: '₹4.89/bottle', caseNote: '₹176 per case of 36', minOrder: '500 units', color: '#3ecfbf', featured: false },
  { size: '500ml', sku: '500ml', name: 'Classic', desc: 'Our most popular — perfect for offices & events', price: '₹5.67/bottle', caseNote: '₹136 per case of 24', minOrder: '250 units', color: '#c8a44a', featured: true },
  { size: '1 Litre', sku: '1L', name: 'Grande', desc: 'Ideal for gyms, hotels & extended stays', price: '₹8.33/bottle', caseNote: '₹100 per case of 12', minOrder: '150 units', color: '#5b8ff9', featured: false },
]

// ─── Corporate pricing programme (from the pricing brochure) ──────────────────
const BROCHURE_URL = '/aquavia-pricing-brochure.pdf'

const PACK_SIZES = ['1000 ML', '500 ML', '250 ML']

// Not assumed — these are implied by the brochure's own per-bottle figures, and
// hold for all nine cells (100/8.33 = 12, 136/5.67 = 24, 176/4.89 = 36).
const CASE_SIZES = { '1000 ML': 12, '500 ML': 24, '250 ML': 36 }

const PRICING_TIERS = [
  { num:'01', name:'Signature', segment:'Hotels & Luxury', dispatches:'1–10 dispatches / week', featured:false,
    prices:{ '1000 ML':100, '500 ML':136, '250 ML':176 } },
  { num:'02', name:'Preferred', segment:'Restaurants & Corporate', dispatches:'11–50 dispatches / week', featured:true,
    prices:{ '1000 ML':96, '500 ML':130, '250 ML':170 } },
  { num:'03', name:'Enterprise', segment:'Large Enterprises', dispatches:'51+ dispatches / week', featured:false,
    prices:{ '1000 ML':92, '500 ML':126, '250 ML':166 } },
]

const PRICING_INCLUDES = ['Premium mineral water', 'Custom branding', 'High quality label printing', 'Corporate dispatch', 'Quality assurance']
const PRICING_FOOTNOTE = 'GST and transportation charges are quoted separately where applicable.'

// Derived, never hard-coded a second time: one edit to a case price cannot leave
// a stale per-bottle figure sitting next to it.
const perBottle = (casePrice, size) => (casePrice / CASE_SIZES[size]).toFixed(2)

const INDUSTRIES = [
  { icon: '🏨', name: 'Hotels & Resorts' }, { icon: '🏥', name: 'Hospitals & Clinics' },
  { icon: '🏢', name: 'Corporate Offices' }, { icon: '🎪', name: 'Events & Weddings' },
  { icon: '🏗️', name: 'Real Estate' }, { icon: '💪', name: 'Gyms & Wellness' },
  { icon: '🍽️', name: 'Restaurants & Cafes' }, { icon: '✈️', name: 'Airlines & Travel' },
]

/**
 * The actual plant process behind the "7-Stage Filtration" claim.
 *
 * Ordered as the water flows, and indexed 1:1 with the seven bars IllusFiltration
 * draws (S1–S7) — adding a stage here without adding a bar there leaves the
 * illustration lying about the process.
 */
// Shared by the showcase pipeline and the step-03 illustration so a stage is the
// same colour wherever it appears — the two are cross-highlighted on hover, which
// only reads as "the same thing" if the colour agrees.
const FILTRATION_COLORS = ['#3ecfbf','#5b8ff9','#7c4dff','#c8a44a','#7c4dff','#5b8ff9','#3ecfbf']

const FILTRATION_STAGES = [
  { num:'01', name:'Back-Wash Sand Filter',
    purpose:'Removes large suspended particles — sand, dust, rust and mud.' },
  { num:'02', name:'Double Y-Strainer',
    purpose:'Two passes, 10–20 micron then 5 micron, clearing finer suspended solids before the sensitive filters.' },
  { num:'03', name:'CTO Carbon Block',
    purpose:'Chlorine, Taste & Odour. Removes chlorine, pesticides and organic chemicals.' },
  { num:'04', name:'Sediment Filter',
    purpose:'5 then 1 micron. Removes fine silt, rust and particulate matter, protecting the RO membrane downstream.' },
  { num:'05', name:'RO Membrane',
    purpose:'Reverse osmosis strips dissolved solids, heavy metals and microbiological contaminants.' },
  { num:'06', name:'Activated Carbon',
    purpose:'Adsorbs dissolved organic compounds — removes residual odour and colour, and improves taste.' },
  { num:'07', name:'Ozonation',
    purpose:'Ozone (O₃) is injected into the purified water, destroying bacteria, viruses and fungi and preventing microbial growth inside the sealed bottle.' },
]

const JOURNEY_STEPS = [
  { num:'01', title:'The Ancient Source', color:'#3ecfbf',
    body:'Deep beneath the earth, ancient groundwater lies pristine and untouched — patient for centuries, waiting to become something extraordinary.' },
  { num:'02', title:'Precision Extraction', color:'#5b8ff9',
    body:'Our precision-engineered wells reach into protected aquifers, drawing water upward gently, without disturbance to the surrounding ecosystem.' },
  { num:'03', title:'7-Stage Filtration', color:'#7c4dff',
    body:'Every drop enters our fortress of purity — seven sequential stages stripping out sediment, bacteria, dissolved solids, and invisible contaminants.',
    stages: FILTRATION_STAGES },
  { num:'04', title:'Mineral Alchemy', color:'#c8a44a',
    body:'Stripped of impurities but not of life. Essential minerals — calcium, magnesium, potassium — are woven back in, perfectly balanced for the human body.' },
  { num:'05', title:'Custom Bottling', color:'#3ecfbf',
    body:"Your brand. Your label. Your identity. Each bottle is filled, sealed, and dressed in your livery — a product that's unmistakably yours." },
  { num:'06', title:'Cold-Chain Delivery', color:'#5b8ff9',
    body:"Temperature never rises above 4°C from the moment it's sealed. Our refrigerated fleet ensures every bottle arrives as cold as it was born." },
  { num:'07', title:'Your Water', color:'#c8a44a',
    body:'Cold. Crisp. Crafted for you. Not mass-produced. Not generic. Your water — made to your specification, delivered to your door.' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', title: 'Marketing Head, Nexus Realty', initials: 'PS', text: 'AquaVia transformed our site visits. Handing branded water to potential buyers elevated our brand perception instantly. Orders arrived ahead of schedule — flawless execution.', rating: 5 },
  { name: 'Arjun Mehta', title: 'Director of Operations, Transcend Hotels', initials: 'AM', text: 'As a luxury hotel group, presentation is everything. AquaVia bottles sit on every dining table. Guests always comment on them. Exceptional quality, beautiful labels, reliable supply.', rating: 5 },
  { name: 'Kiran Rao', title: 'COO, Summit Ventures', initials: 'KR', text: "We've branded our annual summit for 3 consecutive years with AquaVia. 800 attendees, branded bottles at every seat. The design team's attention to detail is genuinely unmatched.", rating: 5 },
]

/**
 * Searchable content, assembled from the same consts the page renders.
 * Built from the existing data rather than a hand-written list, so a new bottle
 * size or FAQ becomes searchable without anyone remembering to update an index.
 */
const SEARCH_INDEX = [
  ...PRODUCTS.map(p => ({
    id: `product-${p.size}`, sectionId: 'products', kind: 'Bottle size',
    title: `${p.size} — ${p.name}`, body: `${p.desc} ${p.price} ${p.minOrder}`,
  })),
  ...SERVICES.map(s => ({
    id: `service-${s.title}`, sectionId: 'services', kind: 'Service',
    title: s.title, body: s.desc,
  })),
  ...INDUSTRIES.map(i => ({
    id: `industry-${i.name}`, sectionId: 'industries', kind: 'Industry',
    title: i.name, body: `${i.name} branded water bottles supply`,
  })),
  ...FAQS.map(f => ({
    id: `faq-${f.q}`, sectionId: 'faq', kind: 'FAQ', title: f.q, body: f.a,
  })),
  ...JOURNEY_STEPS.map(j => ({
    id: `journey-${j.num}`, sectionId: 'journey', kind: 'Our process',
    title: j.title, body: j.body,
  })),
  // A buyer evaluating water quality searches "RO membrane" or "ozonation", not
  // "filtration" — the stage names are the terms worth being findable on.
  ...FILTRATION_STAGES.map(s => ({
    id: `filtration-${s.num}`, sectionId: 'journey', kind: 'Filtration stage',
    title: `${s.num} — ${s.name}`, body: s.purpose,
  })),
  ...FILTRATION_STAGES.map(s => ({
    id: `filtration-${s.num}`, sectionId: 'journey', kind: 'Filtration stage',
    title: s.name, body: s.purpose,
  })),
  { id: 'customizer', sectionId: 'customizer', kind: 'Tool', title: 'Design your bottle live',
    body: 'customizer preview logo upload label colour color mockup' },
  ...PRICING_TIERS.map(t => ({
    id: `tier-${t.name}`, sectionId: 'pricing', kind: 'Pricing tier',
    title: `${t.name} — ${t.segment}`,
    body: `${t.dispatches} price per case ${PACK_SIZES.map(s => `${s} ₹${t.prices[s]}`).join(' ')}`,
  })),
  { id: 'brochure', sectionId: 'pricing', kind: 'Download', title: 'Pricing brochure (PDF)',
    body: 'price list rate card pdf download tiers per case gst transportation' },
  { id: 'contact', sectionId: 'contact', kind: 'Page', title: 'Get a quote',
    body: 'contact enquiry quote sample pricing order delivery brochure rate card' },
]

/**
 * Download glyph: an arrow falling into an open tray.
 *
 * Drawn as two groups (.dl-arrow / .dl-tray) so the hover animation defined in
 * useResponsiveStyles can move them independently. `currentColor` keeps it in
 * step with whatever the surrounding pill sets as its text colour.
 */
function DownloadIcon({ size = 16 }) {
  return (
    <svg className="dl-icon" width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <g className="dl-arrow">
        <path d="M10 2.5v9" />
        <path d="M6 8.5l4 4 4-4" />
      </g>
      <path className="dl-tray" d="M3 14.5v1.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
    </svg>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav className={scrolled ? 'nav-scrolled' : ''} style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 1000, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%', transition: 'all 0.4s ease', background: 'transparent'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
        <img src="/aquavia-logo.jpeg" alt="AquaVia" style={{ height: 48, borderRadius: 8, display: 'block' }} />
      </div>

      {/* Nav links */}
      <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {['about','services','journey','products','pricing','industries','customizer','contact'].map(id => (
          <button key={id} onClick={() => scrollTo(id)} style={{
            background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14,
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'color 0.2s',
            padding: '4px 0'
          }}
            onMouseEnter={e => e.target.style.color = 'var(--white)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >{id}</button>
        ))}
        <SiteSearch index={SEARCH_INDEX} onNavigate={scrollTo} />
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ geo, content }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="hero" style={{
      minHeight: '100vh', paddingTop: 72, paddingBottom: 80, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #04101f 0%, #071428 40%, #061020 100%)',
      display: 'flex', alignItems: 'center'
    }}>
      {/* Ambient orbs */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(62,207,191,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'-5%', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(91,143,249,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
      <MountainBg />

      <div className="hero-grid" style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, padding:'0 5%',
        width:'100%', alignItems:'center', position:'relative', zIndex:1
      }}>
        {/* Left */}
        <div style={{ animation:'fadeUp 0.9s ease forwards' }}>
          {content?.badge && !geo?.loading && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(62,207,191,0.1)', border:'1px solid rgba(62,207,191,0.3)', borderRadius:50, padding:'6px 16px', marginBottom:12, animation:'fadeUp 0.6s ease both' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#3ecfbf', display:'inline-block', boxShadow:'0 0 6px rgba(62,207,191,0.45)' }} />
              <span style={{ fontSize:13, color:'var(--aqua)', fontWeight:500 }}>{content.badge}</span>
            </div>
          )}
          <h1 className="hero-h1" id="main-heading" style={{
            fontFamily:'Cormorant Garamond, serif', fontWeight:700,
            fontSize:'clamp(44px, 5.5vw, 76px)', lineHeight:1.1, color:'var(--white)',
            marginBottom:24
          }}>
            Pure Water.<br />
            <span style={{ color:'var(--aqua)' }}>Your Brand.</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:18, lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
            {content?.heroSubheading || 'Premium Himalayan water, bottled with your logo. Trusted by 500+ brands for corporate events, hotels, offices, and more.'}
          </p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:48 }}>
            <button onClick={() => scrollTo('customizer')} style={{
              background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))', border:'none',
              borderRadius:50, padding:'14px 32px', color:'var(--navy)', fontFamily:'DM Sans, sans-serif',
              fontWeight:600, fontSize:15, cursor:'pointer', transition:'all 0.3s',
              boxShadow:'0 8px 30px rgba(62,207,191,0.3)'
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >Design Your Bottle →</button>
            <button onClick={() => scrollTo('products')} style={{
              background:'transparent', border:'1px solid rgba(62,207,191,0.4)',
              borderRadius:50, padding:'14px 32px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
              fontWeight:500, fontSize:15, cursor:'pointer', transition:'all 0.3s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(62,207,191,0.08)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)' }}
            >View Products</button>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:36, flexWrap:'wrap' }}>
            {[['500+','Brands Served'],['2Cr+','Bottles Delivered'],['48hr','Design Turnaround']].map(([num,label]) => (
              <div key={label}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:32, fontWeight:700, color:'var(--aqua)' }}>{num}</div>
                <div style={{ fontSize:13, color:'var(--muted)', fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — bottle trio */}
        <div className="hero-bottles" style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:16, paddingBottom:40 }}>
          <div style={{ marginBottom: 40 }}>
            <BottleSVG color="#3ecfbf" label="500ml" size={240} animationClass="floatA 3.5s ease-in-out infinite" />
          </div>
          <div style={{ marginBottom: 0 }}>
            <BottleSVG color="#c8a44a" label="250ml" size={280} animationClass="floatB 4s ease-in-out infinite" />
          </div>
          <div style={{ marginBottom: 60 }}>
            <BottleSVG color="#5b8ff9" label="1L" size={220} animationClass="floatC 3.8s ease-in-out infinite" />
          </div>
        </div>

        {/* Mobile single bottle */}
        <div className="hero-bottle-single" style={{ display:'none', justifyContent:'center' }}>
          <BottleSVG color="#3ecfbf" label="500ml" size={260} animationClass="floatB 4s ease-in-out infinite" />
        </div>
      </div>

      {/* Sample request bar */}
      <SampleRequestBar scrollTo={scrollTo} />
    </section>
  )
}

function SampleRequestBar({ scrollTo }) {
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      background:'linear-gradient(90deg, rgba(200,164,74,0.12), rgba(200,164,74,0.05))',
      borderTop:'1px solid rgba(200,164,74,0.25)', borderBottom:'1px solid rgba(200,164,74,0.25)',
      padding:'14px 5%', display:'flex', alignItems:'center', gap:16, zIndex:2, flexWrap:'wrap'
    }}>
      <span style={{ color:'var(--gold)', fontSize:14 }}>✦ Try before you commit —</span>
      <button onClick={() => scrollTo('contact')} style={{
        background:'transparent', border:'1px solid rgba(200,164,74,0.5)', borderRadius:50,
        padding:'7px 20px', color:'var(--gold)', fontFamily:'DM Sans, sans-serif',
        fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.3s'
      }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(200,164,74,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >Request a Sample Bottle →</button>
    </div>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  const leftRef = useReveal()
  const rightRef = useReveal()
  const FEATURES = [
    { icon:'🌊', label:'Himalayan-sourced purity' },
    { icon:'🎨', label:'250+ label designs' },
    { icon:'♻️', label:'Eco-friendly materials' },
    { icon:'⚡', label:'48-hour proofing' },
  ]
  return (
    <section id="about" className="sec" style={{ background:'var(--navy-mid)', position:'relative' }}>
      <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
        <div ref={leftRef} className="reveal-left">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', lineHeight:1.1, color:'var(--white)', marginBottom:24 }}>
            Born in the Himalayas,<br />Built for Your Brand
          </h2>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:20 }}>
            AquaVia was founded on one belief: that hydration is the most powerful touchpoint a brand can own. We source pure water from Himalayan springs and package it with your story — transforming every sip into a brand impression.
          </p>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:36 }}>
            From intimate boardrooms to large-scale conferences, our bottles carry your logo, your colors, and your message — delivered on time, every time, across every corner of India.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {FEATURES.map(f => (
              <div key={f.label} className="glass-card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{f.icon}</span>
                <span style={{ fontSize:14, fontWeight:500, color:'var(--white)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={rightRef} className="reveal-right" style={{ display:'flex', justifyContent:'center', position:'relative' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:300, height:300, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(62,207,191,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="glass-card" style={{ padding:24, position:'relative', zIndex:1 }}>
            <MoonMountainIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────
function ServicesSection() {
  const ref = useReveal()
  return (
    <section id="services" className="sec" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:36 }} ref={ref} className="reveal">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(26px,3.2vw,44px)', color:'var(--white)', lineHeight:1.1, whiteSpace:'nowrap' }}>
            End-to-End Branded Water Solutions
          </h2>
        </div>
        <div className="services-numbered" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 80px' }}>
          {SERVICES.map((s, i) => (
            <ServiceItem key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceItem({ service, index }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal" style={{
      display:'grid', gridTemplateColumns:'56px 1fr', gap:24,
      padding:'20px 0', borderTop:'1px solid var(--glass-border)',
      transitionDelay:`${index * 0.08}s`
    }}>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:38, fontWeight:700, color:'var(--aqua)', opacity:0.35, lineHeight:1, paddingTop:4 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div>
        <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, color:'var(--white)', marginBottom:10 }}>{service.title}</h3>
        <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:15 }}>{service.desc}</p>
      </div>
    </div>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const titleRef = useReveal()
  return (
    <section id="how" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            From Logo to Doorstep in 4 Steps
          </h2>
        </div>
        <div className="how-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, position:'relative' }}>
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} delay={i * 0.12} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, delay, isLast }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="glass-card step-card reveal" style={{
      padding:'32px 24px', textAlign:'center', position:'relative', transitionDelay:`${delay}s`
    }}>
      {!isLast && (
        <div style={{
          position:'absolute', top:44, right:'-12%', width:'24%', height:2,
          background:'linear-gradient(90deg, var(--aqua), transparent)',
          zIndex:10, pointerEvents:'none'
        }} />
      )}
      <div className="step-num" style={{
        width:52, height:52, borderRadius:'50%', border:'2px solid var(--aqua)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:700,
        color:'var(--aqua)', margin:'0 auto 20px', transition:'all 0.3s'
      }}>{step.num}</div>
      <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, fontWeight:600, color:'var(--white)', marginBottom:10 }}>{step.title}</h3>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:14 }}>{step.desc}</p>
    </div>
  )
}

// ─── Journey: "From Earth to You" ─────────────────────────────────────────────
function IllusSource() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190" style={{overflow:'visible'}}>
      <defs>
        <radialGradient id="dropGrad1" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#7efff4"/><stop offset="100%" stopColor="#1a8a80"/>
        </radialGradient>
      </defs>
      {[0, 0.75, 1.5].map((delay,i) => (
        <circle key={i} cx="100" cy="110" r="50" fill="none" stroke="#3ecfbf" strokeWidth="1.5"
          className="svg-anim"
          style={{animation:`sonarPulse 2.25s ${delay}s ease-out infinite`,animationFillMode:'both'}}/>
      ))}
      <ellipse cx="100" cy="140" rx="72" ry="10" fill="#3ecfbf" opacity="0.07"/>
      <ellipse cx="100" cy="152" rx="56" ry="7" fill="#3ecfbf" opacity="0.05"/>
      <path d="M100 72 C100 72 74 100 74 116 C74 133 86 144 100 144 C114 144 126 133 126 116 C126 100 100 72 100 72Z" fill="url(#dropGrad1)"/>
      <ellipse cx="90" cy="104" rx="7" ry="10" fill="white" opacity="0.22"/>
    </svg>
  )
}

function IllusExtraction() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <ellipse cx="100" cy="166" rx="60" ry="9" fill="#5b8ff9" opacity="0.12"/>
      <rect x="94" y="38" width="12" height="128" rx="6" fill="#5b8ff9" opacity="0.18"/>
      <rect x="96" y="40" width="8" height="124" rx="4" fill="#5b8ff9" opacity="0.35"/>
      <path d="M97 40 L100 28 L103 40Z" fill="#5b8ff9" opacity="0.9"/>
      {[0, 0.7, 1.4].map((delay,i) => (
        <ellipse key={i} cx="100" cy="150" rx="4.5" ry="6.5" fill="#5b8ff9"
          className="svg-anim"
          style={{animation:`dropRise 2.1s ${delay}s ease-in-out infinite`,animationFillMode:'both',opacity:0}}/>
      ))}
      <rect x="28" y="158" width="144" height="2" fill="#5b8ff9" opacity="0.2" rx="1"/>
    </svg>
  )
}

function IllusFiltration({ activeStage = null, onStageHover }) {
  const BAR_COLORS = FILTRATION_COLORS
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <rect x="16" y="158" width="168" height="2" fill="white" opacity="0.07" rx="1"/>
      {BAR_COLORS.map((color,i) => {
        const x = 20 + i * 23
        const isActive = activeStage === i
        const isDimmed = activeStage !== null && !isActive
        return (
          // Dim/undim rides on the group, not on the animated rect: the
          // filterLight keyframe owns that rect's opacity and would win.
          <g key={i}
            onMouseEnter={() => onStageHover?.(i)}
            onMouseLeave={() => onStageHover?.(null)}
            style={{ opacity: isDimmed ? 0.2 : 1, transition:'opacity 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
            <title>{`${FILTRATION_STAGES[i].num} — ${FILTRATION_STAGES[i].name}`}</title>
            <rect x={x} y="48" width="17" height="110" rx="8" fill={color} opacity="0.08"/>
            <rect x={x} y="48" width="17" height="110" rx="8" fill={color}
              style={{
                animation:`filterLight 1.96s ${i*0.24}s ease-in-out infinite`, opacity:0.15,
                // Hold the shimmer still while a stage is being inspected, so the
                // steady highlight below reads as the answer to the hover.
                animationPlayState: activeStage !== null ? 'paused' : 'running',
              }}/>
            <rect x={x} y="48" width="17" height="110" rx="8" fill={color}
              style={{ opacity: isActive ? 0.95 : 0, transition:'opacity 0.3s cubic-bezier(0.22,1,0.36,1)' }}/>
            <text x={x+8.5} y="178" textAnchor="middle" fill={color} fontSize="7.5" fontFamily="DM Sans"
              style={{ opacity: isActive ? 1 : 0.8, transition:'opacity 0.3s ease' }}>S{i+1}</text>
          </g>
        )
      })}
      {[0,1,2,3,4,5].map(i => (
        <path key={i} d={`M${37+i*23} 100 L${43+i*23} 100`} stroke="white" strokeWidth="0.6" opacity="0.15"/>
      ))}
    </svg>
  )
}

function IllusMinerals() {
  const IONS = [
    {label:'Ca',color:'#c8a44a',r:42,speed:'3.2s',di:0},
    {label:'Mg',color:'#3ecfbf',r:32,speed:'2.4s',di:1},
    {label:'K', color:'#7c4dff',r:50,speed:'4s',  di:0},
    {label:'Na',color:'#5b8ff9',r:38,speed:'2.8s',di:1},
  ]
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <defs>
        <radialGradient id="dropGrad4" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#b2fff8"/><stop offset="100%" stopColor="#1a8a80"/>
        </radialGradient>
      </defs>
      {[32,42,50].map((r,i) => (
        <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth="0.6" opacity="0.08" strokeDasharray="4 6"/>
      ))}
      {IONS.map((ion,i) => (
        <g key={i} style={{
          transformOrigin:'100px 100px',
          animation:`orbitSpin ${ion.speed} ${i*0.4}s linear infinite`,
          animationDirection: ion.di===1 ? 'reverse' : 'normal'
        }}>
          <circle cx={100+ion.r} cy="100" r="10" fill={ion.color} opacity="0.18"/>
          <circle cx={100+ion.r} cy="100" r="6" fill={ion.color} opacity="0.7"/>
          <text x={100+ion.r} y="104" textAnchor="middle" fill="white" fontSize="6" fontFamily="DM Sans" fontWeight="600">{ion.label}</text>
        </g>
      ))}
      <path d="M100 80 C100 80 84 97 84 108 C84 119 91 126 100 126 C109 126 116 119 116 108 C116 97 100 80 100 80Z" fill="url(#dropGrad4)"/>
      <ellipse cx="93" cy="102" rx="5" ry="7" fill="white" opacity="0.25"/>
    </svg>
  )
}

function IllusBottling() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <defs>
        <clipPath id="bottleClip5">
          <path d="M88 48 L88 68 L78 78 L78 170 L122 170 L122 78 L112 68 L112 48 Z"/>
        </clipPath>
        <linearGradient id="waterGrad5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#1a8a80" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <path d="M88 48 L88 68 L78 78 L78 170 L122 170 L122 78 L112 68 L112 48 Z"
        fill="rgba(62,207,191,0.06)" stroke="#3ecfbf" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="86" y="40" width="28" height="10" rx="4" fill="#3ecfbf" opacity="0.4"/>
      <rect x="78" y="100" width="44" height="40" fill="rgba(62,207,191,0.06)" stroke="rgba(62,207,191,0.2)" strokeWidth="0.8"/>
      <text x="100" y="118" textAnchor="middle" fill="#3ecfbf" fontSize="7" fontFamily="DM Sans" opacity="0.7">YOUR</text>
      <text x="100" y="128" textAnchor="middle" fill="#3ecfbf" fontSize="7" fontFamily="DM Sans" opacity="0.7">BRAND</text>
      <rect x="78" y="78" width="44" height="92" fill="url(#waterGrad5)"
        clipPath="url(#bottleClip5)"
        className="svg-anim"
        style={{animation:'fillBottle 3s ease-in-out infinite'}}/>
      <path d="M86 82 L86 160" stroke="white" strokeWidth="2" opacity="0.08" strokeLinecap="round"/>
      <rect x="50" y="172" width="100" height="3" rx="1.5" fill="white" opacity="0.08"/>
      {[0,1,2,3].map(i => (
        <circle key={i} cx={58+i*22} cy="178" r="4" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12"/>
      ))}
    </svg>
  )
}

function IllusDelivery() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <rect x="8" y="160" width="184" height="4" rx="2" fill="#5b8ff9" opacity="0.12"/>
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={12+i*36} y="161.5" width="18" height="1" rx="0.5" fill="#5b8ff9" opacity="0.18"/>
      ))}
      {[0,1,2].map(i => (
        <line key={i} x1="8" y1={124+i*10} x2={48+i*4} y2={124+i*10}
          stroke="#5b8ff9" strokeWidth={1.2-i*0.3} opacity="0.2"
          style={{transformOrigin:'48px 100px',animation:`speedLine 1.2s ${i*0.25}s ease-out infinite`}}/>
      ))}
      <g style={{animation:'truckWobble 0.6s ease-in-out infinite'}}>
        <rect x="38" y="104" width="94" height="56" rx="5" fill="#0b2244" stroke="#5b8ff9" strokeWidth="1.5" opacity="0.95"/>
        <text x="68" y="136" fontSize="16" fill="#5b8ff9" opacity="0.55" textAnchor="middle">❄</text>
        <text x="95" y="136" fontSize="16" fill="#5b8ff9" opacity="0.45" textAnchor="middle">❄</text>
        <text x="116" y="136" fontSize="13" fill="#5b8ff9" opacity="0.35" textAnchor="middle">❄</text>
        <text x="85" y="154" fontSize="9.5" fill="#3ecfbf" fontFamily="DM Sans" fontWeight="600" textAnchor="middle">4°C</text>
        <rect x="130" y="116" width="36" height="44" rx="4" fill="#081b35" stroke="#5b8ff9" strokeWidth="1.5"/>
        <rect x="135" y="122" width="20" height="17" rx="3" fill="#3ecfbf" opacity="0.22"/>
        <circle cx="163" cy="152" r="3.5" fill="#c8a44a" opacity="0.85"/>
        <circle cx="163" cy="152" r="6" fill="#c8a44a" opacity="0.12"/>
        <circle cx="70" cy="160" r="11" fill="#04101f" stroke="#5b8ff9" strokeWidth="2"/>
        <circle cx="70" cy="160" r="5" fill="#5b8ff9" opacity="0.4"/>
        <circle cx="148" cy="160" r="11" fill="#04101f" stroke="#5b8ff9" strokeWidth="2"/>
        <circle cx="148" cy="160" r="5" fill="#5b8ff9" opacity="0.4"/>
        <rect x="38" y="158" width="130" height="4" rx="2" fill="#5b8ff9" opacity="0.1"/>
      </g>
      {[{x:28,y:80,d:0},{x:18,y:62,d:0.5},{x:44,y:55,d:1},{x:12,y:92,d:0.8}].map((s,i) => (
        <circle key={i} cx={s.x} cy={s.y} r="2.5" fill="#5b8ff9" opacity="0.35"
          className="svg-anim"
          style={{animation:`snowFloat 2.2s ${s.d}s ease-in-out infinite alternate`}}/>
      ))}
    </svg>
  )
}

function IllusYours() {
  const RAY_ANGLES = [0,45,90,135,180,225,270,315]
  const SPARK_ANGLES = [22,67,112,157,202,247,292,337]
  return (
    <svg viewBox="0 0 200 200" width="190" height="190" style={{overflow:'visible'}}>
      <defs>
        <radialGradient id="dropGrad7" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fffbf0"/><stop offset="100%" stopColor="#3ecfbf"/>
        </radialGradient>
        <radialGradient id="glowGrad7" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8a44a" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#c8a44a" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="65" fill="url(#glowGrad7)"/>
      {RAY_ANGLES.map((angle,i) => {
        const rad = angle * Math.PI / 180
        const x2 = 100 + Math.cos(rad) * 68
        const y2 = 100 + Math.sin(rad) * 68
        return (
          <line key={i} x1="100" y1="100" x2={x2} y2={y2}
            stroke={i%2===0?'#c8a44a':'#3ecfbf'} strokeWidth="1.8" strokeLinecap="round"
            strokeDasharray="68" strokeDashoffset="68"
            style={{animation:`burstLine 2.4s ${i*0.18}s ease-out infinite`}}/>
        )
      })}
      {SPARK_ANGLES.map((angle,i) => {
        const rad = angle * Math.PI / 180
        const cx = 100 + Math.cos(rad) * 55
        const cy = 100 + Math.sin(rad) * 55
        return (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill={i%2===0?'#c8a44a':'#3ecfbf'}
            className="svg-anim"
            style={{animation:`twinkle 1.8s ${i*0.22}s ease-in-out infinite`,opacity:0.1}}/>
        )
      })}
      <path d="M100 68 C100 68 76 93 76 109 C76 124 87 134 100 134 C113 134 124 124 124 109 C124 93 100 68 100 68Z" fill="url(#dropGrad7)"/>
      <ellipse cx="91" cy="97" rx="7" ry="9" fill="white" opacity="0.28"/>
    </svg>
  )
}

const ILLUS_COMPONENTS = [IllusSource, IllusExtraction, IllusFiltration, IllusMinerals, IllusBottling, IllusDelivery, IllusYours]

function colorToRgb(hex) {
  if (hex === '#3ecfbf') return '62,207,191'
  if (hex === '#5b8ff9') return '91,143,249'
  if (hex === '#7c4dff') return '124,77,255'
  if (hex === '#c8a44a') return '200,164,74'
  return '62,207,191'
}

function JourneyRow({ step, index }) {
  const ref = useReveal()
  // The step-03 illustration is hover-linked to its own bars: the rects are
  // labelled S1–S7, and this is what makes that labelling mean something
  // instead of being decoration.
  const [activeStage, setActiveStage] = useState(null)
  const IllusComp = ILLUS_COMPONENTS[index]
  const isReversed = index % 2 === 1
  const rgb = colorToRgb(step.color)
  const textEl = (
    <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
      <span style={{ color:step.color, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>
        {step.num}
      </span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'clamp(24px,2.8vw,38px)', color:'var(--white)', lineHeight:1.1, marginBottom:16 }}>
        {step.title}
      </h3>
      <div style={{ width:40, height:2, background:step.color, marginBottom:20, borderRadius:2 }}/>
      <p style={{ color:'var(--muted)', lineHeight:1.8, fontSize:15, maxWidth:420 }}>{step.body}</p>
      {step.stages && (
        // The stage detail now leads the section rather than hiding behind a
        // toggle here; this just points at it.
        <button
          onClick={scrollToFiltration}
          className="stage-toggle"
          style={{
            display:'flex', alignItems:'center', gap:10, background:'none', border:'none',
            padding:0, marginTop:20, cursor:'pointer', color:step.color,
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, letterSpacing:1,
          }}>
          See all seven stages
          <span className="stage-toggle-icon" style={{ fontSize:16, lineHeight:1 }}>↑</span>
        </button>
      )}
    </div>
  )
  const illusEl = (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{
        width:240, height:240, borderRadius:'50%',
        background:`radial-gradient(circle, rgba(${rgb},0.09) 0%, transparent 70%)`,
        border:`1px solid rgba(${rgb},0.15)`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {/* activeStage is meaningful only to IllusFiltration; the other six
            illustrations take the prop and ignore it. */}
        <IllusComp activeStage={activeStage} onStageHover={setActiveStage} />
      </div>
    </div>
  )
  return (
    <div ref={ref} className="reveal journey-row-grid"
      style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(32px,5vw,80px)', alignItems:'center', marginBottom:64, transitionDelay:`${index*0.04}s` }}>
      {isReversed ? <>{textEl}{illusEl}</> : <>{illusEl}{textEl}</>}
    </div>
  )
}

// ─── 7-Stage Filtration showcase ──────────────────────────────────────────────
/**
 * The plant spec, promoted out of Journey step 03 and given the whole width.
 *
 * It used to sit behind a "See the seven stages" toggle inside step 03, which
 * meant the single most concrete proof on the page — the actual filtration
 * train — was invisible unless a visitor thought to click. Procurement buyers
 * come here for exactly this.
 *
 * The pipeline and the cards are two views of one selection: hovering either
 * lights the other, which is the same cross-highlight the step-03 illustration
 * already does.
 */
const FILTRATION_GEOM = { start: 30, slot: 86, barW: 48, top: 46, barH: 104, vbW: 624, vbH: 200 }

/**
 * Deliberately NOT scrollIntoView.
 *
 * #filtration sits inside the journey <section>, which sets overflow:hidden.
 * That makes the section its own scrollport, and scrollIntoView stops there:
 * the element is already fully visible *within the clipped box*, so the browser
 * considers the job done and the document never moves. The nav links get away
 * with scrollIntoView because they target top-level sections.
 *
 * Scrolling the window against the element's absolute offset skips the
 * intervening scrollport entirely. The 96px offset clears the fixed navbar.
 */
function scrollToFiltration() {
  const el = document.getElementById('filtration')
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
}

function FiltrationShowcase() {
  const headRef = useReveal()
  const railRef = useReveal()
  const [active, setActive] = useState(null)
  const [pinned, setPinned] = useState(null)
  const [scan, setScan] = useState(0)
  const inspectedRef = useRef(false)

  // Idle attract loop. It walks S1→S7 so the pipeline reads as a sequence a drop
  // travels through rather than seven unrelated bars — but it yields the moment a
  // visitor takes over, and never runs for people who asked for less motion.
  const engaged = pinned !== null || active !== null
  useEffect(() => {
    if (engaged) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setScan(s => (s + 1) % FILTRATION_STAGES.length), 1700)
    return () => clearInterval(id)
  }, [engaged])

  const shown = pinned ?? active ?? (engaged ? null : scan)

  // Fires once per mount, on the first deliberate inspection of a stage. A
  // visitor who merely scrolled past has not checked the spec.
  const noteInspection = () => {
    if (inspectedRef.current) return
    inspectedRef.current = true
    track('filtration_stages_expanded', { sectionId: 'journey' })
  }

  const { start, slot, barW, top, barH, vbW, vbH } = FILTRATION_GEOM

  return (
    <div id="filtration" style={{ marginBottom:96, scrollMarginTop:96 }}>
      <div ref={headRef} className="reveal" style={{ textAlign:'center', marginBottom:32 }}>
        <p style={{ color:'#7c4dff', fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:4, textTransform:'uppercase', marginBottom:14 }}>
          SEVEN-STAGE FILTRATION
        </p>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'clamp(26px,3.4vw,44px)', color:'var(--white)', lineHeight:1.1, marginBottom:16 }}>
          Every drop, <span style={{ color:'var(--aqua)' }}>seven times over</span>
        </h3>
        <p style={{ color:'var(--muted)', fontSize:15, lineHeight:1.75, maxWidth:600, margin:'0 auto' }}>
          Water enters raw and leaves sealed. Between those two moments it passes through
          seven sequential stages — each one removing what the last could not.
        </p>
      </div>

      {/* The pipeline. Decorative in the accessibility tree: every stage it draws
          is stated as real text in the rail below, so a screen reader gets the
          spec without having to parse an SVG. */}
      <div className="glass-card" style={{ padding:'28px 20px 18px', marginBottom:22, overflowX:'auto' }}>
        {/* Capped and centred: stretched to the full 1200px column the bars grow
            to ~440px tall and the diagram bullies the section it introduces. */}
        <svg viewBox={`0 0 ${vbW} ${vbH}`} aria-hidden="true" focusable="false"
          style={{ display:'block', width:'100%', maxWidth:860, minWidth:560, margin:'0 auto' }}>
          <defs>
            <linearGradient id="filtFlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c8a44a" stopOpacity="0.5"/>
              <stop offset="55%" stopColor="#5b8ff9" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0.9"/>
            </linearGradient>
          </defs>

          {/* The pipe the water runs along, dashes drifting downstream. */}
          <line x1="0" y1={top + barH / 2} x2={vbW} y2={top + barH / 2}
            stroke="url(#filtFlow)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="10 8" style={{ animation:'dashFlow 1.6s linear infinite' }}/>

          {/* One droplet making the full traverse, left (raw) to right (pure). */}
          <circle cx="-8" cy={top + barH / 2} r="5.5" fill="#3ecfbf"
            style={{ animation:'flowRight 5.2s linear infinite' }}/>

          {FILTRATION_STAGES.map((stage, i) => {
            const color = FILTRATION_COLORS[i]
            const x = start + i * slot
            const isActive = shown === i
            const isDimmed = shown !== null && !isActive
            return (
              <g key={stage.num}
                onMouseEnter={() => { setActive(i); noteInspection() }}
                onMouseLeave={() => setActive(null)}
                style={{ opacity: isDimmed ? 0.28 : 1, transition:'opacity 0.35s cubic-bezier(0.22,1,0.36,1)', cursor:'pointer' }}>
                <title>{`${stage.num} — ${stage.name}`}</title>

                {isActive && (
                  <ellipse cx={x + barW / 2} cy={top + barH / 2} rx={barW * 0.82} ry={barH * 0.58}
                    fill={color} opacity="0.18"
                    style={{
                      animation:'stageHalo 2.4s ease-in-out infinite',
                      // Without these the scale() in the keyframe pivots on the
                      // SVG origin and throws the halo off to the top-left.
                      transformBox:'fill-box', transformOrigin:'center',
                    }}/>
                )}

                <rect x={x} y={top} width={barW} height={barH} rx="14" fill={color} opacity="0.09"/>
                <rect x={x} y={top} width={barW} height={barH} rx="14" fill={color}
                  style={{
                    animation:`filterLight 1.96s ${i * 0.24}s ease-in-out infinite`, opacity:0.16,
                    animationPlayState: shown !== null ? 'paused' : 'running',
                  }}/>
                <rect x={x} y={top} width={barW} height={barH} rx="14" fill={color}
                  style={{ opacity: isActive ? 0.9 : 0, transition:'opacity 0.35s cubic-bezier(0.22,1,0.36,1)' }}/>
                <rect x={x} y={top} width={barW} height={barH} rx="14" fill="none"
                  stroke={color} strokeWidth="1.2" opacity={isActive ? 0.95 : 0.3}
                  style={{ transition:'opacity 0.35s ease' }}/>

                {/* Grit caught by this stage, settling out of the stream. */}
                {[0, 1, 2].map(d => (
                  <circle key={d} cx={x + 12 + d * 12} cy={top + 34} r="2" fill={color}
                    style={{ animation:`gritFall 2.6s ${(i * 0.24) + d * 0.5}s ease-in infinite`, opacity:0 }}/>
                ))}

                <text x={x + barW / 2} y={top + barH + 22} textAnchor="middle" fill={color}
                  fontSize="12" fontWeight="600" fontFamily="DM Sans"
                  style={{ opacity: isActive ? 1 : 0.75, transition:'opacity 0.3s ease' }}>
                  S{i + 1}
                </text>
                <text x={x + barW / 2} y={top + barH + 40} textAnchor="middle" fill="#ffffff"
                  fontSize="9.5" fontFamily="DM Sans" opacity={isActive ? 0.75 : 0.32}
                  style={{ transition:'opacity 0.3s ease' }}>
                  {stage.num}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Same max-width as the svg so these sit under the ends of the pipeline
            rather than drifting out to the card's corners. */}
        <div style={{ display:'flex', justifyContent:'space-between', width:'100%', maxWidth:860, minWidth:560, margin:'0 auto', padding:'4px 6px 0', fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>
          <span style={{ color:'rgba(200,164,74,0.75)' }}>Raw intake</span>
          <span style={{ color:'var(--aqua)' }}>Sealed &amp; pure</span>
        </div>
      </div>

      {/* The spec as text. Click pins a stage so it can be read without holding
          a hover — the descriptions are long enough that hover-only would be a
          usability trap on the way to reading one. */}
      <div ref={railRef} className="reveal filtration-rail">
        {FILTRATION_STAGES.map((stage, i) => {
          const color = FILTRATION_COLORS[i]
          const isActive = shown === i
          const isDimmed = shown !== null && !isActive
          const isPinned = pinned === i
          return (
            <button
              key={stage.num}
              type="button"
              aria-pressed={isPinned}
              className="stage-btn stage-card-in"
              onMouseEnter={() => { setActive(i); noteInspection() }}
              onMouseLeave={() => setActive(null)}
              onFocus={() => { setActive(i); noteInspection() }}
              onBlur={() => setActive(null)}
              onClick={() => { setPinned(p => (p === i ? null : i)); noteInspection() }}
              style={{
                animationDelay:`${i * 70}ms`,
                opacity: isDimmed ? 0.5 : 1,
                borderColor: isActive ? color : undefined,
                transform: isActive ? 'translateY(-6px)' : undefined,
                boxShadow: isActive ? `0 18px 40px rgba(0,0,0,0.35), 0 0 26px ${color}22` : undefined,
              }}>
              <span style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span aria-hidden="true" style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, boxShadow: isActive ? `0 0 12px ${color}` : 'none', transition:'box-shadow 0.3s ease' }}/>
                <span style={{ color, fontSize:12, fontWeight:600, letterSpacing:3 }}>{stage.num}</span>
              </span>
              <span style={{ display:'block', color:'var(--white)', fontSize:14.5, fontWeight:600, lineHeight:1.35, marginBottom:8 }}>
                {stage.name}
              </span>
              <span style={{ display:'block', color:'var(--muted)', fontSize:13, lineHeight:1.65 }}>
                {stage.purpose}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function JourneySection() {
  const titleRef = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })
  return (
    <section id="journey" className="sec" style={{ background:'var(--navy)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translateX(-50%)', width:700, height:700, background:'radial-gradient(circle,rgba(62,207,191,0.035) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }}/>
      <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
        <div ref={titleRef} className="reveal" style={{ textAlign:'center', marginBottom:88 }}>
          <p style={{ color:'var(--aqua)', fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:4, textTransform:'uppercase', marginBottom:16 }}>THE JOURNEY</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'clamp(34px,5vw,64px)', color:'var(--white)', lineHeight:1.05, marginBottom:20 }}>
            From Earth to <span style={{ color:'var(--gold)' }}>You</span>
          </h2>
          <p style={{ color:'var(--muted)', fontSize:16, lineHeight:1.75, maxWidth:560, margin:'0 auto' }}>
            Every drop carries a story — a journey of purity, precision, and care from ancient aquifers to your hands.
          </p>
        </div>
        <FiltrationShowcase />
        {JOURNEY_STEPS.map((step,i) => (
          <JourneyRow key={step.num} step={step} index={i} />
        ))}
        <div style={{ textAlign:'center', marginTop:8 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,2.5vw,30px)', fontStyle:'italic', color:'var(--muted)', marginBottom:32 }}>
            Not just water. <span style={{ color:'var(--white)', fontStyle:'italic' }}>Your</span> water.
          </p>
          <button onClick={() => scrollTo('contact')}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 44px rgba(62,207,191,0.48)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(62,207,191,0.3)' }}
            style={{ background:'linear-gradient(135deg,var(--aqua-dim),var(--aqua))', color:'var(--navy)', border:'none', borderRadius:50, padding:'14px 38px', fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:'pointer', boxShadow:'0 8px 32px rgba(62,207,191,0.3)', transition:'all 0.3s' }}>
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Products ─────────────────────────────────────────────────────────────────
function ProductsSection() {
  const titleRef = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const doubled = [...PRODUCTS, ...PRODUCTS]
  return (
    <section id="products" className="sec" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <SectionTag>Our Range</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Choose Your Perfect Size
          </h2>
        </div>
        <div className="marquee-wrapper" style={{ paddingTop:20, paddingBottom:16 }}>
          <div className="marquee-track" style={{ animation:'marquee 22s linear infinite' }}>
            {doubled.map((p, i) => (
              // The marquee renders PRODUCTS twice to loop seamlessly. Only the
              // first copy emits view events, or every bottle size would report
              // exactly double the views it actually got.
              <ProductCard
                key={`${p.size}-${i}`}
                product={p}
                delay={0}
                scrollTo={scrollTo}
                marquee
                trackable={i < PRODUCTS.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, delay, scrollTo, marquee, trackable = true }) {
  const ref = useReveal()
  const card = (
    <div ref={marquee ? null : ref} className={`bottle-card${marquee ? '' : ' reveal'}${product.featured ? ' featured-card' : ''}`} style={{
      background:'var(--navy-card)', border:`1px solid ${product.featured ? 'rgba(62,207,191,0.4)' : 'var(--glass-border)'}`,
      borderRadius:24, padding:'24px 22px', textAlign:'center', position:'relative',
      transitionDelay:marquee ? '0s' : `${delay}s`, display:'flex', flexDirection:'column', alignItems:'center', gap:0,
      flex:'0 0 252px', minWidth:252, marginRight:20,
    }}>
      {product.featured && (
        <div className="featured-badge" style={{
          position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(135deg, var(--gold), #a87c28)', borderRadius:50,
          padding:'4px 18px', fontSize:11, fontWeight:700, letterSpacing:'0.1em',
          color:'var(--navy)', textTransform:'uppercase', zIndex:10, whiteSpace:'nowrap'
        }}>Most Popular</div>
      )}
      <BottleSVG color={product.color} label={product.size} size={132} />
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:32, fontWeight:700, color:product.color, marginTop:8, lineHeight:1 }}>{product.size}</div>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, color:'var(--white)', marginBottom:6 }}>{product.name}</div>
      <p style={{ color:'var(--muted)', fontSize:13, lineHeight:1.55, marginBottom:14 }}>{product.desc}</p>
      <div style={{ width:'100%', height:1, background:'var(--glass-border)', margin:'2px 0 14px' }} />
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:700, color:'var(--white)', marginBottom:4 }}>{product.price}</div>
      {/* Always rendered, blank when absent: the sizes quoted on request would
          otherwise sit a line higher and knock the row of buttons out of line. */}
      <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>
        {product.caseNote ? `${product.caseNote} · lower at volume` : ' '}
      </div>
      <div style={{ fontSize:13, color:'var(--muted)', marginBottom:16 }}>Min. {product.minOrder}</div>
      <button
        onClick={() => scrollTo('contact')}
        data-evt="product_cta_clicked"
        data-sku={product.sku}
        style={{
        width:'100%', background:`linear-gradient(135deg, ${product.color}, ${product.color}aa)`,
        border:'none', borderRadius:12, padding:'11px', color:'var(--navy)',
        fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', transition:'all 0.3s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
      >Order Now</button>
    </div>
  )

  if (!trackable) return card
  return (
    // The wrapper becomes the marquee's flex item; the card keeps its own
    // minWidth/marginRight so the track spacing is unchanged.
    <TrackInView
      event="product_viewed"
      productSku={product.sku}
      sectionId="products"
      style={{ flex: '0 0 auto', display: 'flex' }}
    >
      {card}
    </TrackInView>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
/**
 * The brochure link, defined once.
 *
 * Two variants because it appears in two competitive contexts: `solid` for the
 * pricing section, where it is the only call to action and should carry the
 * weight, and `ghost` for the contact block, where the enquiry form is the
 * primary and this must not out-shout it.
 *
 * `data-evt` is all the instrumentation this needs — the delegated listener in
 * analytics/delegate.ts resolves it on any click, and an explicit data-evt beats
 * its href sniffing, so this doesn't get miscounted as a generic outbound click.
 */
function BrochureLink({ style, variant = 'ghost' }) {
  const solid = variant === 'solid'
  const rest = solid
    ? '0 8px 24px rgba(62,207,191,0.20)'
    : '0 4px 16px rgba(4,26,43,0.25)'
  const lift = solid
    ? '0 16px 38px rgba(62,207,191,0.34)'
    : '0 10px 26px rgba(62,207,191,0.16)'
  return (
    <a
      className={`dl-btn dl-btn-${variant}`}
      href={BROCHURE_URL}
      download
      target="_blank"
      rel="noopener"
      data-evt="pricing_brochure_downloaded"
      style={{
        display:'inline-flex', alignItems:'center', gap:14,
        padding: solid ? '12px 26px 12px 14px' : '11px 24px 11px 13px',
        borderRadius:50, textDecoration:'none', whiteSpace:'nowrap',
        fontFamily:'DM Sans, sans-serif',
        background: solid ? 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))' : 'transparent',
        border: solid ? '1px solid transparent' : '1px solid rgba(62,207,191,0.45)',
        color: solid ? 'var(--navy)' : 'var(--aqua)',
        boxShadow: rest,
        transition:'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = lift
        if (!solid) e.currentTarget.style.borderColor = 'var(--aqua)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = rest
        if (!solid) e.currentTarget.style.borderColor = 'rgba(62,207,191,0.45)'
      }}
    >
      <span className="dl-chip"><DownloadIcon size={17} /></span>
      {/* Two lines: the action, then what actually lands in the downloads
          folder. The format and size are the questions a PDF link raises. */}
      <span style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1, lineHeight:1.25 }}>
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.01em' }}>
          Download pricing brochure
        </span>
        <span style={{
          fontSize:11.5, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase',
          opacity: solid ? 0.62 : 0.7,
        }}>
          PDF · Corporate rate card
        </span>
      </span>
    </a>
  )
}

function PricingSection() {
  const titleRef = useReveal()
  const footRef = useReveal()
  return (
    <section id="pricing" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <SectionTag>Corporate Programme</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Pricing, <span style={{ color:'var(--aqua)' }}>refined.</span>
          </h2>
          <p style={{ color:'var(--muted)', maxWidth:560, margin:'10px auto 0', lineHeight:1.6 }}>
            Three tiers of partnership, each engineered around volume, presentation, and the standard your guests expect.
          </p>
        </div>

        {/* auto-fit rather than a fixed 3 columns: each card carries its own
            three-column price table, which turns unreadable if the cards are
            squeezed at tablet widths. They drop to two, then one, on their own. */}
        <div className="pricing-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:28, alignItems:'stretch' }}>
          {PRICING_TIERS.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} delay={i * 0.12} />
          ))}
        </div>

        <div ref={footRef} className="reveal" style={{ marginTop:28 }}>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'12px 28px', paddingTop:22, borderTop:'1px solid var(--glass-border)' }}>
            {PRICING_INCLUDES.map(item => (
              <span key={item} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--white)', fontSize:14 }}>
                <span style={{ color:'var(--aqua)' }} aria-hidden="true">✓</span>{item}
              </span>
            ))}
          </div>
          <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, marginTop:14 }}>{PRICING_FOOTNOTE}</p>

          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:16, marginTop:22 }}>
            <BrochureLink variant="solid" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TierCard({ tier, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`bottle-card reveal${tier.featured ? ' featured-card' : ''}`}
      style={{
        background:'var(--navy-card)',
        border:`1px solid ${tier.featured ? 'rgba(62,207,191,0.4)' : 'var(--glass-border)'}`,
        borderRadius:24, padding:'26px 24px', position:'relative', transitionDelay:`${delay}s`,
        display:'flex', flexDirection:'column'
      }}
    >
      {tier.featured && (
        <div className="featured-badge" style={{
          position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))', borderRadius:50,
          padding:'4px 18px', fontSize:11, fontWeight:700, letterSpacing:'0.1em',
          color:'var(--navy)', textTransform:'uppercase', zIndex:10, whiteSpace:'nowrap'
        }}>Most Chosen</div>
      )}

      <div style={{
        width:34, height:34, borderRadius:'50%', border:'1px solid rgba(62,207,191,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'var(--aqua)', fontSize:11, letterSpacing:'0.06em', marginBottom:10
      }}>{tier.num}</div>

      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, fontWeight:700, color:'var(--white)', lineHeight:1.1 }}>{tier.name}</div>
      <div style={{ color:'var(--gold)', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:6 }}>{tier.segment}</div>
      <div style={{ color:'var(--muted)', fontSize:13, marginTop:8, marginBottom:18 }}>{tier.dispatches}</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginTop:'auto' }}>
        {PACK_SIZES.map(size => (
          <div key={size}>
            <div style={{ color:'var(--muted)', fontSize:11, letterSpacing:'0.1em', marginBottom:4 }}>{size}</div>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, fontWeight:700, color:'var(--white)', lineHeight:1 }}>
              <span style={{ fontSize:14, color:'var(--aqua)', verticalAlign:'super' }}>₹</span>{tier.prices[size]}
            </div>
            <div style={{ color:'var(--muted)', fontSize:12, marginTop:4 }}>per case</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>
              {`₹${perBottle(tier.prices[size], size)} / bottle`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Industries ───────────────────────────────────────────────────────────────
function IndustriesSection() {
  const titleRef = useReveal()
  return (
    <section id="industries" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Trusted Across Every Sector
          </h2>
        </div>
        <div className="industries-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
          {INDUSTRIES.map((ind, i) => (
            <IndustryChip key={ind.name} ind={ind} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  )
}

function IndustryChip({ ind, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="industry-chip reveal"
      data-evt="industry_clicked"
      data-industry={ind.name.toLowerCase().replace(/[^a-z]+/g, '-')}
      style={{
      background:'rgba(11,34,68,0.7)', border:'1px solid var(--glass-border)', borderRadius:14,
      padding:'18px 20px', display:'flex', alignItems:'center', gap:14,
      transition:'all 0.3s', cursor:'default', transitionDelay:`${delay}s`
    }}>
      <span style={{ fontSize:28, flexShrink:0 }} aria-hidden="true">{ind.icon}</span>
      <span style={{ fontWeight:500, fontSize:15, color:'var(--white)' }}>{ind.name}</span>
    </div>
  )
}

// ─── Customizer ───────────────────────────────────────────────────────────────
function CustomizerSection() {
  const [logo, setLogo] = useState(null)
  const [color, setColor] = useState('#3ecfbf')
  const [size, setSize] = useState('500ml')
  const fileRef = useRef()
  const leftRef = useReveal()
  const rightRef = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const COLORS = [
    { hex: '#3ecfbf', name: 'Glacial Teal' },
    { hex: '#c8a44a', name: 'Durbar Gold' },
    { hex: '#5b8ff9', name: 'Himalayan Blue' },
    { hex: '#e85d75', name: 'Coral Rose' },
    { hex: '#7c4dff', name: 'Lavender' },
    { hex: '#ff7043', name: 'Amber' },
  ]
  // Derived, not a second hand-written list: this one silently kept offering
  // 100ml and 350ml after both were discontinued, and labelled the litre bottle
  // differently from the product cards. The chips ARE the SKUs.
  const SIZES = PRODUCTS.map(p => p.sku)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target.result)
    reader.readAsDataURL(file)
    // The logo itself is customer IP and the filename can identify a company —
    // record only that an upload happened, plus coarse non-identifying facts.
    track('customizer_logo_uploaded', {
      sectionId: 'customizer',
      props: { fileType: file.type, sizeBucket: file.size > 1e6 ? 'large' : 'small' },
    })
  }

  const chooseColor = (hex, name) => {
    setColor(hex)
    track('customizer_color_changed', { sectionId: 'customizer', props: { color: name } })
  }

  const chooseSize = (s) => {
    setSize(s)
    track('customizer_size_changed', { sectionId: 'customizer', productSku: s })
  }

  return (
    <section id="customizer" className="sec" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="sec-head">
          <SectionTag>Live Customizer</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Design Your Bottle, Live
          </h2>
        </div>

        <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
          {/* Controls */}
          <div ref={leftRef} className="reveal-left">
            {/* Upload zone */}
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              width:'100%', border:'2px dashed rgba(62,207,191,0.3)', borderRadius:18, padding:'32px',
              textAlign:'center', cursor:'pointer', marginBottom:28, transition:'border-color 0.3s',
              background:'rgba(11,34,68,0.4)'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(62,207,191,0.6)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(62,207,191,0.3)'}
            >
              {logo ? (
                <div>
                  <img src={logo} alt="logo preview" style={{ maxHeight:80, maxWidth:160, objectFit:'contain', marginBottom:12 }} />
                  <div style={{ color:'var(--aqua)', fontSize:13, fontWeight:600 }}>Logo uploaded ✓</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:36, marginBottom:10 }}>☁️</div>
                  <div style={{ color:'var(--white)', fontWeight:600, marginBottom:6 }}>Upload Your Logo</div>
                  <div style={{ color:'var(--muted)', fontSize:13 }}>PNG, SVG or JPG · Max 5MB</div>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
            {logo && (
              <button onClick={() => setLogo(null)} style={{
                background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8,
                padding:'8px 16px', color:'var(--muted)', fontSize:13, cursor:'pointer',
                marginTop:-16, marginBottom:24, display:'block'
              }}>Remove logo</button>
            )}

            {/* Color picker */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--white)', marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>Label Color</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    aria-label={`${c.name}${color === c.hex ? ' (selected)' : ''}`}
                    onClick={() => chooseColor(c.hex, c.name)}
                    style={{
                      width:32, height:32, borderRadius:'50%', background:c.hex, cursor:'pointer',
                      transition:'all 0.2s', border:'none', padding:0,
                      boxShadow: color === c.hex ? `0 0 0 3px white, 0 0 0 5px ${c.hex}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom:36 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--white)', marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>Bottle Size</div>
              <div style={{ display:'flex', gap:10 }}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => chooseSize(s)} style={{
                    borderRadius:50, padding:'9px 22px', fontSize:14, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.25s',
                    background: size === s ? 'var(--aqua)' : 'rgba(11,34,68,0.8)',
                    color: size === s ? 'var(--navy)' : 'var(--muted)',
                    borderColor: size === s ? 'var(--aqua)' : 'var(--glass-border)'
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <button onClick={() => scrollTo('contact')} style={{
              width:'100%', background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
              border:'none', borderRadius:14, padding:'16px', color:'var(--navy)',
              fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', transition:'all 0.3s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >Request This Design →</button>
          </div>

          {/* Live preview */}
          <div ref={rightRef} className="reveal-right">
            <div className="glass-card" style={{ padding:40, minHeight:380, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
              <BottleSVG logo={logo} color={color} label={size} size={280} animationClass="floatB 4s ease-in-out infinite" />
              <div style={{ color:'var(--muted)', fontSize:14, fontWeight:500 }}>Your brand. Live preview.</div>
              <div style={{ color:'var(--muted)', fontSize:12, opacity:0.7, textAlign:'center', maxWidth:260 }}>
                Final print may vary slightly based on label material
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection({ content }) {
  const allTestimonials = useMemo(() => {
    if (!content?.localTestimonial) return TESTIMONIALS
    return [{ ...content.localTestimonial, isLocal: true }, ...TESTIMONIALS]
  }, [content?.localTestimonial])

  const titleRef = useReveal()
  const doubled = [...allTestimonials, ...allTestimonials]

  return (
    <section id="testimonials" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Trusted by India's Leading Brands
          </h2>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-track" style={{ animation:'marquee 20s linear infinite' }}>
            {doubled.map((t, i) => (
              <div key={`${t.name}-${i}`} style={{
                background:'var(--navy-card)', border:'1px solid var(--glass-border)',
                borderRadius:20, padding:'28px 24px', position:'relative',
                flex:'0 0 380px', minWidth:380, marginRight:24,
              }}>
                {t.isLocal && (
                  <div style={{ position:'absolute', top:14, right:14, fontSize:11, fontWeight:700, color:'var(--aqua)', background:'rgba(62,207,191,0.1)', border:'1px solid rgba(62,207,191,0.3)', borderRadius:50, padding:'2px 10px', letterSpacing:'0.08em' }}>
                    📍 Delhi NCR
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(62,207,191,0.15)',
                    border:'1px solid rgba(62,207,191,0.3)', display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, color:'var(--aqua)', flexShrink:0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15, color:'var(--white)' }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{t.title}</div>
                  </div>
                </div>
                <div style={{ color:'var(--gold)', fontSize:14, marginBottom:12, letterSpacing:2 }}>{'★'.repeat(t.rating)}</div>
                <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.75, fontStyle:'italic' }}>&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────
/**
 * Channel glyphs. The WhatsApp mark is the brand glyph because a generic speech
 * bubble would not be recognised as WhatsApp at 20px; phone and mail are drawn
 * as strokes so they read as UI affordances rather than second logos.
 */
function ChannelGlyph({ kind }) {
  if (kind === 'whatsapp') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
      </svg>
    )
  }
  if (kind === 'call') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.6 2.8h2.9l1.5 3.9-2 1.2a12.6 12.6 0 0 0 5.4 5.4l1.2-2 3.9 1.5v2.9a2.1 2.1 0 0 1-2.3 2.1A17.6 17.6 0 0 1 4.5 5.1a2.1 2.1 0 0 1 2.1-2.3Z" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.6" />
      <path d="m3.4 6.9 7.7 5.6a1.5 1.5 0 0 0 1.8 0l7.7-5.6" />
    </svg>
  )
}

/**
 * One line of contact. An <a> and nothing else — no onClick, no handler. The
 * delegated listener resolves the href to contact_intent_clicked with the right
 * channel, so a fourth channel added here is instrumented without touching
 * analytics code.
 */
function ChannelRow({ channel }) {
  const external = channel.kind === 'whatsapp'
  return (
    <a
      href={channel.href}
      className={`ch-row${channel.primary ? ' ch-row-primary' : ''}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="ch-disc"><ChannelGlyph kind={channel.kind} /></span>
      <span>
        <span className="ch-title">{channel.title}</span>
        <span className="ch-note">{channel.note}</span>
        <span className="ch-value">{channel.value}</span>
      </span>
      <span className="ch-arrow" aria-hidden="true">→</span>
    </a>
  )
}

/**
 * The enquiry form was removed here on purpose.
 *
 * It asked six fields of a buyer who had already decided to talk to us, then
 * routed the answer through a server hop and an email forward before anyone saw
 * it. These buyers are on WhatsApp all day. The panel below replaces the form
 * with the three lines they would have used anyway, ranked, each one tappable.
 *
 * Consequence worth knowing: nothing on this page creates a Lead row any more.
 * The funnel's terminal step is contact_intent_clicked, not lead_submitted.
 */
function ContactSection({ content }) {
  const leftRef = useReveal()
  const rightRef = useReveal()
  const phone = content?.phone || '+91 76248 03460'
  const deliveryNote = content?.deliveryNote || 'Currently serving Delhi NCR.'
  const tel = `tel:${phone.replace(/\s/g, '')}`

  const waMsg = encodeURIComponent(
    content?.whatsappMsg || "Hi! I'm interested in customized water bottles for my business.",
  )

  const CHANNELS = [
    {
      kind: 'whatsapp',
      primary: true,
      title: 'WhatsApp',
      note: 'Fastest route. Send your logo and quantity, get a quote back the same day.',
      value: phone,
      href: `https://wa.me/917624803460?text=${waMsg}`,
    },
    {
      kind: 'call',
      title: 'Call the sales desk',
      note: 'Monday to Saturday, 9am to 7pm IST.',
      value: phone,
      href: tel,
    },
    {
      kind: 'email',
      title: 'Email us',
      note: 'Best for detailed specs, tenders, and PO paperwork.',
      value: 'info@aquaviaworld.com',
      href: 'mailto:info@aquaviaworld.com',
    },
  ]

  const SOCIAL = [
    { label:'Instagram', href:'https://www.instagram.com/aquavia.official?igsh=eHVmM3F3MnI2OTl0', color:'#e1306c', path:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { label:'LinkedIn', href:'https://www.linkedin.com/company/aquavia', color:'#0077b5', path:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  ]

  return (
    <section id="contact" className="sec" style={{ background:'#04101f' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="contact-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
          {/* Left */}
          <div ref={leftRef} className="reveal-left">
            <SectionTag>Get in Touch</SectionTag>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,48px)', color:'var(--white)', lineHeight:1.1, marginBottom:20 }}>
              Let's Build Something Together
            </h2>
            <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:40, maxWidth:'56ch' }}>
              No forms, no ticket queue. Reach the people who quote your order directly, and bring your logo, sizes, and quantity when you do.
            </p>

            {/* What a form's "we'll be in touch within 24 hours" used to promise,
                said specifically instead. A procurement manager decides whether to
                message us on the strength of what happens next. */}
            <div style={{ marginBottom:36 }}>
              {[
                { step:'01', text:'Rate card and MOQ confirmed against your quantity.' },
                { step:'02', text:'Label proof back within 48 hours of receiving artwork.' },
                { step:'03', text:'Approved orders dispatched in 7 to 10 working days.' },
              ].map(item => (
                <div key={item.step} style={{ display:'flex', gap:16, alignItems:'baseline', padding:'14px 0', borderTop:'1px solid var(--glass-border)' }}>
                  <span style={{ color:'var(--aqua)', fontSize:12, fontWeight:600, letterSpacing:'0.12em', flexShrink:0 }}>{item.step}</span>
                  <span style={{ color:'var(--white)', fontSize:14.5, lineHeight:1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {[
              { icon:'📍', text:'Delhi, India' },
              { icon:'🚚', text:deliveryNote },
            ].map(item => (
              <div key={item.text} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                <span style={{ fontSize:20 }} aria-hidden="true">{item.icon}</span>
                <span style={{ color:'var(--white)', fontSize:15 }}>{item.text}</span>
              </div>
            ))}

            <div style={{ display:'flex', gap:12, marginTop:32 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ textDecoration:'none' }}>
                  <div className="glass-card" style={{ width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={s.color}>
                      <path d={s.path} />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — the three channels, ranked */}
          <TrackInView event="contact_form_viewed" sectionId="contact">
          <div ref={rightRef} className="ch-panel reveal-right">
            {CHANNELS.map(channel => (
              <ChannelRow key={channel.kind} channel={channel} />
            ))}
            <div className="ch-foot">
              <span style={{ color:'var(--muted)', fontSize:13.5, lineHeight:1.5 }}>
                Not ready to talk yet?
              </span>
              <a
                href={BROCHURE_URL} download target="_blank" rel="noopener"
                data-evt="pricing_brochure_downloaded"
                style={{ color:'var(--aqua)', fontSize:13.5, fontWeight:500, textDecoration:'none' }}
              >↓ Take the rate card (PDF)</a>
            </div>
          </div>
          </TrackInView>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ content }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer style={{ background:'#03090f', padding:'60px 5% 30px' }}>
      <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40, maxWidth:1200, margin:'0 auto', marginBottom:40 }}>
        {/* Brand */}
        <div>
          <div style={{ marginBottom:14 }}>
            <img src="/aquavia-logo.jpeg" alt="AquaVia" style={{ height: 64, borderRadius: 8, display: 'block' }} />
          </div>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>Pure Himalayan hydration for brands that care.</p>
        </div>

        {/* Quick Links */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Quick Links</div>
          {['about','services','products','pricing','industries','customizer','contact'].map(id => (
            <button key={id} onClick={() => scrollTo(id)} style={{ display:'block', background:'none', border:'none', color:'var(--muted)', fontSize:14, marginBottom:10, cursor:'pointer', textTransform:'capitalize', transition:'color 0.2s', padding:0, fontFamily:'DM Sans, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.color='var(--aqua)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}
            >{id}</button>
          ))}
        </div>

        {/* Services */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Services</div>
          {SERVICES.slice(0,5).map(s => (
            <div key={s.title} style={{ color:'var(--muted)', fontSize:14, marginBottom:10 }}>{s.title}</div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Contact</div>
          {[`📍 Delhi, India`, `📞 ${content?.phone || '+91 76248 03460'}`, '📧 info@aquaviaworld.com', `🚚 ${content?.deliveryNote || 'Serving Delhi NCR'}`].map(item => (
            <div key={item} style={{ color:'var(--muted)', fontSize:13, marginBottom:10, lineHeight:1.5 }}>{item}</div>
          ))}
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <span style={{ color:'var(--muted)', fontSize:13 }}>© 2026 AquaVia. All rights reserved.</span>
        <span style={{ color:'var(--muted)', fontSize:13 }}>Made with 💧 in India</span>
      </div>
    </footer>
  )
}

// ─── WhatsApp Button ──────────────────────────────────────────────────────────
function WhatsAppButton({ content }) {
  const msg = encodeURIComponent(content?.whatsappMsg || "Hi! I'm interested in customized water bottles for my business.")
  const handleClick = () => window.open(`https://wa.me/917624803460?text=${msg}`)
  return (
    <>
      {/* Ripple ring */}
      <div style={{
        position:'fixed', bottom:28, right:28, zIndex:9998,
        width:58, height:58, borderRadius:'50%',
        border:'2px solid rgba(37,211,102,0.5)',
        animation:'ripple 2s ease-out infinite', pointerEvents:'none'
      }} />
      {/* Button */}
      <button
        onClick={handleClick}
        // window.open() means there is no href for the delegated listener to
        // sniff, so the intent is declared explicitly.
        data-evt="contact_intent_clicked"
        data-evt-props={JSON.stringify({ channel: 'whatsapp', placement: 'floating' })}
        aria-label="Contact via WhatsApp"
        style={{
          position:'fixed', bottom:28, right:28, zIndex:9999,
          width:58, height:58, borderRadius:'50%',
          background:'linear-gradient(135deg, #25d366, #1aad52)',
          boxShadow:'0 6px 24px rgba(37,211,102,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', animation:'waBounce 2.5s ease-in-out infinite',
          border:'none', padding:0
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
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
    title: content.seoTitle,
    description: content.seoDescription,
    keywords: content.seoKeywords,
    canonical: 'https://himalayan-sip.vercel.app/',
    schema: HS_SCHEMA,
  })

  useEffect(() => {
    document.documentElement.lang = 'en-IN'
    const setLink = (rel, href, extra) => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const l = document.createElement('link'); l.rel = rel; l.href = href
      if (extra) Object.assign(l, extra)
      document.head.appendChild(l)
    }
    setLink('preconnect', 'https://fonts.googleapis.com')
    setLink('preconnect', 'https://fonts.gstatic.com', { crossOrigin: 'anonymous' })
    setLink('dns-prefetch', 'https://ipapi.co')
    setLink('alternate', 'https://himalayan-sip.vercel.app/', { hreflang: 'en-in' })
    setLink('alternate', 'https://himalayan-sip.vercel.app/', { hreflang: 'x-default' })
  }, [])

  const { ref: customizerRef, visible: customizerVisible } = useLazySection()
  const { ref: testimonialsRef, visible: testimonialsVisible } = useLazySection()

  return (
    <div role="main" style={{ fontFamily:'DM Sans, sans-serif' }}>
      <Navbar />
      {/* This is a single page, so there are no route changes to hang page views
          on. Section views are the stand-in: they are what make "top pages",
          scroll depth, and the bounce definition mean anything here. */}
      <TrackInView event="section_viewed" sectionId="hero">
        <HeroSection geo={geo} content={content} />
      </TrackInView>
      <TrackInView event="section_viewed" sectionId="about"><AboutSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="services"><ServicesSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="how"><HowItWorksSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="journey"><JourneySection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="products"><ProductsSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="pricing"><PricingSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="industries"><IndustriesSection /></TrackInView>
      <div ref={customizerRef}>
        {customizerVisible && (
          <TrackInView event="customizer_opened" sectionId="customizer">
            <CustomizerSection />
          </TrackInView>
        )}
      </div>
      <div ref={testimonialsRef}>
        {testimonialsVisible && (
          <TrackInView event="section_viewed" sectionId="testimonials">
            <TestimonialsSection content={content} />
          </TrackInView>
        )}
      </div>
      <TrackInView event="section_viewed" sectionId="faq"><FAQSection /></TrackInView>
      <ContactSection content={content} />
      <Footer content={content} />
      <WhatsAppButton content={content} />
      <ConsentBanner />
    </div>
  )
}
