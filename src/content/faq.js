import { PRICING_TIERS, PRODUCTS } from '../site/data'
import { CLAIMS } from '../site/claims'
import { LEAD_TIME, MOQ_LINE, PROOF_TIME, SERVICE_AREA, HOURS, UNIT_NOTE } from './shared'

/**
 * The site's answer page.
 *
 * The seven questions that used to live inside /pricing answered the pricing
 * page. This answers the category: everything a buyer asks between "can you put
 * my logo on a bottle" and "send me a proforma", plus the questions they ask an
 * assistant instead of asking us.
 *
 * Grouped rather than listed flat, because twenty-eight questions in one column
 * is a wall. Each group is its own <h2>, each question its own <h3>, and the
 * FAQPage JSON-LD mirrors all of them.
 */

const ordering = [
  { q: 'What does AquaVia actually sell?', a: 'Custom branded packaged drinking water. You supply a logo and artwork; we print it as a label, apply it to 250ml, 500ml or 1 litre bottles filled at our bottling partner’s plant, and deliver the cases to you in bulk across Delhi NCR.' },
  { q: 'What is the minimum order quantity?', a: `${MOQ_LINE}. ${UNIT_NOTE} Each of those is one batch, which is a full mini-truck load — the same minimum counted in three sizes.` },
  { q: 'Can I mix bottle sizes in a single order?', a: 'Yes. Sizes can be mixed freely as long as the combined quantity fills a mini truck. One full truck is 100 units of 1 litre, 145 units of 500ml or 180 units of 250ml — a unit being a case of 12, 24 or 36 bottles — so half a load of one size plus half a load of another clears the minimum just as a single size does.' },
  { q: 'How is pricing structured?', a: `Per case, across three partnership tiers set by weekly dispatch volume: ${PRICING_TIERS.map((t) => `${t.name} (${t.dispatches})`).join(', ')}. Rates start at ₹${PRICING_TIERS[0].prices['1000 ML']} per case of 12 × 1 litre and fall as dispatch frequency rises. GST and transportation are included.` },
  { q: 'Why is pricing based on dispatch frequency rather than order size?', a: 'Because that is what drives the cost of serving an account. A hotel taking two pallets a week costs less per case to serve than a company taking the same annual volume in four one-off deliveries, and the tiers reflect that rather than pretending otherwise.' },
  { q: 'Do you charge for label design?', a: 'Label setup from supplied artwork is included. If you need the label designed rather than laid out — no brand assets, no existing artwork — say so when you enquire and we will quote it separately.' },
  { q: 'Is there a charge for a sample?', a: 'No. Message the sales desk with your logo and rough quantity and we will arrange a sample bottle so you can see the print and the stock before committing.' },
]

const artwork = [
  { q: 'What file format should I send my logo in?', a: 'Vector is best: SVG, AI or PDF. Vector artwork scales to label size with no loss, so the print is as sharp as the press allows. A PNG is workable if it is at least 300dpi at the printed size — roughly 1,200 pixels wide for a 500ml wrap.' },
  { q: 'Why does my logo look fine on screen but print badly?', a: 'Screens are around 72–96 pixels per inch; presses want 300 dots per inch at final size. A logo lifted from a website is typically a quarter of the resolution the label needs, so edges that look crisp on a monitor come out soft on paper. Send the original vector file if you have it.' },
  { q: 'Can you match my exact brand colours?', a: 'Send Pantone or CMYK references and we will match as closely as the process allows. Be aware that a colour specified in RGB for screen will shift when converted for print — particularly bright greens and oranges, which sit outside the CMYK gamut.' },
  { q: 'How many revisions do I get on the proof?', a: `Revisions are unlimited until you approve. Each round turns around the same day; the first proof arrives within ${PROOF_TIME} of us receiving artwork.` },
  { q: 'Can I put more than a logo on the label?', a: 'Yes. Event dates, QR codes, hashtags, a tagline, a wedding monogram, nutritional or regulatory text — the whole label area is yours. QR codes should be tested at printed size before approval, because a code that scans on a screen can fail on a curved bottle.' },
]

const product = [
  { q: 'What kind of water is it?', a: `Packaged drinking water, treated at ${CLAIMS.filtrationStages.attribution}’s plant. That is a specific regulatory category in India, distinct from natural mineral water — see the guide comparing the two.` },
  { q: 'How is the water treated?', a: 'Seven stages in sequence: back-wash sand filter, double Y-strainer, CTO carbon block, sediment filter, reverse osmosis membrane, activated carbon, and finally ozonation to sterilise the water inside the sealed bottle.' },
  { q: 'What is the TDS of AquaVia water?', a: 'We have not published a figure, because we have not been supplied with a current lab report and we will not publish a number we cannot evidence. Ask us and we will request it from the plant for your file.' },
  { q: 'Does AquaVia hold a BIS or FSSAI licence?', a: 'The licences are held by the bottling partner for the plant, not by AquaVia as the brand owner. If your procurement or tender process requires licence details, ask and we will obtain the plant’s from the partner.' },
  { q: 'What is the shelf life?', a: 'Packaged drinking water in India is typically labelled with a best-before of six months from packaging. The date is printed on each bottle; ask for current stock dating if you are ordering ahead of a dated event.' },
  { q: 'What are the bottles made of?', a: 'Food-grade PET, the standard for packaged drinking water in this category. They are recyclable through normal PET streams.' },
]

const logistics = [
  { q: 'Which areas do you deliver to?', a: `${SERVICE_AREA}. Anything outside Delhi NCR is quoted case by case rather than refused outright — ask.` },
  { q: 'How long does an order take?', a: `A proof in ${PROOF_TIME}, then ${LEAD_TIME} for production and delivery once you approve it. The production window is rarely the constraint; artwork approval usually is.` },
  { q: 'Can you handle a rush order?', a: 'Often, yes. Tell us the date you need stock on site rather than the date you would like to order, and we will tell you honestly whether it is achievable.' },
  { q: 'How are the bottles delivered?', a: 'By the case, on a cold-chain vehicle. Tell us if the delivery point has no lift, a loading-bay time window, or a security process that needs a gate pass — these are the things that turn a routine delivery into a failed one.' },
  { q: 'Can you deliver to multiple sites on one order?', a: 'Yes. Multi-site splits are common for office groups and hotel chains. Give us the split by address when you order rather than after.' },
  { q: 'Do you store stock for us?', a: 'For recurring accounts on the Preferred and Enterprise tiers we schedule regular dispatches rather than holding your stock, which keeps the water fresh and your storage free. Talk to us about a dispatch schedule.' },
]

const commercial = [
  { q: 'What are your payment terms?', a: 'Discussed at quotation and set by tier and order size. Ask the sales desk — we would rather agree terms in writing at the start than surprise you at invoice.' },
  { q: 'Can you raise a proforma invoice for our procurement system?', a: 'Yes. Email info@aquaviaworld.com with your entity details, GSTIN and the quantity, and we will issue one.' },
  { q: 'Do you supply against tenders?', a: 'Yes. Send the tender document; if there is a compliance requirement we cannot meet — a certification held in the brand owner’s own name, for example — we will tell you that up front rather than after you have shortlisted us.' },
  { q: 'How do I reach a person?', a: `WhatsApp or call +91 76248 03460, ${HOURS.toLowerCase()}, or email info@aquaviaworld.com any time. There is no contact form on this site — these reach the people who actually price the order.` },
]

const GROUPS = [
  { id: 'ordering', heading: 'Ordering, minimums and pricing', faqs: ordering },
  { id: 'artwork', heading: 'Artwork, labels and proofs', faqs: artwork },
  { id: 'water', heading: 'The water and the bottle', faqs: product },
  { id: 'delivery', heading: 'Delivery and logistics', faqs: logistics },
  { id: 'commercial', heading: 'Commercial and paperwork', faqs: commercial },
]

export default {
  slug: 'faq',
  title: 'Custom Branded Water Bottles — FAQ | AquaVia',
  description:
    'Answers on minimum order quantities, per-case pricing, artwork formats, water treatment, licensing, delivery across Delhi NCR and commercial terms for custom branded bottled water.',
  keywords:
    'custom water bottle FAQ, branded water bottle minimum order, bulk water bottle questions India, private label water FAQ',
  h1: 'Custom Branded Water Bottles: Frequently Asked Questions',
  breadcrumb: 'FAQ',
  linkText: 'the full FAQ',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia prints your branding on 250ml, 500ml and 1 litre packaged drinking water bottles for businesses across Delhi NCR. Minimum orders start at 100 units, pricing is per case across three volume tiers, proofs return in 24–48 hours, and delivery takes 2–3 business days after approval.',

  // Rendered as grouped sections, and flattened into one FAQPage node so every
  // question is individually addressable by a search or answer engine.
  sections: GROUPS.map((g) => ({
    id: g.id,
    heading: g.heading,
    list: g.faqs.map((f) => ({ term: f.q, detail: f.a })),
  })),

  // The sections above already render every question; this list exists so the
  // FAQPage schema carries all of them. See the note in render.jsx.
  faqBlock: false,
  faqs: GROUPS.flatMap((g) => g.faqs),

  related: [
    'specifications',
    'guides/branded-water-bottle-moq',
    'guides/custom-water-bottle-cost-india',
    'guides/packaged-drinking-water-standards-india',
  ],
}
