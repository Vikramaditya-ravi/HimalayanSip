import { useEffect, useRef } from 'react'
import { track } from './tracker'

/**
 * Declarative view tracking.
 *
 * Lets a section emit an event without every component growing its own effect
 * and its own IntersectionObserver. Wrap and forget.
 */

const THRESHOLD = 0.4

/**
 * Emits `event` once, the first time the wrapped content is ~40% visible.
 *
 * Fires once per mount by design: a visitor scrolling up and down past the
 * pricing section three times is one person looking at pricing, not three.
 */
export function TrackInView({ event, sectionId, productSku, industrySlug, props, children, style }) {
  const ref = useRef(null)
  const fired = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || fired.current) continue
          fired.current = true
          track(event, { sectionId, productSku, industrySlug, props })
          observer.disconnect()
        }
      },
      { threshold: THRESHOLD },
    )

    observer.observe(el)
    return () => observer.disconnect()
    // `fired` guards against React Strict Mode double-invoking this effect in dev.
  }, [event, sectionId, productSku, industrySlug])

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  )
}

/**
 * Emits `event` once on mount, with no visibility condition.
 * Use for things that are true as soon as the component exists.
 */
export function TrackView({ event, sectionId, productSku, props }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    track(event, { sectionId, productSku, props })
  }, [event, sectionId, productSku])

  return null
}
