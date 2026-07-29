import { CONTENT_GROUPS, RESOURCES_PATH, contentPageBySlug } from '../content/index.js'

/**
 * The shared vocabulary for linking into the content library.
 *
 * Before this existed there was exactly one way to reach the twenty-three pages
 * under src/content: four truncated columns in the footer. The six marketing
 * routes linked to none of them, and the pages linked back only to each other —
 * so the library was a cul-de-sac hanging off the least-read element on the
 * page.
 *
 * Everything here renders the same card, from the same content index, with the
 * same instrumentation. That matters more than it sounds: a "related resources"
 * block that looks different on every surface reads as six different features
 * rather than one library, and a hand-written link list goes stale the first
 * time a page is retitled. Titles and descriptions are always resolved from the
 * module, so they cannot.
 *
 * `placement` is carried into the resource_clicked event so we can tell whether
 * the navbar menu, the hub, or the in-page blocks are what actually moves people
 * into the library — see src/analytics/catalog.ts.
 */

/**
 * Props for the resource_clicked event, in the shape the delegated listener
 * reads.
 *
 * analytics/delegate.ts takes arbitrary event properties from one attribute —
 * `data-evt-props`, parsed as JSON — and nothing else, so a hand-rolled
 * `data-evt-placement` would be silently dropped. Building the string here means
 * no call site has to know that.
 */
const evtProps = (placement, slug) => JSON.stringify({ placement, slug })

/**
 * One page as a card.
 *
 * A real <a> wrapping the whole card, not a div with an onClick and a link
 * inside it: the card is one destination, so it should be one tab stop, one
 * middle-click target and one thing a crawler sees. `data-evt` is all the
 * instrumentation it needs — the delegated listener in analytics/delegate.ts
 * resolves it on any click.
 */
export function ResourceCard({ page, placement }) {
  return (
    <a
      className="res-card"
      href={`/${page.slug}`}
      data-evt="resource_clicked"
      data-evt-props={evtProps(placement, page.slug)}
    >
      {/* `breadcrumb`, not `linkText`. Both exist on every content module and
          they are written for different jobs: linkText is mid-sentence anchor
          text ("see what custom branded bottles cost"), so as a card title it
          lands as an uncapitalised fragment. breadcrumb is the short title-cased
          label — which is also what the navbar menu and the trail use, so one
          page is called the same thing everywhere it is linked. */}
      <span className="res-card-title">{page.breadcrumb ?? page.h1}</span>
      <span className="res-card-desc">{page.description}</span>
      <span className="res-card-more" aria-hidden="true">Read<span className="res-arrow">→</span></span>
    </a>
  )
}

/** A grid of cards for an explicit list of slugs, in the order given. */
export function ResourceGrid({ slugs, placement }) {
  const pages = slugs.map(contentPageBySlug).filter(Boolean)
  if (!pages.length) return null
  return (
    <div className="res-grid">
      {pages.map((p) => <ResourceCard key={p.slug} page={p} placement={placement} />)}
    </div>
  )
}

/**
 * The contextual block that ends a page.
 *
 * Rendered on all six marketing routes and, in a narrower form, at the foot of
 * every content page. It always ends with a link to the hub, which is what
 * guarantees the library is never more than two clicks from anywhere on the
 * site and that no page is a dead end.
 *
 * `heading` is a real <h2> and the section is labelled by it, so this is a
 * navigable landmark rather than a visual afterthought.
 */
export function RelatedResources({
  slugs,
  placement,
  heading = 'Related resources',
  intro,
  hubLabel = 'Browse all resources',
  id = 'related-resources',
}) {
  const pages = slugs.map(contentPageBySlug).filter(Boolean)
  if (!pages.length) return null
  return (
    <section id={id} className="res-band" aria-labelledby={`${id}-heading`}>
      <div className="res-band-inner">
        <div className="res-band-head">
          <div>
            <span className="res-eyebrow">Learn more</span>
            <h2 id={`${id}-heading`} className="res-band-h2">{heading}</h2>
            {intro && <p className="res-band-intro">{intro}</p>}
          </div>
          <a className="res-hub-link" href={RESOURCES_PATH} data-evt="resource_clicked" data-evt-props={evtProps(`${placement}_hub`, 'resources')}>
            {hubLabel}<span className="res-arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div className="res-grid">
          {pages.map((p) => <ResourceCard key={p.slug} page={p} placement={placement} />)}
        </div>
      </div>
    </section>
  )
}

/**
 * Every category, every page, as columns of links.
 *
 * Used by the navbar's desktop menu and its mobile drawer group. `limit` caps
 * how many of a category's pages a surface shows — the navbar menu is a menu,
 * not a sitemap — and the "all N" link that follows carries the rest.
 */
export function ResourceMenuColumns({ limit = 5, placement, onNavigate }) {
  return (
    <>
      {CONTENT_GROUPS.map((group) => {
        const shown = group.pages.slice(0, limit)
        const hidden = group.pages.length - shown.length
        return (
          <div className="res-menu-col" key={group.id}>
            <a
              className="res-menu-head"
              href={`${RESOURCES_PATH}#${group.id}`}
              onClick={onNavigate}
              data-evt="resource_clicked"
              data-evt-props={evtProps(`${placement}_category`, group.id)}
            >
              {group.label}
              <span className="res-menu-count">{group.pages.length}</span>
            </a>
            <ul className="res-menu-list">
              {shown.map((p) => (
                <li key={p.slug}>
                  <a
                    href={`/${p.slug}`}
                    onClick={onNavigate}
                    data-evt="resource_clicked"
                    data-evt-props={evtProps(placement, p.slug)}
                  >
                    {p.breadcrumb ?? p.linkText ?? p.h1}
                  </a>
                </li>
              ))}
              {hidden > 0 && (
                <li>
                  <a
                    className="res-menu-rest"
                    href={`${RESOURCES_PATH}#${group.id}`}
                    onClick={onNavigate}
                    data-evt="resource_clicked"
                    data-evt-props={evtProps(`${placement}_category`, group.id)}
                  >
                    +{hidden} more<span className="res-arrow" aria-hidden="true">→</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        )
      })}
    </>
  )
}
