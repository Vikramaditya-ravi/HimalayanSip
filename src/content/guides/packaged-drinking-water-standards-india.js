import { COMMON_FAQS } from '../shared'

/**
 * The standards explainer.
 *
 * Nothing on this page depends on AquaVia holding any licence of its own. It is
 * an accurate account of public Indian standards — which is genuine expertise,
 * is what buyers in this category actually search for, and is the kind of page
 * an answer engine cites because it can be checked.
 *
 * Where AquaVia's own position is relevant it is stated plainly, including the
 * part that is inconvenient: the licences sit with the bottling partner.
 */
export default {
  slug: 'guides/packaged-drinking-water-standards-india',
  title: 'BIS IS 14543, IS 10500 and FSSAI: Water Standards in India | AquaVia',
  description:
    'What IS 14543, IS 13428 and IS 10500 each cover, how BIS certification differs from an FSSAI licence, and which one applies to packaged drinking water sold under your own brand.',
  keywords:
    'IS 14543, BIS packaged drinking water, IS 10500 drinking water standard, FSSAI water licence, ISI mark water bottle',
  h1: 'Packaged Drinking Water Standards in India: BIS, ISI and FSSAI',
  breadcrumb: 'Water standards in India',
  linkText: 'the Indian water standards explained',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'In India, packaged drinking water is governed by BIS standard IS 14543 and natural mineral water by IS 13428, both requiring an ISI mark under mandatory BIS certification. IS 10500 is the specification for ordinary drinking water and does not apply to packaged product. An FSSAI licence is separately required to manufacture or sell.',

  keyFacts: [
    { term: 'IS 14543', detail: 'BIS standard for packaged drinking water (other than natural mineral water). Mandatory certification; ISI mark required.' },
    { term: 'IS 13428', detail: 'BIS standard for packaged natural mineral water. Also mandatory, also ISI-marked.' },
    { term: 'IS 10500', detail: 'BIS specification for drinking water generally — the benchmark used for tap and supply water. Not the packaged-product standard.' },
    { term: 'FSSAI licence', detail: 'Required separately under the Food Safety and Standards Act to manufacture, repack or sell. BIS certification does not replace it.' },
    { term: 'ISI mark', detail: 'The visible evidence of BIS certification, printed with the licence number (CM/L-…) on the label.' },
    { term: 'Who holds what', detail: 'Certification attaches to the manufacturing premises and the brand under which product is sold.' },
  ],

  sections: [
    {
      id: 'three-standards',
      heading: 'Three standards people confuse constantly',
      body: [
        'Almost every argument about bottled water quality in India comes down to someone quoting the wrong standard. There are three in regular circulation and they do not do the same job.',
      ],
      table: {
        caption: 'What each standard covers',
        head: ['Standard', 'Applies to', 'Certification'],
        rows: [
          ['IS 14543', 'Packaged drinking water — treated water, sealed in a container for sale', 'Mandatory BIS certification, ISI mark'],
          ['IS 13428', 'Packaged natural mineral water — from a protected source, minimally treated', 'Mandatory BIS certification, ISI mark'],
          ['IS 10500', 'Drinking water in general, including piped supply', 'A specification, not a product certification scheme'],
        ],
      },
      after: [
        'The practical distinction: IS 10500 tells you what drinking water should contain. IS 14543 and IS 13428 are the schemes under which a company is licensed to sell water in a sealed bottle, and they carry an audit regime, a licence number and a mark on the label.',
        'A supplier saying "our water meets IS 10500" is making a weaker claim than it sounds. For packaged product, IS 14543 is the relevant standard, and it is a licence, not a self-assessment.',
      ],
    },
    {
      id: 'bis-vs-fssai',
      heading: 'BIS certification and FSSAI licensing are different things',
      body: [
        'These are two separate regulatory regimes and a compliant operation needs both. They are routinely conflated, including by suppliers.',
      ],
      list: [
        { term: 'BIS (Bureau of Indian Standards)', detail: 'Certifies that a product made at a specific premises conforms to a specific standard. For packaged drinking water this is compulsory. The output is a licence number and the right to print the ISI mark.' },
        { term: 'FSSAI (Food Safety and Standards Authority of India)', detail: 'Licenses food businesses — manufacturers, repackers, marketers and sellers. The output is a 14-digit licence number that must appear on the label.' },
      ],
      after: [
        'One does not substitute for the other. A plant with BIS certification and no FSSAI licence is not compliant, and neither is the reverse.',
        'Note the different objects: BIS certifies a product at a premises; FSSAI licenses a business. That difference is exactly what matters if you are selling water under your own brand and someone else is bottling it.',
      ],
    },
    {
      id: 'own-brand',
      heading: 'What this means if you sell water under your own brand',
      body: [
        'This is the part most private-label buyers do not expect, and it is worth raising with your own advisor rather than taking on trust from any supplier, including us.',
        'When water is bottled by one company and sold under another company’s brand, the regulatory obligations do not all sit with the bottler. In India, the brand owner marketing packaged drinking water generally needs its own FSSAI licence, and the label is expected to carry the manufacturer’s details along with the BIS licence number for the plant that filled it.',
        'The label is where this becomes visible. A compliant packaged drinking water label carries the ISI mark with the BIS licence number, the FSSAI licence number, the manufacturer’s name and address, the batch, the date of packaging and the best-before.',
      ],
      after: [
        'If you are commissioning branded water for internal use — bottles handed to your own guests, staff or delegates — your exposure is different from a company reselling water commercially. Either way, the question to ask your supplier is specific: which licence numbers will appear on my label, and whose are they?',
      ],
    },
    {
      id: 'aquavia',
      heading: 'Where AquaVia stands',
      body: [
        'Stated plainly, because a page about certification that is vague about its own position is not worth reading.',
        'AquaVia is the brand owner. The water is filled at a partner plant, and the BIS and FSSAI licences for that plant are held by the bottling partner, not by AquaVia. We do not claim ISI certification in our own name and you will not find an ISI mark attributed to AquaVia anywhere on this site.',
        'We have not published the plant’s licence numbers here because we have not yet been supplied with them. When we are, they will appear on this page attributed to the partner, which is the only honest form the claim can take. If your procurement process needs them before then, ask and we will obtain them.',
      ],
    },
    {
      id: 'checklist',
      heading: 'How to check a supplier',
      steps: [
        { term: 'Ask for the BIS licence number', detail: 'It has the form CM/L-XXXXXXX and is tied to a specific plant address. A supplier who cannot produce it on request is telling you something.' },
        { term: 'Ask for the FSSAI number', detail: 'Fourteen digits. Verify it names the entity you think it does.' },
        { term: 'Check the standard cited', detail: 'For packaged drinking water it should be IS 14543. If a supplier cites IS 10500 for bottled product, ask why.' },
        { term: 'Look at an actual bottle', detail: 'Not a rendering. The ISI mark, licence numbers, packaging date and best-before should all be legible on the label.' },
        { term: 'Ask who holds what', detail: 'If the brand is not the bottler, establish which licences sit with which party before you order, not after.' },
      ],
    },
  ],

  faqs: [
    { q: 'Is BIS certification mandatory for packaged drinking water in India?', a: 'Yes. Packaged drinking water under IS 14543 and packaged natural mineral water under IS 13428 both fall under mandatory BIS certification, and the ISI mark with the licence number must appear on the label.' },
    { q: 'What is the difference between IS 14543 and IS 10500?', a: 'IS 14543 is the product standard and certification scheme for packaged drinking water sold in sealed containers. IS 10500 is the general specification for drinking water, used as a quality benchmark for supply water. They are not interchangeable, and only IS 14543 comes with a licence.' },
    { q: 'Does an FSSAI licence cover BIS requirements?', a: 'No. They are separate regimes with separate obligations. A packaged drinking water operation needs both.' },
    { q: 'Do I need my own FSSAI licence to sell water under my brand?', a: 'Generally yes — in India the brand owner marketing packaged drinking water is expected to hold its own FSSAI licence, with the manufacturer’s BIS details on the label. Confirm your specific position with a compliance advisor; it depends on whether you are reselling or distributing internally.' },
    { q: 'Does AquaVia hold BIS certification?', a: 'No. The bottling partner holds the BIS and FSSAI licences for the plant. AquaVia is the brand owner and does not hold them in its own name, and does not claim to.' },
    ...COMMON_FAQS.slice(0, 1),
  ],

  related: [
    'guides/mineral-water-vs-packaged-drinking-water',
    'guides/ideal-tds-drinking-water',
    'guides/how-ro-filtration-works',
  ],
}
