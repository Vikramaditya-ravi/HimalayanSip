import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { DELHI_NCR_CITIES, GEO_CONTENT, OG_IMAGE } from './data'

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

export function useGeoContent(geo) {
  return useMemo(() => {
    if (!geo.detected || !geo.city) return GEO_CONTENT['default']
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
export const GeoContext = createContext({ geo: { loading: false, detected: false }, content: GEO_CONTENT['default'] })

export function useGeo() {
  return useContext(GeoContext)
}

// ─── useLazySection ───────────────────────────────────────────────────────────
export function useLazySection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { rootMargin: '200px' })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}
