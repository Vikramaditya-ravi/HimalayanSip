import { serviceNode } from '../../site/schema'
import { COMMON_FAQS } from '../shared'

export default {
  slug: 'for/hospitals-and-clinics',
  title: 'Branded Bottled Water for Hospitals & Clinics | AquaVia',
  description:
    'Bottled water supply for hospitals, clinics and diagnostic centres across Delhi NCR — sizes by department, sealed single-serve hygiene, documentation for procurement, and scheduled delivery.',
  keywords:
    'hospital water bottle supply, clinic bottled water Delhi, healthcare water supplier NCR, patient water bottles branded',
  h1: 'Branded Bottled Water for Hospitals and Clinics',
  breadcrumb: 'Hospitals & clinics',
  linkText: 'bottled water for healthcare settings',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia supplies hospitals, clinics and diagnostic centres across Delhi NCR with sealed single-serve bottled water under the institution’s own branding — 500ml for patients and waiting areas, 1 litre for wards and staff. Plant licence documentation is available on request for procurement files.',

  keyFacts: [
    { term: 'Patient and waiting areas', detail: '500ml sealed single-serve' },
    { term: 'Wards and day-care', detail: '1 litre for bedside, 500ml for rounds' },
    { term: 'Diagnostics and phlebotomy', detail: '250ml — handed after a procedure' },
    { term: 'Staff and duty rooms', detail: '1 litre' },
    { term: 'Label stock', detail: 'BOPP film — survives cleaning regimes and wet surfaces' },
    { term: 'Documentation', detail: 'Plant BIS and FSSAI licence details available on request' },
  ],

  sections: [
    {
      id: 'why-sealed',
      heading: 'Why sealed single-serve matters here more than anywhere else',
      body: [
        'In most settings a bottle is a convenience. In a healthcare setting the seal is the product.',
        'A shared jug, a dispenser tap or a re-used glass is a shared surface in a building full of people with compromised immunity. A factory-sealed bottle removes an entire category of question: nobody has to establish who handled it, when it was filled, or whether the dispenser was cleaned on schedule. The seal answers all of it, visibly, to the patient as much as to the auditor.',
        'It also travels. A bottle goes to a bedside, into a wheelchair, out to an ambulance bay and home with a discharged patient without any of the logistics a dispenser network requires.',
      ],
    },
    {
      id: 'departments',
      heading: 'Sizes by department',
      table: {
        caption: 'Placement across a facility',
        head: ['Area', 'Size', 'Notes'],
        rows: [
          ['OPD and waiting areas', '500ml', 'High turnover; sealed single-serve'],
          ['Inpatient bedside', '1 litre', 'Lasts a shift; refills replaced rather than topped up'],
          ['Day-care and dialysis', '500ml', 'Portion control matters clinically in some cases'],
          ['Diagnostics, phlebotomy', '250ml', 'Handed to a patient after a procedure'],
          ['Attendant and visitor areas', '500ml', 'Often the highest-volume area in the building'],
          ['Duty rooms and staff', '1 litre', 'Cost per litre'],
          ['Ambulance and transport', '500ml', 'Sealed, portable, no spill risk'],
        ],
      },
    },
    {
      id: 'branding',
      heading: 'What own-branding does in a healthcare setting',
      body: [
        'The purpose here is different from hospitality, and it is worth being precise about it rather than borrowing the hospitality argument.',
        'A hospital’s own mark on a sealed bottle is a statement about provenance: this came from us, through our procurement, and we are accountable for it. In a context where a patient’s family is anxious and evaluating every signal in the building, that is not marketing — it is reassurance.',
        'It also removes an odd dissonance that large institutions rarely notice: a facility that is meticulous about every other input, handing out a random assortment of whatever bottled brands the local supplier had that week.',
      ],
    },
    {
      id: 'procurement',
      heading: 'Procurement and documentation',
      body: [
        'Healthcare procurement asks harder questions than most sectors, and they deserve a direct answer rather than a brochure.',
        'AquaVia is the brand owner. The water is filled at a partner plant, and the BIS certification under IS 14543 and the FSSAI licence for that plant are held by the bottling partner, not by AquaVia. We do not claim those licences in our own name.',
        'If your procurement or empanelment process requires licence numbers, batch traceability or a copy of the plant’s current certification, ask and we will obtain them from the partner for your file. If your process requires the certification to be held by the supplying entity itself, tell us at the outset and we will say plainly whether we can meet it rather than letting you discover it at the documentation stage.',
      ],
      after: [
        'The relevant standards, and the difference between BIS certification and FSSAI licensing, are explained in the guide to packaged drinking water standards in India.',
      ],
    },
    {
      id: 'supply',
      heading: 'Supply and delivery',
      body: [
        'Hospitals run continuously and consume predictably, which makes them well suited to a standing dispatch schedule — and standing schedules sit in the better rate tiers.',
        'The practical constraints in NCR facilities are almost always access rather than volume: a goods entrance with restricted hours, a service lift shared with clinical traffic, a security process requiring gate passes for every delivery. Give us those details once and we build them into the schedule.',
      ],
    },
  ],

  faqs: [
    { q: 'Why do hospitals use sealed bottled water rather than dispensers?', a: 'A factory seal removes questions a dispenser cannot answer — who handled it, when it was filled, whether the unit was cleaned on schedule. In a building with immunocompromised patients that is a meaningful reduction in shared-surface risk, and it is visible to patients as well as auditors.' },
    { q: 'Can a hospital have its own branding on the bottles?', a: 'Yes. Beyond presentation it establishes provenance — the water came through the institution’s own procurement, and the institution is accountable for it.' },
    { q: 'Can you provide BIS and FSSAI documentation for our procurement file?', a: 'We can obtain the plant’s licence details from the bottling partner on request. AquaVia is the brand owner and does not hold BIS or FSSAI certification in its own name; if your process requires the supplying entity to hold it, tell us at the outset.' },
    { q: 'What sizes work best across a hospital?', a: '500ml for OPD, waiting areas and attendants — the highest-volume areas. 1 litre at the bedside and in duty rooms. 250ml in diagnostics, handed to a patient after a procedure.' },
    { q: 'Can you work to a fixed weekly delivery schedule?', a: 'Yes, and it is the cheaper way to buy. Tell us the goods-entrance hours, lift access and gate-pass process once and we build the schedule around them.' },
    ...COMMON_FAQS,
  ],

  schema: () => [
    serviceNode({
      slug: 'for/hospitals-and-clinics',
      name: 'Bottled water supply for hospitals and clinics',
      description:
        'Sealed single-serve packaged drinking water under institutional branding for hospitals, clinics and diagnostic centres across Delhi NCR, on scheduled dispatch.',
    }),
  ],

  related: [
    'guides/packaged-drinking-water-standards-india',
    'specifications',
    'for/corporate-offices',
  ],
}
