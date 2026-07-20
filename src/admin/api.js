import { useCallback, useEffect, useRef, useState } from 'react'

/** Read API client. Every response carries `rolledUp`; callers must surface it. */
export async function getMetric(metric, days) {
  const qs = days ? `?days=${days}` : ''
  const res = await fetch(`/api/analytics/${metric}${qs}`, { credentials: 'same-origin' })
  if (res.status === 401) throw Object.assign(new Error('unauthorized'), { unauthorized: true })
  if (!res.ok) throw new Error(`${metric} failed (${res.status})`)
  return res.json()
}

/**
 * Fetch one metric.
 *
 * `refreshMs` drives the Live tab. Polling stops while the tab is hidden — a
 * dashboard left open in a background tab would otherwise poll all night and
 * pollute its own numbers.
 */
export function useMetric(metric, days, { refreshMs, onUnauthorized } = {}) {
  const [state, setState] = useState({ loading: true, error: null, data: null, rolledUp: false })
  const alive = useRef(true)

  const load = useCallback(async () => {
    try {
      const json = await getMetric(metric, days)
      if (!alive.current) return
      setState({ loading: false, error: null, data: json.data, rolledUp: json.rolledUp })
    } catch (err) {
      if (!alive.current) return
      if (err.unauthorized) onUnauthorized?.()
      setState({ loading: false, error: err.message, data: null, rolledUp: false })
    }
  }, [metric, days, onUnauthorized])

  useEffect(() => {
    alive.current = true
    setState((s) => ({ ...s, loading: true }))
    load()
    if (!refreshMs) return () => { alive.current = false }

    const tick = () => { if (document.visibilityState === 'visible') load() }
    const id = setInterval(tick, refreshMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      alive.current = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [load, refreshMs])

  return state
}
