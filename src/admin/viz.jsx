import { useMemo, useRef, useState } from 'react'

/*
 * Dependency-free SVG chart primitives.
 *
 * Deliberately no charting library: these are five simple forms, and a chart
 * library would be the largest thing in the bundle by an order of magnitude.
 *
 * Series colors come from the four validated categorical slots defined in
 * admin.html. They are assigned in FIXED ORDER and never cycled — color follows
 * the entity, so a filter that drops a series never repaints the survivors.
 */

export const SERIES = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)']

export const fmt = new Intl.NumberFormat('en-IN')
export const pct = (n) => `${(n * 100).toFixed(1)}%`
export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export function StatTile({ label, value, note }) {
  return (
    <div className="card">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {note && <div className="tile-note">{note}</div>}
    </div>
  )
}

export function Card({ title, sub, children }) {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {sub && <div className="sub">{sub}</div>}
      {children}
    </div>
  )
}

export function Empty({ children = 'No data in this range yet.' }) {
  return <div className="empty">{children}</div>
}

function Legend({ series }) {
  // Always present for >= 2 series, so identity is never carried by color alone.
  if (series.length < 2) return null
  return (
    <div className="legend">
      {series.map((s) => (
        <span key={s.key}>
          <i className="swatch" style={{ background: s.color }} aria-hidden="true" />
          {s.label}
        </span>
      ))}
    </div>
  )
}

/**
 * Multi-series line chart with a crosshair tooltip.
 *
 * One y-axis only, always. Two measures of wildly different scale (visitors vs
 * conversions) get two charts rather than a second axis — a dual-axis chart lets
 * the author decide which line appears to be "winning" by choosing the scales.
 */
export function LineChart({ data, series, height = 200, format = fmt.format }) {
  const [hover, setHover] = useState(null)
  const ref = useRef(null)

  const W = 800
  const H = height
  const pad = { top: 12, right: 16, bottom: 24, left: 44 }

  const { max, points, ticks } = useMemo(() => {
    const values = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))
    const rawMax = Math.max(1, ...values)
    // Round the ceiling up so gridlines land on readable numbers.
    const mag = Math.pow(10, Math.floor(Math.log10(rawMax)))
    const max = Math.ceil(rawMax / mag) * mag
    const innerW = W - pad.left - pad.right
    const innerH = H - pad.top - pad.bottom
    const x = (i) => pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = (v) => pad.top + innerH - (v / max) * innerH
    return {
      max,
      points: series.map((s) => ({
        ...s,
        d: data.map((row, i) => ({ x: x(i), y: y(Number(row[s.key]) || 0), v: Number(row[s.key]) || 0 })),
      })),
      ticks: [0, 0.5, 1].map((f) => ({ v: max * f, y: y(max * f) })),
    }
  }, [data, series, H])

  if (!data.length) return <Empty />

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const rel = ((e.clientX - rect.left) / rect.width) * W
    const innerW = W - pad.left - pad.right
    const i = Math.round(((rel - pad.left) / innerW) * (data.length - 1))
    const idx = Math.max(0, Math.min(data.length - 1, i))
    setHover({ idx, left: ((pad.left + (idx / Math.max(1, data.length - 1)) * innerW) / W) * rect.width })
  }

  const row = hover ? data[hover.idx] : null

  return (
    <div className="chart">
      <Legend series={series} />
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Trend of ${series.map((s) => s.label).join(', ')}`}
      >
        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} stroke="var(--grid)" strokeWidth="1" />
            <text x={pad.left - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
              {format(Math.round(t.v))}
            </text>
          </g>
        ))}

        {hover && (
          <line
            x1={points[0].d[hover.idx].x} x2={points[0].d[hover.idx].x}
            y1={pad.top} y2={H - pad.bottom}
            stroke="var(--axis)" strokeWidth="1"
          />
        )}

        {points.map((s) => (
          <g key={s.key}>
            <path
              d={s.d.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')}
              fill="none" stroke={s.color} strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round"
            />
            {hover && (
              // 2px surface ring so an overlapping marker still reads as separate.
              <circle
                cx={s.d[hover.idx].x} cy={s.d[hover.idx].y} r="4"
                fill={s.color} stroke="var(--surface-1)" strokeWidth="2"
              />
            )}
          </g>
        ))}

        {data.length > 1 && (
          <>
            <text x={pad.left} y={H - 6} fontSize="11" fill="var(--muted)">{data[0].day}</text>
            <text x={W - pad.right} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor="end">
              {data[data.length - 1].day}
            </text>
          </>
        )}
      </svg>

      {row && (
        <div
          className="tooltip"
          style={{ left: Math.min(hover.left + 10, (ref.current?.clientWidth ?? 0) - 150), top: 8 }}
        >
          <div className="t-head">{row.day}</div>
          {series.map((s) => (
            <div className="t-row" key={s.key}>
              <span>
                <i className="swatch" style={{ background: s.color, display: 'inline-block', marginRight: 6 }} />
                {s.label}
              </span>
              <strong>{format(Number(row[s.key]) || 0)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Day-wise grouped bar chart. Same axis behavior and tooltip as LineChart, but
 * each day is a discrete bar rather than a point on a line — so sparse measures
 * (a conversion here and there) and zero-days read as what they are instead of
 * collapsing into a single spike or an invisible gap.
 *
 * One series → one bar per day. Multiple series → bars grouped within each day.
 */
export function BarChart({ data, series, height = 200, format = fmt.format }) {
  const [hover, setHover] = useState(null)
  const ref = useRef(null)

  const W = 800
  const H = height
  const pad = { top: 12, right: 16, bottom: 24, left: 44 }

  const { max, bands, ticks, bandW } = useMemo(() => {
    const values = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))
    const rawMax = Math.max(1, ...values)
    // Round the ceiling up so gridlines land on readable numbers (matches LineChart).
    const mag = Math.pow(10, Math.floor(Math.log10(rawMax)))
    const max = Math.ceil(rawMax / mag) * mag
    const innerW = W - pad.left - pad.right
    const innerH = H - pad.top - pad.bottom
    const base = pad.top + innerH
    const bandW = data.length ? innerW / data.length : innerW
    // Leave 22% of each band as padding around the group; split the rest across bars.
    const groupW = bandW * 0.78
    const barW = groupW / series.length
    const y = (v) => base - (v / max) * innerH
    return {
      max,
      bandW,
      bands: data.map((row, i) => {
        const x0 = pad.left + i * bandW + (bandW - groupW) / 2
        return {
          bars: series.map((s, j) => {
            const v = Number(row[s.key]) || 0
            return { key: s.key, color: s.color, x: x0 + j * barW, w: barW, y: y(v), h: base - y(v), v }
          }),
        }
      }),
      ticks: [0, 0.5, 1].map((f) => ({ v: max * f, y: y(max * f) })),
    }
  }, [data, series, H])

  if (!data.length) return <Empty />

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const rel = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.floor((rel - pad.left) / bandW)
    const idx = Math.max(0, Math.min(data.length - 1, i))
    setHover({ idx, left: ((pad.left + (idx + 0.5) * bandW) / W) * rect.width })
  }

  const row = hover ? data[hover.idx] : null

  return (
    <div className="chart">
      <Legend series={series} />
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Daily ${series.map((s) => s.label).join(', ')}`}
      >
        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} stroke="var(--grid)" strokeWidth="1" />
            <text x={pad.left - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
              {format(Math.round(t.v))}
            </text>
          </g>
        ))}

        {hover && (
          <rect
            x={pad.left + hover.idx * bandW} y={pad.top}
            width={bandW} height={H - pad.top - pad.bottom}
            fill="var(--axis)" opacity="0.12"
          />
        )}

        {bands.map((band, i) => (
          <g key={i}>
            {band.bars.map((b) => (
              <rect key={b.key} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} rx="1" />
            ))}
          </g>
        ))}

        {data.length > 1 && (
          <>
            <text x={pad.left} y={H - 6} fontSize="11" fill="var(--muted)">{data[0].day}</text>
            <text x={W - pad.right} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor="end">
              {data[data.length - 1].day}
            </text>
          </>
        )}
      </svg>

      {row && (
        <div
          className="tooltip"
          style={{ left: Math.min(hover.left + 10, (ref.current?.clientWidth ?? 0) - 150), top: 8 }}
        >
          <div className="t-head">{row.day}</div>
          {series.map((s) => (
            <div className="t-row" key={s.key}>
              <span>
                <i className="swatch" style={{ background: s.color, display: 'inline-block', marginRight: 6 }} />
                {s.label}
              </span>
              <strong>{format(Number(row[s.key]) || 0)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Horizontal bar list — the right form for ranked categories with long labels.
 * Vertical bars would force the labels diagonal, which is the single most common
 * way a category chart becomes unreadable.
 */
export function BarList({ rows, valueKey = 'value', labelKey = 'label', format = fmt.format, color = 'var(--s1)' }) {
  const max = Math.max(1, ...rows.map((r) => Number(r[valueKey]) || 0))
  if (!rows.length) return <Empty />
  return (
    <div>
      {rows.map((r) => {
        const v = Number(r[valueKey]) || 0
        return (
          <div key={r[labelKey]} style={{ marginBottom: 10 }} title={`${r[labelKey]}: ${format(v)}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r[labelKey]}
              </span>
              <strong style={{ fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{format(v)}</strong>
            </div>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(v / max) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Funnel steps. Uses an ordinal ramp of ONE hue rather than categorical colors:
 * the steps are ordered stages of a single thing, not separate entities.
 */
const FUNNEL_RAMP = ['#86b6ef', '#5598e7', '#3987e5', '#256abf', '#184f95']

export function FunnelChart({ steps, labels = {} }) {
  if (!steps.length) return <Empty />
  const top = Math.max(1, steps[0].sessions)
  return (
    <div>
      {steps.map((s, i) => {
        const share = s.sessions / top
        const prev = i > 0 ? steps[i - 1].sessions : null
        const drop = prev && prev > 0 ? 1 - s.sessions / prev : null
        return (
          <div key={s.step} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--ink-2)' }}>{labels[s.step] || s.step}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                <strong>{fmt.format(s.sessions)}</strong>
                <span style={{ color: 'var(--muted)' }}> sessions</span>
                {drop !== null && drop > 0 && (
                  <span style={{ color: 'var(--muted)' }}> · −{pct(drop)}</span>
                )}
              </span>
            </div>
            <div style={{ height: 22, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(share * 100, s.sessions > 0 ? 1.5 : 0)}%`,
                  height: '100%',
                  background: FUNNEL_RAMP[Math.min(i, FUNNEL_RAMP.length - 1)],
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Table({ columns, rows, rowClass, empty }) {
  if (!rows.length) return <Empty>{empty}</Empty>
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.num ? 'num' : undefined}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className={rowClass?.(row)}>
              {columns.map((c) => (
                <td key={c.key} className={c.num ? 'num' : undefined}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
