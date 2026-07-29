import { useState } from 'react'

import { PageShell } from '../site/PageShell.jsx'
import { SITE_URL } from '../site/data'
import { graphForContent } from '../site/schema'
import { BrochureLink } from '../site/ui.jsx'
import { contentPageBySlug } from './index.js'

/**
 * The one renderer every generated content page goes through.
 *
 * There are two dozen of these pages and there will be more. None of them is a
 * bespoke layout — each is a title, a passage written to be quoted, some
 * sections, a table or a list, and a set of questions. Writing that structure
 * once and feeding it data means a new page is a data file, and it means every
 * page has the same extractable shape rather than twenty-three variations on it.
 *
 * The shape is chosen for how assistants read pages, not for novelty:
 *
 * - one `<h1>`, then immediately a 40–60 word answer block that stands alone;
 * - a "Key facts" definition list, because <dl> pairs survive extraction intact;
 * - `<h2>` per section, with real `<table>` markup for anything comparative;
 * - questions as `<h3>` + `<p>`, mirrored exactly by the FAQPage JSON-LD.
 */

// ─── Building blocks ──────────────────────────────────────────────────────────

/** A comparison table. Wrapped so wide tables scroll rather than the page. */
function DataTable({ table }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        {table.caption && <caption>{table.caption}</caption>}
        <thead>
          <tr>{table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                i === 0
                  ? <th key={i} scope="row">{cell}</th>
                  : <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Key facts as a definition list.
 *
 * A <dl> is the most reliably extracted structure on a web page after a table —
 * each term is unambiguously bound to its value, with no layout to interpret.
 * This block exists specifically to be quoted.
 */
function KeyFacts({ facts }) {
  return (
    <div className="key-facts">
      <h2 id="key-facts">Key facts</h2>
      <dl>
        {facts.map((f) => (
          <div key={f.term} className="fact-row">
            <dt>{f.term}</dt>
            <dd>{f.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Section({ section }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-heading`} className="content-section">
      <h2 id={`${section.id}-heading`}>{section.heading}</h2>
      {section.body?.map((para, i) => <p key={i}>{para}</p>)}
      {section.list && (
        <ul className="content-list">
          {section.list.map((item) => (
            <li key={typeof item === 'string' ? item : item.term}>
              {typeof item === 'string'
                ? item
                : <><strong>{item.term}</strong> — {item.detail}</>}
            </li>
          ))}
        </ul>
      )}
      {section.steps && (
        <ol className="content-list">
          {section.steps.map((item) => (
            <li key={item.term}><strong>{item.term}</strong> — {item.detail}</li>
          ))}
        </ol>
      )}
      {section.table && <DataTable table={section.table} />}
      {section.after?.map((para, i) => <p key={i}>{para}</p>)}
    </section>
  )
}

function FaqBlock({ faqs }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="content-section">
      <h2 id="faq-heading">Frequently asked questions</h2>
      {faqs.map((f) => (
        <div key={f.q} className="faq-item">
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </section>
  )
}

/**
 * Internal links out of a content page.
 *
 * Descriptive anchor text, resolved from the content index rather than written
 * by hand, so a retitled page cannot leave twenty stale link labels behind it.
 */
function Related({ slugs }) {
  const pages = slugs.map(contentPageBySlug).filter(Boolean)
  if (!pages.length) return null
  return (
    <section aria-labelledby="related-heading" className="content-section">
      <h2 id="related-heading">Related reading</h2>
      <ul className="content-list">
        {pages.map((p) => (
          <li key={p.slug}>
            <a href={`/${p.slug}`}>{p.linkText ?? p.h1}</a> — {p.description}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Quote request ────────────────────────────────────────────────────────────

/**
 * The one form on the site, and api/lead.ts's first caller.
 *
 * That endpoint has existed, fully wired to Web3Forms with server-side identity
 * stitching and a `lead_submitted` conversion event, with zero callers in src/ —
 * the contact page deliberately dropped its form in favour of three direct
 * channels, and nothing replaced the lead path.
 *
 * These pages are the right place for it. Someone reading 1,400 words on label
 * materials or wedding quantities is mid-research, not ready to open WhatsApp,
 * and a two-field form is a lower step than a phone call. The direct channels
 * stay listed beside it for anyone who would rather just message.
 *
 * Only name and email are required, matching what the endpoint validates.
 */
function QuoteForm({ topic }) {
  const [state, setState] = useState('idle')
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError(null)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, message: `[${topic}] ${data.message ?? ''}`.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Something went wrong. Please WhatsApp us instead.')
      }
      setState('sent')
    } catch (err) {
      setState('idle')
      setError(err.message)
    }
  }

  if (state === 'sent') {
    return (
      <div className="quote-box" role="status">
        <h2>Thanks — that&rsquo;s with the sales desk.</h2>
        <p>You&rsquo;ll have a reply the same working day. If it is urgent, WhatsApp <a href="https://wa.me/917624803460" target="_blank" rel="noopener noreferrer">+91 76248 03460</a>.</p>
      </div>
    )
  }

  return (
    <div className="quote-box">
      <h2 id="quote">Get a quote for your order</h2>
      <p>Tell us the size and rough quantity and we will come back with a rate the same working day. Prefer to talk? WhatsApp <a href="https://wa.me/917624803460" target="_blank" rel="noopener noreferrer">+91 76248 03460</a> or email <a href="mailto:info@aquaviaworld.com">info@aquaviaworld.com</a>.</p>
      <form onSubmit={onSubmit} className="quote-form">
        <label>
          <span>Your name</span>
          <input name="name" type="text" required autoComplete="name" />
        </label>
        <label>
          <span>Work email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          <span>Company <em>(optional)</em></span>
          <input name="company" type="text" autoComplete="organization" />
        </label>
        <label>
          <span>Quantity and size <em>(optional)</em></span>
          <input name="quantity" type="text" placeholder="e.g. 5,000 × 500ml" />
        </label>
        <label className="quote-wide">
          <span>Anything else <em>(optional)</em></span>
          <textarea name="message" rows="3" />
        </label>
        <div className="quote-wide">
          <button type="submit" className="quote-submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Request a quote'}
          </button>
          {error && <p className="quote-error" role="alert">{error}</p>}
        </div>
      </form>
    </div>
  )
}

// ─── The page ─────────────────────────────────────────────────────────────────

/**
 * Meta in the shape PageShell wants, derived from a content module.
 *
 * Exported because scripts/prerender.mjs builds each generated page's <head>
 * from the same object the component renders from — the head and the body of a
 * document cannot disagree if they are computed from one source.
 */
export function contentMeta(page) {
  const path = `/${page.slug}`
  return {
    path,
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    h1: page.h1,
    lede: page.answerBlock,
    trail: page.trail ?? [{ name: page.breadcrumb ?? page.h1, path }],
    canonical: `${SITE_URL}${path}`,
  }
}

export function ContentPage({ page }) {
  return (
    <PageShell meta={contentMeta(page)} schema={graphForContent(page, page.schema?.() ?? [])}>
      <div className="content-body">
        {page.keyFacts?.length > 0 && <KeyFacts facts={page.keyFacts} />}
        {page.sections.map((s) => <Section key={s.id} section={s} />)}
        {/* `faqs` always feeds the FAQPage JSON-LD. `faqBlock: false` suppresses
            only the rendered block, for a page like /faq whose sections ARE the
            questions — rendering them twice would put every answer in the
            document two times over, which reads as padding to a human and as
            duplication to an engine. */}
        {page.faqBlock !== false && page.faqs?.length > 0 && <FaqBlock faqs={page.faqs} />}
        <QuoteForm topic={page.h1} />
        {page.brochure !== false && (
          <p className="content-brochure">
            Working to a budget? <BrochureLink variant="ghost" /> for the full per-case rate card.
          </p>
        )}
        {page.related?.length > 0 && <Related slugs={page.related} />}
      </div>
    </PageShell>
  )
}

/** Used by the prerenderer and by the client entry alike. */
export function renderContentPage(page) {
  return <ContentPage page={page} />
}
