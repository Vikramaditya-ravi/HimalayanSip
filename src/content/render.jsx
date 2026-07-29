import { PageShell } from '../site/PageShell.jsx'
import { SITE_URL } from '../site/data'
import { graphForContent } from '../site/schema'
import { ResourceCard } from '../site/Resources.jsx'
import { BrochureLink } from '../site/ui.jsx'
import { RESOURCES_PATH, contentPageBySlug, groupForPage, trailFor } from './index.js'

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
 *
 * Two changes from the bare <ul> this used to be. It renders the same
 * ResourceCard the hub and the marketing routes use, so a related link looks
 * like a related link everywhere on the site rather than like a bullet here and
 * a card there. And it always ends with a route up to the category and the hub,
 * which is what stops a reader who has exhausted these three suggestions from
 * being at a dead end — previously the only way onward was the footer.
 */
function Related({ page }) {
  const pages = (page.related ?? []).map(contentPageBySlug).filter(Boolean)
  const group = groupForPage(page)
  if (!pages.length && !group) return null
  return (
    <section aria-labelledby="related-heading" className="content-section related-block">
      <h2 id="related-heading">Related resources</h2>
      <div className="res-grid res-grid-compact">
        {pages.map((p) => <ResourceCard key={p.slug} page={p} placement="content_related" />)}
      </div>
      <p className="related-more">
        {group && (
          <>
            More in{' '}
            <a href={`${RESOURCES_PATH}#${group.id}`}>{group.label}</a>
            {' '}({group.pages.length} pages), or{' '}
          </>
        )}
        <a href={RESOURCES_PATH}>browse every guide and specification</a>.
      </p>
    </section>
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
    // Home / Resources / <category> / <page>, derived from the content index —
    // see trailFor. The same array feeds the BreadcrumbList in the JSON-LD, so
    // the visible trail and the structured one cannot describe different sites.
    trail: trailFor(page),
    canonical: `${SITE_URL}${path}`,
  }
}

export function ContentPage({ page }) {
  // Computed once and used twice: PageShell renders `meta.trail` as the visible
  // breadcrumbs, and the same array becomes the BreadcrumbList in the JSON-LD.
  // See the note on graphForContent for why the trail cannot be derived inside
  // schema.js.
  const meta = contentMeta(page)
  return (
    <PageShell meta={meta} schema={graphForContent(page, page.schema?.() ?? [], meta.trail)}>
      <div className="content-body">
        {page.keyFacts?.length > 0 && <KeyFacts facts={page.keyFacts} />}
        {page.sections.map((s) => <Section key={s.id} section={s} />)}
        {/* `faqs` always feeds the FAQPage JSON-LD. `faqBlock: false` suppresses
            only the rendered block, for a page like /faq whose sections ARE the
            questions — rendering them twice would put every answer in the
            document two times over, which reads as padding to a human and as
            duplication to an engine. */}
        {page.faqBlock !== false && page.faqs?.length > 0 && <FaqBlock faqs={page.faqs} />}
        {page.brochure !== false && (
          <p className="content-brochure">
            Working to a budget? <BrochureLink variant="ghost" /> for the full per-case rate card.
          </p>
        )}
        <Related page={page} />
      </div>
    </PageShell>
  )
}

/** Used by the prerenderer and by the client entry alike. */
export function renderContentPage(page) {
  return <ContentPage page={page} />
}
