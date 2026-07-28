import { useEffect, useRef, useState } from 'react'

import { TrackInView } from '../analytics/TrackInView.jsx'
import { BROCHURE_URL } from '../site/data'
import { useGeo, useReveal } from '../site/hooks'
import { SectionTag } from '../site/ui.jsx'

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
 * Copy-to-clipboard control for a channel's value.
 *
 * A desktop visitor clicking "Call the sales desk" gets a tel: handoff to
 * whatever app the OS picked, which is usually not what they wanted — they
 * wanted the number, to dial on a phone or paste into a CRM. This gives them
 * that without leaving the page.
 *
 * It renders as a SIBLING of the row's anchor, not inside it: a <button> nested
 * in an <a> is invalid HTML, and browsers recover from it by splitting the
 * anchor, which would break both the link and the delegated analytics that read
 * its href.
 */
/**
 * The old synchronous copy: a throwaway textarea, selected, then execCommand.
 * Deprecated, universally supported, and — unlike the async API — it cannot
 * leave a promise pending, which is the property that matters here.
 */
function copySync(text) {
  try {
    const node = document.createElement('textarea')
    node.value = text
    node.setAttribute('readonly', '')
    node.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.appendChild(node)
    node.select()
    node.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    node.remove()
    return ok
  } catch {
    return false
  }
}

/**
 * Write to the clipboard without ever hanging.
 *
 * navigator.clipboard.writeText can sit unresolved indefinitely when the
 * clipboard-write permission is neither granted nor denied — it neither
 * fulfils nor rejects, so awaiting it plainly means the button never reports
 * anything back and the visitor cannot tell whether it worked. Observed
 * happening, not theorised.
 *
 * So the promise is raced against a short timer and the synchronous path picks
 * up whatever it drops.
 */
async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    const result = await Promise.race([
      navigator.clipboard.writeText(text).then(() => true, () => false),
      new Promise((resolve) => setTimeout(() => resolve(false), 400)),
    ])
    if (result) return true
  }
  return copySync(text)
}

function CopyButton({ value, label }) {
  // null = idle, true = copied, false = failed. Failure gets its own state
  // rather than borrowing the success one: telling someone their number is on
  // the clipboard when it is not is worse than telling them nothing.
  const [state, setState] = useState(null)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    const ok = await writeClipboard(value)
    setState(ok)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState(null), 1800)
  }

  const copied = state === true
  const failed = state === false

  return (
    <button
      type="button"
      className="ch-copy"
      data-state={copied ? 'copied' : failed ? 'failed' : undefined}
      onClick={copy}
      // The label is the live region here: aria-live on a control this small
      // would be more interruption than it is worth, but the name changing
      // means a screen reader reports the result on next focus.
      aria-label={copied ? `${label} copied` : failed ? `Could not copy ${label}` : `Copy ${label}`}
      data-evt="contact_intent_clicked"
      data-evt-props={JSON.stringify({ channel: 'copy', placement: 'contact_panel' })}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
          Copied
        </>
      ) : failed ? (
        'Press Ctrl+C'
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2.5" />
            <path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

/**
 * One line of contact. The anchor stays an <a> with nothing but an href — the
 * delegated listener resolves it to contact_intent_clicked with the right
 * channel, so a fourth channel added here is instrumented without touching
 * analytics code. The copy control sits beside it, outside the anchor.
 */
function ChannelRow({ channel }) {
  const external = channel.kind === 'whatsapp'
  return (
    <div className="ch-row-wrap">
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
      {channel.copyLabel && <CopyButton value={channel.value} label={channel.copyLabel} />}
    </div>
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
 */
export function ContactSection() {
  const { content } = useGeo()
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
      copyLabel: 'phone number',
    },
    {
      kind: 'email',
      title: 'Email us',
      note: 'Best for detailed specs, tenders, and PO paperwork.',
      value: 'info@aquaviaworld.com',
      href: 'mailto:info@aquaviaworld.com',
      copyLabel: 'email address',
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
