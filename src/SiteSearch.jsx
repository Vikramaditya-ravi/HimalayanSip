import { useEffect, useMemo, useRef, useState } from 'react'
import { track } from './analytics/tracker'

/**
 * Site search.
 *
 * Built primarily so zero-result searches can be recorded. A query that returns
 * nothing is the most commercially valuable signal on the site: someone arrived
 * wanting a specific thing, went looking for it, and left empty-handed. That list
 * is a product roadmap written by buyers — but only if there is a search box for
 * them to type into.
 */

const DEBOUNCE_MS = 400

function score(entry, q) {
  const title = entry.title.toLowerCase()
  const body = entry.body.toLowerCase()
  if (title === q) return 100
  if (title.startsWith(q)) return 80
  if (title.includes(q)) return 60
  if (body.includes(q)) return 30
  // Token fallback so "bottle price" still matches "Choose Your Perfect Size".
  const tokens = q.split(/\s+/).filter((t) => t.length > 2)
  if (tokens.length && tokens.every((t) => title.includes(t) || body.includes(t))) return 20
  return 0
}

export function SiteSearch({ index, onNavigate }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const reported = useRef(new Set())

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return index
      .map((entry) => ({ entry, s: score(entry, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((r) => r.entry)
  }, [query, index])

  // Debounced so we record what someone searched FOR, not every keystroke on the
  // way there — "b", "bo", "bot" are not three failed searches for bottles.
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return
    const id = setTimeout(() => {
      if (reported.current.has(q)) return
      reported.current.add(q)

      track('search_performed', { queryText: q, props: { resultCount: results.length } })
      if (results.length === 0) {
        track('search_zero_results', { queryText: q })
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [query, results.length])

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const choose = (entry) => {
    track('search_result_clicked', { queryText: query.trim().toLowerCase(), sectionId: entry.sectionId })
    setOpen(false)
    setQuery('')
    onNavigate(entry.sectionId)
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <label htmlFor="site-search" className="sr-only" style={{
        position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
      }}>
        Search the site
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        placeholder="Search…"
        autoComplete="off"
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        aria-expanded={showPanel}
        aria-controls="site-search-results"
        className="site-search-input"
      />
      {/* Decorative: the input already has a visible label association and a
          placeholder, so the glyph is not carrying any meaning of its own. */}
      <svg className="site-search-icon" width="15" height="15" viewBox="0 0 20 20" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        aria-hidden="true" focusable="false">
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5 L17 17" />
      </svg>

      {showPanel && (
        <div
          id="site-search-results"
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320,
            background: 'rgba(4,16,31,0.98)', border: '1px solid var(--glass-border)',
            borderRadius: 14, padding: 8, zIndex: 1200,
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: '14px 12px', color: 'var(--muted)', fontSize: 14 }}>
              Nothing matches “{query.trim()}”.{' '}
              <button
                type="button"
                onClick={() => choose({ sectionId: 'contact' })}
                style={{ background: 'none', border: 'none', color: 'var(--aqua)', cursor: 'pointer', padding: 0, font: 'inherit' }}
              >
                Ask us directly →
              </button>
            </div>
          ) : (
            results.map((entry) => (
              <button
                key={entry.id}
                role="option"
                aria-selected="false"
                type="button"
                onClick={() => choose(entry)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                  color: 'var(--white)', font: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(62,207,191,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{entry.kind}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
