import { COMMON_FAQS, PROOF_TIME } from '../shared'

export default {
  slug: 'guides/logo-artwork-for-bottle-printing',
  title: 'Preparing Logo Artwork for Bottle Label Printing | AquaVia',
  description:
    'File formats, resolution, bleed, colour space and the seam and curvature problems specific to bottle labels — what to send so your first proof is also your last.',
  keywords:
    'logo file for printing, vector logo bottle label, artwork bleed label printing, CMYK vs RGB logo, 300dpi logo print',
  h1: 'How to Prepare Logo Artwork for Bottle Label Printing',
  breadcrumb: 'Artwork for bottle printing',
  linkText: 'preparing artwork for print',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'Send vector artwork — SVG, AI or PDF — with fonts converted to outlines, colours specified in CMYK or Pantone, and 3mm of bleed on every edge. If only a raster file exists, it must be at least 300dpi at printed size. Keep logos and text away from the label seam and the bottle’s curved edges.',

  keyFacts: [
    { term: 'Preferred formats', detail: 'SVG, AI, EPS or PDF (vector)' },
    { term: 'Acceptable raster', detail: 'PNG or TIFF at 300dpi or better at final printed size' },
    { term: 'Bleed', detail: '3mm beyond the trim on every edge' },
    { term: 'Colour space', detail: 'CMYK or Pantone references, not RGB' },
    { term: 'Fonts', detail: 'Converted to outlines or supplied with the file' },
    { term: 'Proof turnaround', detail: PROOF_TIME },
  ],

  sections: [
    {
      id: 'vector',
      heading: 'Why vector, and what it actually means',
      body: [
        'A vector file describes your logo as mathematics — points, curves and fills — rather than as a grid of pixels. Scale it to a stadium banner or down to a 250ml label and the edges stay exactly as sharp, because the shapes are recalculated at whatever size is needed.',
        'A raster file is a fixed grid. Enlarge it and there is no additional information to draw with, so the software invents intermediate pixels and the result softens. This is why a logo that looks perfect on a website frequently prints badly: the website version was made for a screen at 72–96 pixels per inch, and a press wants 300 dots per inch at final size.',
        'If your designer or agency produced the logo, they have the vector original. Ask for the .ai or .svg, not a PNG export. It is the single change that most improves print quality and it costs nothing.',
      ],
    },
    {
      id: 'formats',
      heading: 'What to send',
      table: {
        caption: 'File formats, ranked',
        head: ['Format', 'Type', 'Verdict'],
        rows: [
          ['.ai / .eps', 'Vector', 'Ideal — the working original'],
          ['.svg', 'Vector', 'Ideal — check fonts are outlined'],
          ['.pdf', 'Either', 'Excellent if the contents are vector; check before assuming'],
          ['.png', 'Raster', 'Workable at 300dpi+ at final size; transparent background helps'],
          ['.tiff', 'Raster', 'Workable at 300dpi+; large files, no compression artefacts'],
          ['.jpg', 'Raster', 'Last resort — compression artefacts show badly on flat brand colours'],
          ['Screenshot / Word doc / slide', 'Raster', 'Not usable. We will have to redraw it, which is chargeable.'],
        ],
      },
      after: [
        'A PDF is ambiguous — it can contain vector artwork or a photograph of a logo. If you are unsure, zoom to 1600% in a PDF viewer: vector stays crisp, raster goes blocky.',
      ],
    },
    {
      id: 'resolution',
      heading: 'Resolution, in numbers you can check',
      body: [
        'If vector genuinely is not available, the raster file has to be big enough. The arithmetic is simple: multiply the printed width in inches by 300.',
      ],
      table: {
        caption: 'Minimum pixel dimensions for raster artwork',
        head: ['Printed width', 'Minimum pixels wide'],
        rows: [
          ['50mm (about 2in) — a logo on a 250ml label', '600 px'],
          ['100mm (about 4in) — a logo across a 500ml label', '1,200 px'],
          ['180mm (about 7in) — a full 1 litre wrap', '2,100 px'],
        ],
      },
      after: [
        'Check the actual pixel dimensions of your file rather than how it looks on screen. A 400-pixel-wide PNG will look perfect in an email and print soft at any useful size.',
      ],
    },
    {
      id: 'colour',
      heading: 'Colour: why your brand blue comes out different',
      body: [
        'Screens emit light and mix red, green and blue. Presses lay down ink and mix cyan, magenta, yellow and black. These are not two ways of describing the same set of colours — they are two different, partially overlapping sets.',
        'Some colours that are trivial on a screen simply cannot be reproduced in CMYK ink. Bright saturated greens and oranges are the usual casualties, along with vivid purples. Converted for print they come back duller, and no amount of adjustment on press recovers what the ink cannot physically produce.',
        'The fix is to decide the print colour deliberately rather than discover it on a proof. Supply Pantone references if your brand has them, or CMYK values if it does not. If your brand guidelines only specify hex codes, that is a gap worth closing with your designer before you print anything at all — not just water bottles.',
      ],
    },
    {
      id: 'bottle-specific',
      heading: 'Three problems specific to bottles',
      body: [
        'A bottle label is not a flat rectangle, and three things catch people out that would never arise on a business card.',
      ],
      steps: [
        { term: 'Bleed', detail: 'Extend your background artwork 3mm past the trim on every edge. Cutting is accurate but not perfect, and artwork that stops exactly at the trim line will show a white sliver on one side.' },
        { term: 'The seam', detail: 'A wrap label overlaps itself where the two ends meet. Anything crossing that zone is interrupted — a logo split across the seam looks like a printing fault. Keep critical elements well clear of it and tell us if you have a preference for where the seam falls.' },
        { term: 'Curvature', detail: 'The label wraps a cylinder, so only the central third faces the viewer at any moment. Text near the left and right edges of a flat proof will be curving away and hard to read. Put the logo and the one thing you most want read in the middle.' },
      ],
      after: [
        'These three account for the large majority of "the proof looked fine but the bottle looks wrong" conversations in this category.',
      ],
    },
    {
      id: 'checklist',
      heading: 'Pre-send checklist',
      list: [
        'Vector original located, or raster confirmed at 300dpi at final size',
        'Fonts converted to outlines, or the font files supplied alongside',
        'Colours specified as Pantone or CMYK, not hex',
        '3mm bleed on every edge of any full-bleed artwork',
        'Logo and key text kept clear of the seam and the curved edges',
        'Any QR code tested at printed size, on a curved surface',
        'Required regulatory or event text included — it is easier now than after approval',
      ],
      after: [
        `Send all of it in one message. The first proof comes back within ${PROOF_TIME}, revisions turn around the same day, and the artwork is almost never what delays a run — waiting for a decision on it is.`,
      ],
    },
  ],

  faqs: [
    { q: 'What file format should I send my logo in for printing?', a: 'Vector: SVG, AI, EPS or a vector PDF. These scale to any size with no loss of sharpness. A PNG or TIFF works if it is at least 300dpi at the final printed size.' },
    { q: 'What resolution does a bottle label need?', a: '300dpi at printed size. For a logo printed 100mm wide that means at least 1,200 pixels across. Check the file’s actual pixel dimensions rather than how it looks on screen.' },
    { q: 'Why does my logo print a different colour than on screen?', a: 'Screens use RGB light; presses use CMYK ink, and some RGB colours — especially bright greens, oranges and purples — cannot be reproduced in ink at all. Supply Pantone or CMYK values so the print colour is chosen deliberately.' },
    { q: 'How much bleed do I need on a bottle label?', a: '3mm beyond the trim on every edge for any artwork that runs to the edge. Without it, normal cutting tolerance will leave a visible white sliver.' },
    { q: 'Can I put a QR code on a water bottle label?', a: 'Yes, but test it at printed size on a curved surface before approving the proof. A code that scans reliably on a flat screen can fail when wrapped around a bottle, particularly at smaller sizes.' },
    ...COMMON_FAQS.slice(0, 1),
  ],

  related: [
    'guides/water-bottle-label-materials',
    'specifications',
    'guides/corporate-gifting-branded-water',
  ],
}
