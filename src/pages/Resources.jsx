import { CONTENT_GROUPS, RESOURCES_PATH } from '../content/index.js'
import { PageShell } from '../site/PageShell.jsx'
import { ResourceCard } from '../site/Resources.jsx'
import { graphForResources } from '../site/collection'
import { ROUTES } from '../site/data'
import { BrochureLink } from '../site/ui.jsx'

/**
 * The content hub.
 *
 * Every one of the twenty-three pages under src/content appears here exactly
 * once, in its category, with its own description — no truncation and no
 * "featured" subset. That is the point of the page: it is the one URL where the
 * whole library is enumerable, by a reader scanning for the thing they need and
 * by a crawler working out that these pages are a collection rather than
 * twenty-three unrelated documents that happen to share a footer.
 *
 * It is generated from CONTENT_GROUPS, so a page added to the index appears here
 * the same day it is written. There is no list on this page to forget to update
 * — which is precisely how the footer ended up showing six of the ten guides.
 *
 * Category ids are real anchors (#guides, #where-we-deliver). The navbar menu,
 * the breadcrumb trail on every content page, and the "+N more" links all point
 * at them, so those links land on the category rather than at the top of a long
 * page the reader then has to scan.
 */

/** The jump strip under the lede. Four targets, so the page is never a scroll hunt. */
function CategoryNav() {
  return (
    <nav className="res-jump" aria-label="Resource categories">
      {CONTENT_GROUPS.map((g) => (
        <a key={g.id} className="res-jump-link" href={`${RESOURCES_PATH}#${g.id}`}>
          {g.label}
          <span className="res-jump-count">{g.pages.length}</span>
        </a>
      ))}
    </nav>
  )
}

function Category({ group }) {
  return (
    <section id={group.id} className="res-cat" aria-labelledby={`${group.id}-heading`}>
      <div className="res-cat-head">
        <h2 id={`${group.id}-heading`} className="res-cat-h2">{group.label}</h2>
        <p className="res-cat-blurb">{group.blurb}</p>
      </div>
      <div className="res-grid">
        {group.pages.map((p) => (
          <ResourceCard key={p.slug} page={p} placement="resources_hub" />
        ))}
      </div>
    </section>
  )
}

export function ResourcesPage() {
  const total = CONTENT_GROUPS.reduce((n, g) => n + g.pages.length, 0)

  return (
    /* The CollectionPage graph is passed explicitly rather than resolved by
       graphFor(), because building it needs the content index and schema.js
       cannot import that without a cycle — see src/site/collection.js. The
       prerenderer uses the same builder for this route's <head>. */
    <PageShell route="resources" schema={graphForResources(ROUTES.resources)}>
      <div className="res-page">
        <CategoryNav />

        {CONTENT_GROUPS.map((g) => <Category key={g.id} group={g} />)}

        {/* The hub's own call to action. Someone who has read three guides has
            done their research and wants a number — the closing band is where
            that is cheapest to ask for, and it is the same two channels every
            other page offers rather than a fourth variation on them. */}
        <section className="res-cta" aria-labelledby="res-cta-heading">
          <h2 id="res-cta-heading" className="res-cat-h2">Still deciding?</h2>
          <p>
            All {total} pages above are written from the same rate card and the same plant
            specification the sales desk quotes from. If you would rather just ask:
            WhatsApp <a href="https://wa.me/917624803460" target="_blank" rel="noopener noreferrer">+91 76248 03460</a>,
            email <a href="mailto:info@aquaviaworld.com">info@aquaviaworld.com</a>, or
            see <a href="/pricing">pricing</a> and <a href="/products">bottle sizes</a> directly.
          </p>
          <div className="res-cta-actions">
            <BrochureLink variant="solid" />
            <a className="res-cta-ghost" href="/contact">Get a quote<span className="res-arrow" aria-hidden="true">→</span></a>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
