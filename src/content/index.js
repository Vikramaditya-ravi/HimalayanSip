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

/** Grouping used by llms.txt and by the footer's link columns. */
export const CONTENT_GROUPS = [
  { name: 'Reference', pages: [faq, specifications] },
  {
    name: 'Guides',
    pages: [
      customWaterBottleCost, brandedWaterBottleMoq, standards, mineralVsPackaged,
      idealTds, howRoFiltrationWorks, labelMaterials, logoArtwork,
      bottledWaterForWeddings, corporateGifting,
    ],
  },
  {
    name: 'Who we supply',
    pages: [
      hotelsAndResorts, corporateOffices, weddingsAndEvents,
      restaurantsAndCafes, hospitalsAndClinics, gymsAndWellness,
    ],
  },
  { name: 'Where we deliver', pages: [delhi, gurugram, noida, faridabad, ghaziabad] },
]
