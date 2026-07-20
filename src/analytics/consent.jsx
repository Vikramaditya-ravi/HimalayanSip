import { useEffect, useState } from 'react'

/**
 * Consent for THIRD-PARTY vendors only.
 *
 * First-party analytics is not gated: it stores no PII, never persists a raw IP,
 * and never leaves our own infrastructure. Gating it would mean throwing away
 * most of our own operational data to protect nobody from anything.
 *
 * Third-party vendors are different — they receive data and set their own
 * identifiers — so their scripts must never be FETCHED until consent is granted.
 * Loading a vendor script and then "disabling" it has already handed the vendor a
 * request with an IP, a UA, and a referrer. The gate has to be at the fetch.
 */

const COOKIE = 'consent'
const MAX_AGE = 60 * 60 * 24 * 180

/**
 * Three states, and the third is not the second.
 *
 *   'granted' | 'denied' | null (unanswered)
 *
 * `null` means we have not asked yet, or they dismissed without choosing. It is
 * NOT the same as 'denied' — conflating them silently converts "I haven't
 * decided" into a decision the visitor never made.
 */
export function readConsent() {
  const match = document.cookie.match(/(?:^|;\s*)consent=(granted|denied)(?:;|$)/)
  return match ? match[1] : null
}

function writeConsent(value) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
}

/**
 * Vendor scripts. Empty today — the site loads no third-party analytics at all.
 *
 * When one is added it goes here, and it is only ever reached from inside the
 * `granted` branch below.
 */
const VENDOR_SCRIPTS = []

function loadVendors() {
  for (const { src, attrs = {} } of VENDOR_SCRIPTS) {
    if (document.querySelector(`script[src="${src}"]`)) continue
    const el = document.createElement('script')
    el.src = src
    el.async = true
    Object.assign(el, attrs)
    document.head.appendChild(el)
  }
}

/**
 * Rendered inside the app, not in a root document template.
 *
 * Reading cookies during server rendering would force the whole page off static
 * generation for a banner that most visitors see once — so consent is resolved
 * here, on the client, after hydration.
 */
export function ConsentBanner() {
  const [state, setState] = useState('unknown')

  useEffect(() => {
    const current = readConsent()
    setState(current ?? 'unanswered')
    if (current === 'granted') loadVendors()
  }, [])

  // Nothing to show while resolving, or once a choice exists. If there are no
  // vendors to gate, there is nothing to consent to — so don't interrupt anyone.
  if (state !== 'unanswered' || VENDOR_SCRIPTS.length === 0) return null

  const choose = (value) => {
    writeConsent(value)
    setState(value)
    if (value === 'granted') loadVendors()
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      style={{
        position: 'fixed', bottom: 20, left: 20, right: 'auto', maxWidth: 380, zIndex: 9999,
        background: 'rgba(4,16,31,0.97)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: '20px 22px', backdropFilter: 'blur(12px)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: 'var(--white)', fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
        We measure how this site is used with our own analytics — no personal data, no
        tracking across other sites. May we also enable third-party tools?
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => choose('granted')}
          style={{
            flex: 1, background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
            border: 'none', borderRadius: 50, padding: '10px', color: 'var(--navy)',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          Allow
        </button>
        <button
          type="button"
          onClick={() => choose('denied')}
          style={{
            flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 50, padding: '10px', color: 'var(--muted)',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, cursor: 'pointer',
          }}
        >
          No thanks
        </button>
      </div>
    </div>
  )
}
