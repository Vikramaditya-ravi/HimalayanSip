import { FILTRATION_STAGES } from '../../site/data'
import { CLAIMS } from '../../site/claims'
import { COMMON_FAQS } from '../shared'

export default {
  slug: 'guides/how-ro-filtration-works',
  title: 'How Seven-Stage RO Water Filtration Works | AquaVia',
  description:
    'A stage-by-stage account of how packaged drinking water is treated: sand filtration, straining, carbon, sediment, reverse osmosis, activated carbon and ozonation — and what each step actually removes.',
  keywords:
    'how RO filtration works, 7 stage water filtration, reverse osmosis process, ozonation water treatment, water bottling plant process',
  h1: 'How Seven-Stage Water Filtration Works, Stage by Stage',
  breadcrumb: 'How RO filtration works',
  linkText: 'how the seven filtration stages work',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'Commercial water treatment runs in sequence from coarse to fine: sand filtration removes grit, strainers and sediment filters take out progressively smaller particles, carbon removes chlorine and organics, a reverse osmosis membrane strips dissolved solids and metals, and ozonation sterilises the water inside the sealed bottle.',

  keyFacts: [
    { term: 'Number of stages', detail: `${FILTRATION_STAGES.length}, run in sequence` },
    { term: 'Order principle', detail: 'Coarse to fine — each stage protects the more delicate one downstream' },
    { term: 'What RO removes', detail: 'Dissolved solids, heavy metals, microbiological contaminants' },
    { term: 'Final step', detail: 'Ozonation, which sterilises the water inside the sealed bottle' },
    { term: 'Why minerals are added back', detail: 'RO strips minerals indiscriminately; water below ~30 ppm tastes flat' },
    { term: 'Operated by', detail: CLAIMS.filtrationStages.attribution },
  ],

  sections: [
    {
      id: 'principle',
      heading: 'The principle: coarse to fine',
      body: [
        'Every stage in a well-designed water treatment line exists to protect the stage after it. That is the whole logic, and once you see it the sequence stops looking like marketing and starts looking like engineering.',
        'A reverse osmosis membrane is a precision component with pores measured in fractions of a nanometre. Send raw water at it and it fouls within days: sand abrades it, silt blinds it, chlorine chemically degrades the polyamide film it is made from. Everything upstream of the membrane is there so the membrane sees water it can survive.',
        'So the sequence runs from the crudest filtration to the finest, with the expensive and delicate elements last. Skipping a stage does not just remove that stage’s benefit — it shortens the life of everything downstream.',
      ],
    },
    {
      id: 'stages',
      heading: 'The seven stages',
      body: ['In the order the water passes through them.'],
      steps: FILTRATION_STAGES.map((s) => ({ term: `${s.num} — ${s.name}`, detail: s.purpose })),
    },
    {
      id: 'ro',
      heading: 'What reverse osmosis actually does',
      body: [
        'Reverse osmosis is the only stage in the sequence that removes dissolved substances rather than suspended ones. Everything before it is filtration in the ordinary sense: physically catching particles too large to pass. RO is different.',
        'Osmosis is the natural tendency of water to move across a semi-permeable membrane from the less concentrated side to the more concentrated one. Reverse osmosis applies pressure to drive water the other way — from concentrated to dilute — so that water molecules pass through the membrane and the dissolved solids do not. What comes through is the permeate; what is left behind, carrying the concentrated dissolved load, is the reject stream.',
        'This is why RO removes things no filter can catch: dissolved sodium, nitrates, fluoride, arsenic, lead. They are in solution, not in suspension, so there is nothing to strain out. The membrane excludes them by size and charge at the molecular level.',
      ],
      after: [
        'It is also why RO produces a reject stream at all — a genuine cost of the process, and one reason RO treatment is more expensive per litre than filtration alone.',
      ],
    },
    {
      id: 'ozone',
      heading: 'Why ozonation is last',
      body: [
        'The final stage is the one that matters most for a sealed bottle sitting in a warehouse for months, and the reason it comes last is specific.',
        'Ozone (O₃) is an unstable, powerful oxidant. Injected into the water immediately before filling, it destroys bacteria, viruses and fungi — and then decomposes back into ordinary oxygen within hours, leaving no residual taste or smell. The bottle is sealed while the ozone is still active, so the water is being sterilised inside the sealed container rather than before it.',
        'That timing is the point. Water sterilised and then exposed to a filling line, a cap and the air has been recontaminated in transit. Ozonating at the fill means the last thing to touch the water is a disinfectant that then disappears.',
      ],
      after: [
        'The alternative in common use is UV, which sterilises water passing a lamp but leaves no residual protection inside the bottle. Ozonation is the more robust choice for packaged product with a months-long shelf life.',
      ],
    },
    {
      id: 'remineralisation',
      heading: 'Putting the minerals back',
      body: [
        'A membrane that removes dissolved solids removes the good ones too. Calcium, magnesium and potassium are dissolved solids, and RO does not distinguish them from anything else.',
        'The result is water that is exceptionally clean and tastes empty. Almost every commercial packaged drinking water operation therefore adds a controlled mineral blend back after the membrane, which is why a bottle can legitimately list minerals without being natural mineral water — they are there by design rather than by geology.',
        'The trade-off is deliberate: strip everything, then add back exactly what you want, and you get the same water every single day regardless of what the source did that season. Consistency is the product.',
      ],
    },
    {
      id: 'what-to-ask',
      heading: 'What to ask a bottler',
      steps: [
        { term: 'How many stages, and in what order', detail: 'If sediment filtration comes after the RO membrane, ask why. The order tells you whether the line was designed or assembled.' },
        { term: 'Ozonation or UV', detail: 'Both are legitimate. Ozonation gives residual protection inside the sealed bottle; UV does not.' },
        { term: 'Is the water remineralised', detail: 'If not, expect it to taste flat, and expect half-finished bottles.' },
        { term: 'When was the membrane last changed', detail: 'A tired membrane still produces water; it just stops removing what it is there to remove.' },
        { term: 'Can I see the plant', detail: 'The best answer is yes.' },
      ],
    },
  ],

  faqs: [
    { q: 'What are the seven stages of water filtration?', a: 'Back-wash sand filter, double Y-strainer, CTO carbon block, sediment filter, reverse osmosis membrane, activated carbon, and ozonation. They run in that order because each stage protects the more delicate one after it.' },
    { q: 'What does reverse osmosis remove that a filter cannot?', a: 'Dissolved substances — sodium, nitrates, fluoride, arsenic, lead and other dissolved metals. These are in solution rather than suspension, so no physical filter can catch them; the RO membrane excludes them at the molecular level.' },
    { q: 'Why is ozone used instead of chlorine in bottled water?', a: 'Ozone is a powerful oxidant that decomposes back into oxygen within hours, leaving no taste or smell. Injected immediately before sealing, it sterilises the water inside the closed bottle and then disappears. Chlorine would leave a residual taste.' },
    { q: 'Does RO water need minerals added back?', a: 'For drinking, in practice yes. RO permeate is often below 20 ppm TDS and tastes flat, so commercial producers add a controlled calcium, magnesium and potassium blend afterwards.' },
    { q: 'Who operates the plant AquaVia uses?', a: 'A bottling partner. AquaVia is the brand owner and does not operate the plant or hold its BIS and FSSAI licences.' },
    ...COMMON_FAQS.slice(0, 1),
  ],

  related: [
    'guides/ideal-tds-drinking-water',
    'guides/packaged-drinking-water-standards-india',
    'guides/mineral-water-vs-packaged-drinking-water',
  ],
}
