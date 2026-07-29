import { COMMON_FAQS } from '../shared'

export default {
  slug: 'guides/ideal-tds-drinking-water',
  title: 'What Is the Ideal TDS for Drinking Water? | AquaVia',
  description:
    'What total dissolved solids actually measure, the BIS limits that apply in India, why very low TDS water tastes flat, and what range to look for in bottled water.',
  keywords:
    'ideal TDS drinking water, TDS level water India, TDS ppm bottled water, BIS TDS limit, low TDS RO water taste',
  h1: 'What Is the Ideal TDS for Drinking Water?',
  breadcrumb: 'Ideal TDS for drinking water',
  linkText: 'what TDS actually tells you',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'TDS measures total dissolved solids in water, in parts per million. For packaged drinking water in India, BIS IS 14543 sets a maximum of 500 ppm. Most people find water between roughly 50 and 250 ppm pleasant; below about 30 ppm it tends to taste flat, because dissolved minerals are what give water flavour.',

  keyFacts: [
    { term: 'What TDS measures', detail: 'Total dissolved solids — minerals, salts and metals dissolved in water, expressed in mg/L (equivalently ppm)' },
    { term: 'BIS limit, packaged drinking water', detail: '500 ppm maximum under IS 14543' },
    { term: 'IS 10500, general drinking water', detail: '500 ppm acceptable limit; 2,000 ppm permissible where no alternative source exists' },
    { term: 'Commonly preferred range', detail: 'Roughly 50–250 ppm for taste' },
    { term: 'Tastes flat below', detail: 'About 30 ppm' },
    { term: 'What TDS does NOT measure', detail: 'Bacteria, viruses, pesticides or most organic contaminants' },
  ],

  sections: [
    {
      id: 'what-it-is',
      heading: 'What TDS actually measures — and what it does not',
      body: [
        'Total dissolved solids is the combined weight of everything dissolved in water that is not water: calcium, magnesium, sodium, potassium, bicarbonates, chlorides, sulphates, and any dissolved metals. It is reported in milligrams per litre, which for water is numerically the same as parts per million.',
        'The critical thing to understand about TDS, and the reason so much marketing built on it is misleading: it is a single aggregate number that cannot distinguish a beneficial mineral from a harmful metal. Water at 150 ppm of calcium and magnesium and water at 150 ppm including dissolved lead read identically on a TDS meter.',
        'TDS also says nothing at all about microbiological safety. Bacteria and viruses are not dissolved solids. A water sample can read a perfect 80 ppm and be entirely unsafe to drink.',
      ],
      after: [
        'So TDS is a useful indicator of taste and of how hard the water is. It is not a safety test, and any supplier presenting a low TDS number as proof of purity is either confused or hoping you are.',
      ],
    },
    {
      id: 'limits',
      heading: 'The limits that apply in India',
      table: {
        caption: 'TDS limits under Indian standards',
        head: ['Standard', 'Applies to', 'TDS limit'],
        rows: [
          ['IS 14543', 'Packaged drinking water', '500 ppm maximum'],
          ['IS 13428', 'Packaged natural mineral water', 'Governed by source composition; declared on the label'],
          ['IS 10500', 'Drinking water generally', '500 ppm acceptable; up to 2,000 ppm permissible in the absence of an alternative source'],
        ],
      },
      after: [
        'Note that 500 ppm is a ceiling, not a target. A packaged product at 480 ppm is compliant and would taste noticeably mineral-heavy to most people.',
      ],
    },
    {
      id: 'taste',
      heading: 'Why very low TDS water tastes wrong',
      body: [
        'Water has no flavour of its own. Everything you taste when you drink water is the dissolved minerals in it, which is why water from different places tastes different and why people develop strong preferences.',
        'Reverse osmosis removes dissolved solids indiscriminately and efficiently — RO permeate frequently comes out below 20 ppm. That water is exceptionally clean and most people describe it as flat, empty or slightly metallic. It is not harmful; it is just unpleasant, in the way that unsalted food is unpleasant.',
        'This is the reason a remineralisation step exists in almost every commercial RO process. After the membrane strips the water, a controlled blend — typically calcium, magnesium and potassium — is re-introduced to bring it back into a range people enjoy drinking.',
      ],
      after: [
        'For a business buying bottled water, this matters more than it sounds. Water people do not enjoy drinking gets left half-finished on conference tables, which means you paid for bottles that ended up in a bin.',
      ],
    },
    {
      id: 'ranges',
      heading: 'What the ranges feel like',
      table: {
        caption: 'How TDS ranges are generally experienced',
        head: ['Range (ppm)', 'Character'],
        rows: [
          ['Under 30', 'Flat, empty. Typical of untreated RO permeate.'],
          ['50–150', 'Light and clean. What most premium bottled water sits around.'],
          ['150–250', 'Fuller, noticeably mineral. Many people prefer this with food.'],
          ['250–500', 'Distinctly hard and mineral. Compliant but polarising.'],
          ['Above 500', 'Outside the packaged drinking water limit in India.'],
        ],
      },
      after: [
        'There is no single correct answer inside the compliant range, which is why "ideal TDS" is a question about preference rather than a question with one number as its answer. If someone tells you 100 ppm is objectively ideal, they are describing their own taste.',
      ],
    },
    {
      id: 'meters',
      heading: 'On TDS meters',
      body: [
        'The handheld TDS pens sold everywhere measure electrical conductivity and convert it to an estimated TDS figure. They are inexpensive, broadly indicative, and routinely over-interpreted.',
        'What they can tell you: roughly how mineral-heavy a water is, and whether an RO membrane is still working.',
        'What they cannot tell you: whether the water is safe, what the dissolved solids actually are, or whether there is anything harmful present. A meter that reads 45 ppm is not evidence of purity; it is evidence of low mineral content.',
      ],
    },
    {
      id: 'aquavia',
      heading: 'AquaVia’s figure',
      body: [
        'We have not published one, and we are not going to estimate.',
        'The water is treated at a partner plant through reverse osmosis with minerals re-added afterwards, which places it in the range this page describes — but a range is not a measurement, and we have not been supplied with a current lab report we could stand behind. Publishing a plausible-looking number would be worse than publishing nothing.',
        'When the analysis reaches us, the TDS figure and the calcium, magnesium and potassium values will be published here with the report behind them. If you need the numbers before then for a tender or a specification, ask and we will request the current analysis from the plant.',
      ],
    },
  ],

  faqs: [
    { q: 'What is the ideal TDS level for drinking water?', a: 'There is no single ideal figure. Most people find water between roughly 50 and 250 ppm pleasant. Below about 30 ppm it tastes flat, and Indian packaged drinking water may not exceed 500 ppm under IS 14543.' },
    { q: 'Is low TDS water safe to drink?', a: 'Yes, low TDS water is safe — it is simply low in dissolved minerals and tends to taste flat. But low TDS is not evidence of safety, because TDS does not measure bacteria, viruses or most organic contaminants at all.' },
    { q: 'What is the maximum TDS allowed in packaged drinking water in India?', a: '500 ppm, under BIS standard IS 14543. That is a ceiling rather than a target; most bottled water sits well below it.' },
    { q: 'Does RO water have zero TDS?', a: 'Close to it before remineralisation — RO permeate is often under 20 ppm. Commercial producers add a controlled mineral blend back afterwards, because water at that level tastes flat.' },
    { q: 'Can a TDS meter tell me if water is safe?', a: 'No. A TDS meter estimates dissolved mineral content from electrical conductivity. It cannot detect microbiological contamination and cannot distinguish calcium from a dissolved heavy metal.' },
    ...COMMON_FAQS.slice(0, 1),
  ],

  related: [
    'guides/how-ro-filtration-works',
    'guides/mineral-water-vs-packaged-drinking-water',
    'guides/packaged-drinking-water-standards-india',
  ],
}
