import { useCallback, useEffect, useState } from 'react'
import { useMetric } from './api'
import { BarChart, BarList, Card, Empty, FunnelChart, StatTile, Table, fmt, inr, pct } from './viz.jsx'

/*
 * Dashboard tabs. Every number here comes from /api/analytics/*, which reads the
 * event stream and nothing else.
 */

function Loading() {
  return <div className="empty">Loading…</div>
}

// ---------------------------------------------------------------------------
// Live — built first. If events aren't landing here, nothing else is real.
// ---------------------------------------------------------------------------

const ACTOR_BADGE = { admin: 'muted', system: 'muted', visitor: 'good', customer: 'good' }

export function LiveTab({ onUnauthorized }) {
  const live = useMetric('live', null, { refreshMs: 10_000, onUnauthorized })
  const recent = useMetric('recent', null, { refreshMs: 5_000, onUnauthorized })

  const online = live.data?.online ?? 0

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <span className="pill">
          <i className={`dot${online ? '' : ' idle'}`} aria-hidden="true" />
          <strong>{fmt.format(online)}</strong> online now
          <span style={{ color: 'var(--muted)' }}>· last 5 min</span>
        </span>
      </div>

      <Card
        title="Raw event feed"
        sub="Newest first, refreshing every 5s. This is the ground truth — if an event isn't here, it wasn't recorded."
      >
        {recent.loading && !recent.data ? (
          <Loading />
        ) : (
          <Table
            empty="No events recorded yet. Load the site in another tab and scroll."
            columns={[
              {
                key: 'occurredAt',
                label: 'Time',
                render: (r) => (
                  <span className="mono">{new Date(r.occurredAt).toLocaleTimeString('en-IN', { hour12: false })}</span>
                ),
              },
              { key: 'name', label: 'Event', render: (r) => <strong style={{ color: 'var(--ink)' }}>{r.name}</strong> },
              {
                key: 'actor',
                label: 'Actor',
                render: (r) => <span className={`badge ${ACTOR_BADGE[r.actor] || 'muted'}`}>{r.actor}</span>,
              },
              { key: 'visitorShort', label: 'Visitor', render: (r) => <span className="mono">{r.visitorShort || '—'}</span> },
              { key: 'pageUrl', label: 'Page', render: (r) => <span className="mono">{r.pageUrl || '—'}</span> },
              {
                key: 'subject',
                label: 'Subject',
                render: (r) => r.productSku || r.queryText || r.sectionId || (r.leadId ? `lead ${r.leadId.slice(0, 8)}` : '—'),
              },
              { key: 'device', label: 'Device', render: (r) => `${r.device || '?'} · ${r.browser || '?'}` },
              { key: 'geo', label: 'Geo', render: (r) => [r.city, r.country].filter(Boolean).join(', ') || '—' },
              {
                key: 'utmSource',
                label: 'Source',
                render: (r) => r.utmSource || r.referrer || <span style={{ color: 'var(--muted)' }}>direct</span>,
              },
              {
                key: 'props',
                label: 'Props',
                render: (r) => (r.props ? <span className="mono">{JSON.stringify(r.props)}</span> : '—'),
              },
            ]}
            rows={recent.data ?? []}
          />
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

const SEVERITY_BADGE = { critical: 'critical', warning: 'critical', info: 'muted' }

/**
 * Insight cards. The numbers here came from SQL detectors; the prose is a
 * narration of those numbers, never a source of new ones — so the evidence is
 * shown alongside the text and can always be checked against it.
 */
function InsightsCard({ onUnauthorized }) {
  const insights = useMetric('insights', null, { onUnauthorized })
  const rows = insights.data ?? []

  return (
    <Card
      title="What changed"
      sub="Findings from SQL detectors, ranked and written up. Every figure below was computed by a query, not by the narrator."
    >
      {insights.loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>Nothing notable yet — insights are generated nightly.</Empty>
      ) : (
        rows.map((r) => (
          <div
            key={r.detector}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className={`badge ${SEVERITY_BADGE[r.severity] || 'muted'}`}>{r.severity}</span>
              <strong style={{ color: 'var(--ink)' }}>{r.title}</strong>
            </div>
            <div style={{ color: 'var(--ink-2)' }}>{r.narrative}</div>
            <div className="mono" style={{ color: 'var(--muted)', marginTop: 6, fontSize: 11 }}>
              {JSON.stringify(r.metric)}
            </div>
          </div>
        ))
      )}
    </Card>
  )
}

export function OverviewTab({ days, onUnauthorized }) {
  const overview = useMetric('overview', days, { onUnauthorized })
  const traffic = useMetric('traffic', days, { onUnauthorized })
  const pages = useMetric('pages', days, { onUnauthorized })
  const devices = useMetric('devices', days, { onUnauthorized })
  const ret = useMetric('retention', days, { onUnauthorized })

  const o = overview.data

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid cols-4">
        <StatTile label="Visitors" value={o ? fmt.format(o.visitors) : '—'} note="unique, bots excluded" />
        <StatTile label="Sessions" value={o ? fmt.format(o.sessions) : '—'} note="30-min rolling window" />
        <StatTile label="Enquiries" value={o ? fmt.format(o.conversions) : '—'} note="server-confirmed" />
        <StatTile
          label="Bounce rate"
          value={o ? pct(o.bounceRate) : '—'}
          note="≤1 page view, no engagement"
        />
      </div>

      <InsightsCard onUnauthorized={onUnauthorized} />

      <div className="grid cols-2">
        {/* Two charts, not one with two axes: visitors and conversions differ by
            orders of magnitude, and a second y-axis would let the scales decide
            which line looks like it's winning. */}
        <Card title="Traffic" sub="Visitors and sessions per day">
          {traffic.loading ? (
            <Loading />
          ) : (
            <BarChart
              data={traffic.data ?? []}
              series={[
                { key: 'visitors', label: 'Visitors', color: 'var(--s1)' },
                { key: 'sessions', label: 'Sessions', color: 'var(--s2)' },
              ]}
            />
          )}
        </Card>
        <Card title="Enquiries" sub="Conversions per day">
          {traffic.loading ? (
            <Loading />
          ) : (
            <BarChart
              data={traffic.data ?? []}
              series={[{ key: 'conversions', label: 'Enquiries', color: 'var(--s3)' }]}
            />
          )}
        </Card>
      </div>

      <div className="grid cols-3">
        <Card title="Top sections" sub="Sessions reaching each part of the page">
          {pages.loading ? <Loading /> : <BarList rows={pages.data ?? []} valueKey="sessions" labelKey="value" />}
        </Card>
        <Card title="Device split">
          {devices.loading ? (
            <Loading />
          ) : (
            <BarList rows={devices.data ?? []} valueKey="sessions" labelKey="value" color="var(--s2)" />
          )}
        </Card>
        <Card title="Retention">
          {ret.loading || !ret.data ? (
            <Loading />
          ) : (
            <div>
              <div className="tile-label">Repeat visitors</div>
              <div className="tile-value" style={{ fontSize: 24 }}>{pct(ret.data.repeatRate)}</div>
              <div className="tile-note" style={{ marginBottom: 16 }}>
                {fmt.format(ret.data.visitors)} visitors, more than one session
              </div>
              <div className="tile-label">Median session length</div>
              <div className="tile-value" style={{ fontSize: 24 }}>
                {ret.data.medianSessionMinutes == null ? '—' : `${ret.data.medianSessionMinutes.toFixed(1)}m`}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Acquisition
// ---------------------------------------------------------------------------

export function AcquisitionTab({ days, onUnauthorized }) {
  const sources = useMetric('sources', days, { onUnauthorized })
  const countries = useMetric('countries', days, { onUnauthorized })
  const cities = useMetric('cities', days, { onUnauthorized })
  const browsers = useMetric('browsers', days, { onUnauthorized })

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card
        title="Revenue by source"
        sub="First-touch attribution — a visitor who arrives from an ad stays credited to that ad, even if they return via Google later."
      >
        {sources.loading ? (
          <Loading />
        ) : (
          <Table
            empty="No attributed traffic yet."
            columns={[
              { key: 'source', label: 'Source' },
              { key: 'campaign', label: 'Campaign', render: (r) => (r.campaign === '(none)' ? <span style={{ color: 'var(--muted)' }}>—</span> : r.campaign) },
              { key: 'sessions', label: 'Sessions', num: true, render: (r) => fmt.format(r.sessions) },
              { key: 'conversions', label: 'Enquiries', num: true, render: (r) => fmt.format(r.conversions) },
              {
                key: 'cvr',
                label: 'CVR',
                num: true,
                render: (r) => (r.sessions ? pct(r.conversions / r.sessions) : '—'),
              },
              { key: 'revenue', label: 'Revenue', num: true, render: (r) => inr(r.revenue) },
              { key: 'rps', label: 'Rev / session', num: true, render: (r) => inr(r.revenuePerSession) },
            ]}
            rows={sources.data ?? []}
          />
        )}
      </Card>

      <div className="grid cols-3">
        <Card title="Countries">
          {countries.loading ? <Loading /> : <BarList rows={countries.data ?? []} valueKey="sessions" labelKey="value" />}
        </Card>
        <Card title="Cities">
          {cities.loading ? <Loading /> : <BarList rows={cities.data ?? []} valueKey="sessions" labelKey="value" color="var(--s2)" />}
        </Card>
        <Card title="Browsers">
          {browsers.loading ? <Loading /> : <BarList rows={browsers.data ?? []} valueKey="sessions" labelKey="value" color="var(--s4)" />}
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function ProductsTab({ days, onUnauthorized }) {
  const products = useMetric('products', days, { onUnauthorized })
  const depth = useMetric('depth', days, { onUnauthorized })

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card title="Bottle sizes" sub="Views vs 'Order Now' clicks">
        {products.loading ? (
          <Loading />
        ) : (
          <Table
            empty="No product views recorded yet."
            columns={[
              { key: 'productSku', label: 'Size' },
              { key: 'views', label: 'Views', num: true, render: (r) => fmt.format(r.views) },
              { key: 'ctaClicks', label: 'CTA clicks', num: true, render: (r) => fmt.format(r.ctaClicks) },
              { key: 'ctr', label: 'CTR', num: true, render: (r) => pct(r.ctr) },
              { key: 'sessions', label: 'Sessions', num: true, render: (r) => fmt.format(r.sessions) },
            ]}
            rows={products.data ?? []}
          />
        )}
      </Card>

      <Card
        title="Engagement depth vs conversion"
        sub="Product and customizer interactions before enquiring. Answers whether the customizer actually sells bottles."
      >
        {depth.loading ? (
          <Loading />
        ) : (
          <Table
            columns={[
              { key: 'bucket', label: 'Interactions' },
              { key: 'sessions', label: 'Sessions', num: true, render: (r) => fmt.format(r.sessions) },
              { key: 'conversions', label: 'Enquiries', num: true, render: (r) => fmt.format(r.conversions) },
              { key: 'rate', label: 'Conversion rate', num: true, render: (r) => pct(r.conversionRate) },
            ]}
            rows={depth.data ?? []}
          />
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Funnel
// ---------------------------------------------------------------------------

const STEP_LABELS = {
  page_viewed: '1. Landed',
  contact_form_viewed: '2. Saw the form',
  contact_form_started: '3. Started filling',
  contact_form_field_completed: '4. Completed a field',
  lead_submitted: '5. Submitted (server-confirmed)',
}

export function FunnelTab({ days, onUnauthorized }) {
  const funnel = useMetric('funnel', days, { onUnauthorized })
  const intents = useMetric('intents', days, { onUnauthorized })
  const velocity = useMetric('velocity', days, { onUnauthorized })

  const v = velocity.data

  return (
    <div className="grid" style={{ gap: 16 }}>
      <Card title="Conversion funnel" sub="Counted in sessions, not events — one indecisive visitor is one prospect.">
        {funnel.loading ? <Loading /> : <FunnelChart steps={funnel.data ?? []} labels={STEP_LABELS} />}
      </Card>

      <div className="grid cols-2">
        <Card title="Contact intent" sub="How people choose to reach out">
          {intents.loading ? (
            <Loading />
          ) : (
            <BarList rows={intents.data ?? []} valueKey="clicks" labelKey="channel" color="var(--s3)" />
          )}
        </Card>
        <Card title="Velocity" sub="Median time from first touch">
          {velocity.loading || !v ? (
            <Loading />
          ) : (
            <div>
              <div className="tile-label">To enquiry</div>
              <div className="tile-value" style={{ fontSize: 24 }}>
                {v.medianHoursToConversion == null ? '—' : `${v.medianHoursToConversion.toFixed(1)}h`}
              </div>
              <div className="tile-note" style={{ marginBottom: 16 }}>Median, not mean — one stale lead shouldn't skew it</div>
              <div className="tile-label">To won deal</div>
              <div className="tile-value" style={{ fontSize: 24 }}>
                {v.medianHoursToWin == null ? '—' : `${(v.medianHoursToWin / 24).toFixed(1)}d`}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Leads — the lifecycle surface. Marking a deal won here is what turns the
// acquisition tab's revenue column from zeros into an actual number.
// ---------------------------------------------------------------------------

const STATUSES = ['new', 'contacted', 'on_hold', 'won', 'lost', 'dispatched']
const STATUS_BADGE = { won: 'good', dispatched: 'good', lost: 'critical' }

export function LeadsTab({ onUnauthorized }) {
  const [leads, setLeads] = useState(null)
  const [busy, setBusy] = useState(null)

  const load = () =>
    fetch('/api/admin/leads', { credentials: 'same-origin' })
      .then((r) => {
        if (r.status === 401) { onUnauthorized?.(); return { data: [] } }
        return r.json()
      })
      .then((j) => setLeads(j.data ?? []))
      .catch(() => setLeads([]))

  useEffect(() => { load() }, [])

  const update = async (lead, status, value) => {
    setBusy(lead.id)
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: lead.id, status, value }),
      })
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (!leads) return <Loading />

  return (
    <Card
      title="Leads"
      sub="Marking a deal won emits a lead_won event attributed to the buyer's visitor id — that is what makes revenue-by-source real."
    >
      <Table
        empty="No enquiries yet."
        columns={[
          { key: 'createdAt', label: 'When', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
          {
            key: 'name',
            label: 'Contact',
            render: (r) => (
              <div>
                <div style={{ color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{r.company || r.email}</div>
              </div>
            ),
          },
          { key: 'quantity', label: 'Qty', render: (r) => r.quantity || '—' },
          {
            key: 'firstSource',
            label: 'First touch',
            render: (r) => (
              <span>
                {r.firstSource || 'direct'}
                {r.firstCampaign && <span style={{ color: 'var(--muted)' }}> · {r.firstCampaign}</span>}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (r) => (
              <select
                value={r.status}
                disabled={busy === r.id}
                onChange={(e) => update(r, e.target.value, r.value)}
                style={{
                  background: 'var(--surface-2)', color: 'var(--ink)',
                  border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', font: 'inherit',
                }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            ),
          },
          {
            key: 'value',
            label: 'Deal value',
            num: true,
            render: (r) => (
              <input
                type="number"
                min="0"
                defaultValue={r.value ?? ''}
                placeholder="—"
                disabled={busy === r.id}
                onBlur={(e) => {
                  const next = e.target.value === '' ? null : Number(e.target.value)
                  if (next !== r.value) update(r, r.status, next)
                }}
                style={{
                  width: 110, textAlign: 'right', background: 'var(--surface-2)', color: 'var(--ink)',
                  border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', font: 'inherit',
                }}
              />
            ),
          },
          {
            key: 'badge',
            label: '',
            render: (r) =>
              STATUS_BADGE[r.status] ? (
                <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span>
              ) : null,
          },
        ]}
        rows={leads}
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function SearchTab({ days, onUnauthorized }) {
  const search = useMetric('search', days, { onUnauthorized })
  const rows = search.data ?? []
  const zeroCount = rows.filter((r) => r.zeroResults > 0).length

  return (
    <Card
      title="Site search"
      sub="Queries that returned nothing are highlighted. That list is a product roadmap written by your buyers."
    >
      {zeroCount > 0 && (
        <div className="banner crit">
          <span aria-hidden="true">⚠</span>
          <div>
            <strong>{zeroCount} {zeroCount === 1 ? 'query' : 'queries'} returned no results.</strong>{' '}
            Someone came looking for these and left empty-handed.
          </div>
        </div>
      )}
      {search.loading ? (
        <Loading />
      ) : (
        <Table
          empty="No searches yet."
          rowClass={(r) => (r.zeroResults > 0 ? 'zero' : undefined)}
          columns={[
            { key: 'query', label: 'Query' },
            {
              key: 'status',
              label: 'Result',
              // Status carries an explicit label, never color alone.
              render: (r) =>
                r.zeroResults > 0 ? (
                  <span className="badge critical">no results</span>
                ) : (
                  <span className="badge good">found</span>
                ),
            },
            { key: 'searches', label: 'Searches', num: true, render: (r) => fmt.format(r.searches) },
            { key: 'zeroResults', label: 'Zero-result', num: true, render: (r) => fmt.format(r.zeroResults) },
            { key: 'clicks', label: 'Clicks', num: true, render: (r) => fmt.format(r.clicks) },
          ]}
          rows={rows}
        />
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Contacts — a plain business directory of customers and suppliers. Full CRUD.
// Deliberately outside analytics: this reads/writes the Contact table directly
// and emits no events.
// ---------------------------------------------------------------------------

const CONTACT_TYPES = [
  { id: 'customer', label: 'Customers' },
  { id: 'bottle_supplier', label: 'Bottle suppliers' },
  { id: 'water_plant', label: 'Water plant' },
]

const CONTACT_STATUS_BADGE = { active: 'good', inactive: 'muted' }

function blankContact(type) {
  return {
    type,
    name: '', company: '', contactPerson: '', phone: '', email: '',
    location: '', address: '', supplyQuantity: '', unit: '', rate: '',
    notes: '', status: 'active',
  }
}

export function ContactsTab({ onUnauthorized }) {
  const [contacts, setContacts] = useState(null)
  const [filter, setFilter] = useState('customer')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(
    (type) =>
      fetch(`/api/admin/contacts?type=${type}`, { credentials: 'same-origin' })
        .then((r) => {
          if (r.status === 401) { onUnauthorized?.(); return { data: [] } }
          return r.json()
        })
        .then((j) => setContacts(j.data ?? []))
        .catch(() => setContacts([])),
    [onUnauthorized],
  )

  useEffect(() => { setContacts(null); reload(filter) }, [filter, reload])

  const save = async () => {
    if (!editing.name.trim()) return
    setBusy(true)
    try {
      const isNew = !editing.id
      await fetch('/api/admin/contacts', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(editing),
      })
      const savedType = editing.type
      setEditing(null)
      // Surface the saved record: if its type differs from the current filter,
      // switching the filter reloads via the effect; otherwise reload in place.
      if (savedType !== filter) setFilter(savedType)
      else await reload(filter)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (contact) => {
    if (!window.confirm(`Delete ${contact.name}? This cannot be undone.`)) return
    setBusy(true)
    try {
      await fetch('/api/admin/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: contact.id }),
      })
      await reload(filter)
    } finally {
      setBusy(false)
    }
  }

  const field = (key, label, opts = {}) => {
    const set = (v) => setEditing({ ...editing, [key]: v })
    return (
      <label className={`field${opts.full ? ' full' : ''}`}>
        <span>{label}</span>
        {opts.textarea ? (
          <textarea value={editing[key] ?? ''} rows={opts.rows ?? 2} onChange={(e) => set(e.target.value)} />
        ) : opts.options ? (
          <select value={editing[key] ?? ''} onChange={(e) => set(e.target.value)}>
            {opts.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input
            type={opts.type ?? 'text'}
            value={editing[key] ?? ''}
            placeholder={opts.placeholder}
            onChange={(e) => set(e.target.value)}
          />
        )}
      </label>
    )
  }

  const activeType = CONTACT_TYPES.find((t) => t.id === filter)

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ranges" role="group" aria-label="Contact type">
          {CONTACT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="range"
              aria-pressed={t.id === filter}
              onClick={() => { setEditing(null); setFilter(t.id) }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn" onClick={() => setEditing(blankContact(filter))}>
          + Add contact
        </button>
      </div>

      {editing && (
        <Card title={editing.id ? 'Edit contact' : 'Add contact'}>
          <div className="contact-form">
            <div className="fields">
              {field('name', 'Name *')}
              {field('company', 'Company')}
              {field('contactPerson', 'Contact person')}
              {field('type', 'Type', { options: CONTACT_TYPES.map((t) => ({ value: t.id, label: t.label })) })}
              {field('phone', 'Phone', { type: 'tel' })}
              {field('email', 'Email', { type: 'email' })}
              {field('location', 'Location', { placeholder: 'City / area' })}
              {field('status', 'Status', {
                options: [{ value: 'active', label: 'active' }, { value: 'inactive', label: 'inactive' }],
              })}
              {field('supplyQuantity', 'Supply quantity', { placeholder: 'e.g. 500' })}
              {field('unit', 'Unit', { placeholder: 'e.g. bottles/week' })}
              {field('rate', 'Rate (₹ per unit)', { type: 'number' })}
              {field('address', 'Address', { textarea: true, full: true })}
              {field('notes', 'Notes', { textarea: true, full: true })}
            </div>
            <div className="form-actions">
              <button type="button" className="btn" disabled={busy || !editing.name.trim()} onClick={save}>
                {busy ? 'Saving…' : editing.id ? 'Save changes' : 'Add contact'}
              </button>
              <button type="button" className="range" disabled={busy} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card
        title={activeType?.label}
        sub="Add, edit, or remove records. This directory is separate from analytics — nothing here is tracked."
      >
        {contacts === null ? (
          <Loading />
        ) : (
          <Table
            empty="No contacts yet. Use “Add contact” to create one."
            columns={[
              {
                key: 'name',
                label: 'Name',
                render: (r) => (
                  <div>
                    <div style={{ color: 'var(--ink)' }}>{r.name}</div>
                    {(r.company || r.contactPerson) && (
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {[r.company, r.contactPerson].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                ),
              },
              { key: 'location', label: 'Location', render: (r) => r.location || '—' },
              {
                key: 'supplyQuantity',
                label: 'Qty',
                render: (r) => (r.supplyQuantity ? `${r.supplyQuantity}${r.unit ? ` ${r.unit}` : ''}` : '—'),
              },
              { key: 'rate', label: 'Rate', num: true, render: (r) => (r.rate == null ? '—' : inr(r.rate)) },
              {
                key: 'contact',
                label: 'Phone / Email',
                render: (r) => (
                  <div>
                    <div>{r.phone || '—'}</div>
                    {r.email && <div style={{ color: 'var(--muted)', fontSize: 12 }}>{r.email}</div>}
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <span className={`badge ${CONTACT_STATUS_BADGE[r.status] || 'muted'}`}>{r.status}</span>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                    <button type="button" className="range" disabled={busy} onClick={() => setEditing({ ...r, rate: r.rate ?? '' })}>
                      Edit
                    </button>
                    <button type="button" className="btn-danger" disabled={busy} onClick={() => remove(r)}>
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            rows={contacts}
          />
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AI crawlers
//
// The one tab on this dashboard that is not about people.
//
// Every other metric here filters bots out — deliberately, so a crawler sweep
// never inflates a visitor count. But the whole point of the generative-search
// work is to be read by machines that never execute the tracker, so their visits
// were invisible: GPTBot could crawl the entire site daily and nothing on this
// dashboard would move.
//
// These rows come from `crawler_fetch` events written at the edge (middleware.js
// → api/crawl.ts). The question they answer — "has ChatGPT's crawler actually
// read our pricing page?" — is one almost no business this size can answer.
// ---------------------------------------------------------------------------

/** Agents that matter for being cited in an AI answer, as opposed to ranking. */
const AI_AGENTS = new Set([
  'gptbot', 'claudebot', 'claude-web', 'perplexitybot', 'ccbot', 'applebot',
])

export function CrawlersTab({ days, onUnauthorized }) {
  const agents = useMetric('crawlers', days, { onUnauthorized })
  const pages = useMetric('crawlerPages', days, { onUnauthorized })

  const agentRows = agents.data ?? []
  const pageRows = pages.data ?? []
  const aiHits = agentRows.filter((r) => AI_AGENTS.has(r.agent)).reduce((n, r) => n + r.hits, 0)
  const totalHits = agentRows.reduce((n, r) => n + r.hits, 0)

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid cols-4">
        <StatTile label="AI crawler hits" value={fmt.format(aiHits)} note="GPTBot, ClaudeBot, PerplexityBot, CCBot" />
        <StatTile label="All crawler hits" value={fmt.format(totalHits)} note="including Googlebot and Bingbot" />
        <StatTile label="Distinct agents" value={fmt.format(agentRows.length)} note="named by user-agent" />
      </div>

      <Card
        title="Crawlers seen"
        sub="Recorded at the edge, because crawlers never run the client tracker. Bot rows are excluded from every other metric on this dashboard."
      >
        {agents.loading && !agents.data ? (
          <Loading />
        ) : (
          <Table
            empty="No crawler hits recorded yet. This fills in as search and AI crawlers fetch the site."
            columns={[
              {
                key: 'agent',
                label: 'Agent',
                render: (r) => (
                  <>
                    <strong style={{ color: 'var(--ink)' }}>{r.agent}</strong>{' '}
                    {AI_AGENTS.has(r.agent) && <span className="badge good">AI</span>}
                  </>
                ),
              },
              { key: 'hits', label: 'Fetches', num: true, render: (r) => fmt.format(r.hits) },
              { key: 'pages', label: 'URLs reached', num: true, render: (r) => fmt.format(r.pages) },
              {
                key: 'lastSeen',
                label: 'Last seen',
                render: (r) => (r.lastSeen ? new Date(r.lastSeen).toLocaleString('en-IN', { hour12: false }) : '—'),
              },
            ]}
            rows={agentRows}
          />
        )}
      </Card>

      <Card
        title="Pages crawlers fetched"
        sub="The agents column is the actionable one: a page Googlebot reads and GPTBot has never touched can rank but cannot be cited."
      >
        {pages.loading && !pages.data ? (
          <Loading />
        ) : (
          <Table
            empty="No crawled pages recorded yet."
            columns={[
              { key: 'page', label: 'Page', render: (r) => <span className="mono">{r.page}</span> },
              { key: 'hits', label: 'Fetches', num: true, render: (r) => fmt.format(r.hits) },
              { key: 'agents', label: 'Agents' },
              {
                key: 'lastSeen',
                label: 'Last seen',
                render: (r) => (r.lastSeen ? new Date(r.lastSeen).toLocaleDateString('en-IN') : '—'),
              },
            ]}
            rows={pageRows}
          />
        )}
      </Card>
    </div>
  )
}
