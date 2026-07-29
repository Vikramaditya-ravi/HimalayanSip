/**
 * The content index.
 *
 * Every page under src/content is a data module — a title, an answer block,
 * some sections, some questions — and this is the one list that knows they
 * exist. It is imported by three things that must never disagree about what the
 * site publishes:
 *
 *   1. src/entries/content.jsx, which hydrates whichever page was served;
 *   2. scripts/prerender.mjs, which writes each page's HTML, the sitemap and
 *      llms.txt;
 *   3. scripts/gen-vercel.mjs, which writes the rewrite and redirect for each
 *      slug into vercel.json.
 *
 * Adding a page is therefore: write the module, add it here. The five
 * coordinated edits a new route used to need — a root .html, an entry file, a
 * vite input, a vercel rewrite, a sitemap entry — are all derived from this
 * array now, which is why there was never a blog before and why there can be
 * one now.
 */

import corporateOffices from './for/corporate-offices.js'
import gymsAndWellness from './for/gyms-and-wellness.js'
import hospitalsAndClinics from './for/hospitals-and-clinics.js'
import hotelsAndResorts from './for/hotels-and-resorts.js'
import restaurantsAndCafes from './for/restaurants-and-cafes.js'
import weddingsAndEvents from './for/weddings-and-events.js'

import bottledWaterForWeddings from './guides/bottled-water-for-weddings.js'
import brandedWaterBottleMoq from './guides/branded-water-bottle-moq.js'
import corporateGifting from './guides/corporate-gifting-branded-water.js'
import customWaterBottleCost from './guides/custom-water-bottle-cost-india.js'
import howRoFiltrationWorks from './guides/how-ro-filtration-works.js'
import idealTds from './guides/ideal-tds-drinking-water.js'
import labelMaterials from './guides/water-bottle-label-materials.js'
import logoArtwork from './guides/logo-artwork-for-bottle-printing.js'
import mineralVsPackaged from './guides/mineral-water-vs-packaged-drinking-water.js'
import standards from './guides/packaged-drinking-water-standards-india.js'

import delhi from './locations/delhi.js'
import faridabad from './locations/faridabad.js'
import ghaziabad from './locations/ghaziabad.js'
import gurugram from './locations/gurugram.js'
import noida from './locations/noida.js'

import faq from './faq.js'
import specifications from './specifications.js'

/**
 * Order matters only for llms.txt and the sitemap, where it decides what an
 * assistant reads first. Reference pages lead, because they are the ones written
 * to be quoted; then the guides; then who we serve; then where.
 */
export const CONTENT_PAGES = [
  faq,
  specifications,

  customWaterBottleCost,
  brandedWaterBottleMoq,
  standards,
  mineralVsPackaged,
  idealTds,
  howRoFiltrationWorks,
  labelMaterials,
  logoArtwork,
  bottledWaterForWeddings,
  corporateGifting,

  hotelsAndResorts,
  corporateOffices,
  weddingsAndEvents,
  restaurantsAndCafes,
  hospitalsAndClinics,
  gymsAndWellness,

  delhi,
  gurugram,
  noida,
  faridabad,
  ghaziabad,
]

const BY_SLUG = new Map(CONTENT_PAGES.map((p) => [p.slug, p]))

export function contentPageBySlug(slug) {
  return BY_SLUG.get(slug.replace(/^\//, '')) ?? null
}

/** The hub every content page hangs off. One constant, so nothing hardcodes it. */
export const RESOURCES_PATH = '/resources'

/**
 * The four categories, and everything a surface needs to present one.
 *
 * This used to be `{name, pages}` — enough for llms.txt and four footer columns
 * and nothing else. Every category is now a destination in its own right: it has
 * an `id` that is a real anchor on /resources, a `label` used in breadcrumbs and
 * menus, and a `blurb` that tells a reader what the category is for before they
 * click into it.
 *
 * `name` is kept as the llms.txt / footer heading it always was. The additions
 * are what let the navbar menu, the hub page, the breadcrumb trail and the
 * cross-page related blocks all be derived from this one list rather than from
 * four hand-kept copies of it.
 */
export const CONTENT_GROUPS = [
  {
    name: 'Reference',
    id: 'reference',
    label: 'Reference',
    blurb: 'The numbers and answers, stated once and kept current — every question a buyer asks, and every specification we can evidence.',
    pages: [faq, specifications],
  },
  {
    name: 'Guides',
    id: 'guides',
    label: 'Guides',
    blurb: 'Long-form explainers on cost, minimums, label stock, artwork and the standards packaged drinking water is held to in India.',
    pages: [
      customWaterBottleCost, brandedWaterBottleMoq, standards, mineralVsPackaged,
      idealTds, howRoFiltrationWorks, labelMaterials, logoArtwork,
      bottledWaterForWeddings, corporateGifting,
    ],
  },
  {
    name: 'Who we supply',
    id: 'who-we-supply',
    label: 'Who we supply',
    blurb: 'What branded water actually costs, and how it is specified, for each kind of business we deliver to.',
    pages: [
      hotelsAndResorts, corporateOffices, weddingsAndEvents,
      restaurantsAndCafes, hospitalsAndClinics, gymsAndWellness,
    ],
  },
  {
    name: 'Where we deliver',
    id: 'where-we-deliver',
    label: 'Where we deliver',
    blurb: 'Delivery, lead times and local specifics for each city in the Delhi NCR service area.',
    pages: [delhi, gurugram, noida, faridabad, ghaziabad],
  },
]

/** Which category a page belongs to. Used by breadcrumbs and by the hub. */
const GROUP_BY_SLUG = new Map(
  CONTENT_GROUPS.flatMap((g) => g.pages.map((p) => [p.slug, g])),
)

export function groupForPage(page) {
  return GROUP_BY_SLUG.get(page.slug) ?? null
}

/**
 * A content page's breadcrumb trail: Resources → its category → the page.
 *
 * Derived rather than declared per page, and read by BOTH the visible trail in
 * PageShell and the BreadcrumbList in the JSON-LD — the two are the same array,
 * so they cannot describe different site structures. A page may still override
 * it by declaring its own `trail`.
 *
 * The category crumb points at its section on the hub, which is a real anchor
 * that scrolls to that category's cards, not a URL invented for the schema.
 */
export function trailFor(page) {
  if (page.trail) return page.trail
  const path = `/${page.slug}`
  const group = groupForPage(page)
  return [
    { name: 'Resources', path: RESOURCES_PATH },
    ...(group ? [{ name: group.label, path: `${RESOURCES_PATH}#${group.id}` }] : []),
    { name: page.breadcrumb ?? page.h1, path },
  ]
}

/**
 * Every content page as a search entry.
 *
 * Site search indexed the home page's sections and nothing else, so the
 * twenty-three pages carrying most of the site's actual writing were
 * unsearchable on the site that published them. These carry an `href`, which
 * SiteSearch navigates to directly rather than resolving through SECTION_ROUTES.
 *
 * Lives here rather than in the SEARCH_INDEX in src/site/data.js because the
 * content modules import that file — building it there would be a cycle.
 */
export const CONTENT_SEARCH_ENTRIES = CONTENT_GROUPS.flatMap((g) =>
  g.pages.map((p) => ({
    id: `content-${p.slug}`,
    href: `/${p.slug}`,
    kind: g.label,
    title: p.breadcrumb ?? p.h1,
    body: `${p.description} ${p.keywords ?? ''}`,
  })),
)
