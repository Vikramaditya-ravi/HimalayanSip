import { useCallback, useEffect, useState } from 'react'
import { useMetric } from './api'
import { AcquisitionTab, ContactsTab, FunnelTab, LeadsTab, LiveTab, OverviewTab, ProductsTab, SearchTab } from './tabs.jsx'

const TABS = [
  { id: 'overview', label: 'Overview', Component: OverviewTab },
  { id: 'acquisition', label: 'Acquisition', Component: AcquisitionTab },
  { id: 'products', label: 'Products', Component: ProductsTab },
  { id: 'funnel', label: 'Funnel', Component: FunnelTab },
  { id: 'search', label: 'Search', Component: SearchTab },
  { id: 'leads', label: 'Leads', Component: LeadsTab },
  { id: 'contacts', label: 'Contacts', Component: ContactsTab },
  { id: 'live', label: 'Live', Component: LiveTab },
]

const RANGES = [7, 30, 90, 365]

function readHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const tab = params.get('tab')
  const days = Number(params.get('days'))
  return {
    tab: TABS.some((t) => t.id === tab) ? tab : 'overview',
    days: RANGES.includes(days) ? days : 30,
  }
}

function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        onSuccess()
        return
      }
      const body = await res.json().catch(() => ({}))
      setError(
        body.error === 'server_misconfigured'
          ? 'Server is missing ADMIN_SESSION_SECRET — sessions cannot be issued.'
          : 'Incorrect password.',
      )
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wrap">
      <form className="login card" onSubmit={submit}>
        <h1 style={{ fontSize: 16, margin: '0 0 4px' }}>AquaVia Analytics</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px' }}>Admin access required.</p>
        <label className="sr" htmlFor="pw">Password</label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        <button type="submit" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
        {error && <div className="err">{error}</div>}
      </form>
    </div>
  )
}

/**
 * Surfaced whenever a metric came from rollups.
 *
 * Rollup uniques are sums of daily uniques, so anyone who returned on another day
 * is counted twice. That makes them an upper bound. An estimate must never be
 * allowed to look like a fact.
 */
function ApproximateBanner({ days, retentionDays }) {
  return (
    <div className="banner warn">
      <span aria-hidden="true">≈</span>
      <div>
        <strong>Approximate data.</strong> This range ({days} days) reaches past the {retentionDays}-day
        raw-event window, so figures come from daily rollups. Unique visitor and session counts are
        sums of daily uniques and are therefore <strong>upper bounds</strong>, not exact.
      </div>
    </div>
  )
}

/**
 * A stalled rollup and a genuinely quiet fortnight produce identical dashboards.
 * The absence of infrastructure events is the alarm, so it gets said out loud.
 */
function HealthBanner({ health }) {
  if (!health?.rollupStale) return null
  return (
    <div className="banner crit">
      <span aria-hidden="true">⚠</span>
      <div>
        <strong>Rollups are not running.</strong>{' '}
        {health.lastRollupAt
          ? `Last completed ${new Date(health.lastRollupAt).toLocaleString('en-IN')}.`
          : 'No rollup has ever completed.'}{' '}
        Long-range numbers will be wrong or empty until the cron job runs.
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [auth, setAuth] = useState('checking')
  const [{ tab, days }, setView] = useState(readHash)

  useEffect(() => {
    fetch('/api/admin/login', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((j) => setAuth(j.authenticated ? 'in' : 'out'))
      .catch(() => setAuth('out'))
  }, [])

  useEffect(() => {
    const onHash = () => setView(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (next) => {
    const merged = { tab, days, ...next }
    window.location.hash = `tab=${merged.tab}&days=${merged.days}`
    setView(merged)
  }

  const onUnauthorized = useCallback(() => setAuth('out'), [])

  if (auth === 'checking') return <div className="wrap"><div className="empty">Loading…</div></div>
  if (auth === 'out') return <Login onSuccess={() => setAuth('in')} />

  return <Shell tab={tab} days={days} navigate={navigate} onUnauthorized={onUnauthorized} />
}

function Shell({ tab, days, navigate, onUnauthorized }) {
  const health = useMetric('health', null, { refreshMs: 300_000, onUnauthorized })
  const overview = useMetric('overview', days, { onUnauthorized })
  const active = TABS.find((t) => t.id === tab) ?? TABS[0]
  const { Component } = active

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE', credentials: 'same-origin' })
    window.location.reload()
  }

  return (
    <div className="wrap">
      <header className="head">
        <h1>AquaVia Analytics</h1>
        <div className="spacer" />
        {tab !== 'live' && (
          <div className="ranges" role="group" aria-label="Date range">
            {RANGES.map((d) => (
              <button
                key={d}
                type="button"
                className="range"
                aria-pressed={d === days}
                onClick={() => navigate({ days: d })}
              >
                {d}d
              </button>
            ))}
          </div>
        )}
        <button type="button" className="range" onClick={logout}>Sign out</button>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            className="tab"
            aria-selected={t.id === tab}
            onClick={() => navigate({ tab: t.id })}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 16 }}>
        <HealthBanner health={health.data} />
        {overview.rolledUp && <ApproximateBanner days={days} retentionDays={health.data?.retentionDays ?? 90} />}
        <Component days={days} onUnauthorized={onUnauthorized} />
      </div>
    </div>
  )
}
