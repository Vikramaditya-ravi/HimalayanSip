import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { DELHI_NCR_CITIES, GEO_CONTENT, OG_IMAGE } from './data'

/**
 * True when this document was rendered at build time by scripts/prerender.mjs.
 *
 * The flag is an attribute on #root rather than a global, because it has to be
 * readable during the FIRST client render — before any effect runs — by hooks
 * that decide what to show. Anything a hook reads at that moment must produce
 * the same answer the prerenderer got, or hydration mismatches.
 */
export function isPrerendered() {
  if (typeof document === 'undefined') return false
  return document.getElementById('root')?.dataset.prerendered === 'true'
}

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * React warns that useLayoutEffect does nothing during server rendering, and it
 * is right — but the alternative for the cases below is a visibly wrong first
 * paint. This picks the one that fires before paint where there is a paint to
 * beat, and the one that does not warn where there isn't.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

// ─── Current route ────────────────────────────────────────────────────────────
/**
 * The route being rendered, supplied by PageShell rather than read from the URL.
 *
 * currentPath() in data.js reads window.location and answers '/' when there is
 * no window. That was harmless while every page was client-rendered — the first
 * render happened in a browser, on the right URL. Once pages are prerendered it
 * is a correctness bug in two directions at once: every built page would ship
 * `aria-current="page"` on the Home link (because the build has no location),
 * and the client's first render would then disagree with the served HTML and
 * mismatch.
 *
 * PageShell knows exactly which route it is rendering — it is a required prop —
 * so it publishes it here and the navbar and footer read it from context. The
 * value is the normalised path, so `/pricing.html` and `/pricing` cannot
 * disagree about which nav item is active either.
 */
export const RouteContext = createContext(null)

export function useCurrentPath() {
  const fromContext = useContext(RouteContext)
  if (fromContext) return fromContext
  // Outside a shell (tests rendering a bare section) fall back to the URL.
  return typeof window === 'undefined'
    ? '/'
    : window.location.pathname.replace(/\.html$/, '').replace(/^$|^\/index$/, '/')
}

// ─── Custom Hook: useReveal ───────────────────────────────────────────────────
export function useReveal(threshold = 0.1) {
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
// Writes the same values the route's static HTML already carries. It queries by
// selector and mutates in place — including the JSON-LD block keyed by
// id="hs-schema" — so nothing is ever duplicated in the live DOM.
export function useSEO({ title, description, keywords, canonical, schema }) {
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
    setMeta('property', 'og:image', OG_IMAGE)
    setMeta('property', 'og:site_name', 'AquaVia')
    setMeta('property', 'og:locale', 'en_IN')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', OG_IMAGE)
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
export function useGeoTarget() {
  const [geoData, setGeoData] = useState({ city: null, region: null, country: null, detected: false, loading: true })
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setGeoData({ city: d.city, region: d.region, country: d.country_name, countryCode: d.country_code, detected: true, loading: false }))
      .catch(() => setGeoData({ city: null, region: null, country: 'India', detected: false, loading: false }))
  }, [])
  return geoData
}

/**
 * Which copy variant to render.
 *
 * Before the ipapi.co lookup resolves — which includes the build-time render and
 * every client's first render — this answers 'delhi-ncr' rather than 'default'.
 *
 * That is a deliberate reversal. The undetected branch used to say "Pan-India
 * expansion coming soon", so the hero sentence baked into every prerendered page
 * (and read by every crawler that never runs the lookup) advertised a market
 * AquaVia does not serve, on a site whose entire targeting is Delhi NCR. The
 * regional copy is both the truthful default and the indexable one.
 *
 * A visitor who turns out to be elsewhere still gets the pan-India line when the
 * lookup lands. Server and first client render agree either way, which is what
 * hydration requires.
 */
export function useGeoContent(geo) {
  return useMemo(() => {
    if (!geo.detected || !geo.city) return GEO_CONTENT['delhi-ncr']
    const key = geo.city.toLowerCase()
    return DELHI_NCR_CITIES.has(key) ? GEO_CONTENT['delhi-ncr'] : GEO_CONTENT['default']
  }, [geo.detected, geo.city])
}

/**
 * Geo-personalised copy, shared across a page.
 *
 * On the single-page site this was a `content` prop drilled from App() into the
 * five components that need it. Those components now live on four different
 * routes with no common React parent, so PageShell owns the lookup and publishes
 * it here instead. Defaults to the non-regional copy so a component rendered
 * outside a shell (tests, Storybook) still has strings.
 */
export const GeoContext = createContext({ geo: { loading: false, detected: false }, content: GEO_CONTENT['delhi-ncr'] })

export function useGeo() {
  return useContext(GeoContext)
}

// ─── useLazySection ───────────────────────────────────────────────────────────
/**
 * Defer a section until it is nearly on screen.
 *
 * `anchorId` is optional and exists for the home page, where the heavy sections
 * are lazy but are also deep-link targets. PageShell resolves the URL fragment
 * in an effect after commit; a section still waiting on its observer is not in
 * the DOM at that moment, so /#journey would find nothing and never scroll.
 * Seeding `visible` from the hash mounts it synchronously on the first render
 * instead, before that effect runs.
 *
 * Guarded for `window` because the pages are rendered with renderToString in
 * src/analytics/__tests__/render.test.tsx, which runs in Vitest's node
 * environment where no DOM global exists.
 *
 * ── Prerendering ──
 * Server-side the gate is OFF: everything renders. Four of the richest sections
 * on the site sit behind this hook (Journey, Customizer, Testimonials, Contact),
 * and a build-time render that respected the observer would emit empty divs
 * where the most citable content on the home page should be — the exact problem
 * prerendering exists to solve.
 *
 * On the client the same answer has to come back on the FIRST render or
 * hydration mismatches, so a prerendered document also starts visible. After
 * that the observer is redundant and the hook is effectively a no-op, which is
 * fine: it never saved bundle bytes. There is no React.lazy and no dynamic
 * import() anywhere in src/, so these chunks always shipped — the gate only
 * ever deferred render cost, and only on the one page that renders all twelve
 * sections.
 */
export function useLazySection(anchorId) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    if (isPrerendered()) return true
    return !!anchorId && decodeURIComponent(window.location.hash.slice(1)) === anchorId
  })
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { rootMargin: '200px' })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}
