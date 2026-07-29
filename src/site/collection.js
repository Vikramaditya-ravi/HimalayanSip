import { CONTENT_GROUPS } from '../content/index.js'
import { SITE_URL } from './data'
import { graphFor } from './schema'

/**
 * The structured data for /resources.
 *
 * This lives here rather than inside src/site/schema.js for one concrete
 * reason: the content modules import `serviceNode` from schema.js, so a schema.js
 * that imported the content index would close a cycle
 * (schema → content/index → for/*.js → schema) and, depending on which module
 * the bundler evaluated first, leave one of them holding an undefined import.
 * Anything that needs to see both the schema builders and the content index
 * therefore has to sit above them, which is what this file is.
 *
 * What it adds to the ordinary route graph: a CollectionPage whose parts are one
 * ItemList per category, each listing every page in that category in order. That
 * is the machine-readable form of the claim the page makes visually — these
 * twenty-three URLs are one library, grouped four ways — and it is the node that
 * lets an engine treat the hub as the entry point to a collection rather than as
 * a page that happens to contain a lot of links.
 *
 * Items are plain URL strings, not `{'@id': …}` pointers. A pointer to a node
 * that is not defined in the same document is a dangling edge, and the JSON-LD
 * assertion in src/site/__tests__/prerender.test.ts fails the build for exactly
 * that — correctly, since the guide pages define their own nodes on their own
 * URLs, not here.
 */

const listId = (groupId) => `${SITE_URL}/resources#list-${groupId}`

function itemList(group) {
  return {
    '@type': 'ItemList',
    '@id': listId(group.id),
    name: group.label,
    description: group.blurb,
    numberOfItems: group.pages.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: group.pages.map((page, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: page.linkText ?? page.h1,
      description: page.description,
      url: `${SITE_URL}/${page.slug}`,
    })),
  }
}

export function graphForResources(meta) {
  const base = graphFor('resources', meta)
  const total = CONTENT_GROUPS.reduce((n, g) => n + g.pages.length, 0)

  return {
    ...base,
    '@graph': [
      ...base['@graph'],
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/resources#collection`,
        url: `${SITE_URL}/resources`,
        name: meta.title,
        description: meta.description,
        inLanguage: 'en-IN',
        about: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        numberOfItems: total,
        hasPart: CONTENT_GROUPS.map((g) => ({ '@id': listId(g.id) })),
      },
      ...CONTENT_GROUPS.map(itemList),
    ],
  }
}
