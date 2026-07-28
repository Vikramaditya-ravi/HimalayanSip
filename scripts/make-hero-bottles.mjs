/**
 * Cuts the hero bottle group out of the concept artwork.
 *
 *   node scripts/make-hero-bottles.mjs
 *   assets/hero-concept.png  ->  public/hero-bottles.webp
 *
 * The source is a full 1536x1024 page mockup with the bottles composited onto
 * its own near-black background, so two things have to happen: crop to the art,
 * and give it an alpha channel.
 *
 * Alpha is derived from luminance rather than keyed on a colour. The surround
 * is not one flat colour — it carries a soft blue-teal glow that ramps from
 * roughly rgb(0,4,17) in the corners to rgb(1,15,32) beside the bottles — so
 * any single-colour key leaves a halo. Luminance handles it because the thing
 * that distinguishes art from background here IS brightness: below LO it is
 * background, above HI it is art, and the ramp between is exactly the soft
 * glow, which should be semi-transparent anyway.
 *
 * The alternative was to leave the crop opaque and composite it with
 * mix-blend-mode:screen. That works only while the page behind it stays
 * near-black — screen over the hero's #080D16 still lifts the surround to about
 * rgb(8,33,58), a visible blue rectangle. Baking alpha instead means the art
 * composites correctly on any background, needs no @supports guard, and costs
 * nothing at runtime.
 *
 * To re-cut with different bounds, edit CROP and re-run. To replace the artwork
 * with a real high-resolution render later, drop it in as assets/hero-concept.png
 * (or point SRC at it) and re-run — nothing downstream knows the difference.
 */
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'assets/hero-concept.png')
const OUT = resolve(ROOT, 'public/hero-bottles.webp')

/**
 * Bounds measured off the source rather than eyeballed. In the 1536x1024
 * original the bottles occupy x 794..1442 and y 188..~840; the ripple's glow
 * spreads well past that on both sides. The crop is deliberately wider than the
 * bottles so the glow is carried with them instead of being sliced off, and
 * stops above y=855 where the concept's own sample-bottle card begins — that
 * card is real DOM on our page and must not arrive as pixels.
 */
const CROP = { left: 700, top: 170, width: 836, height: 680 }

/** Luminance below LO is background, above HI is art; between is the glow. */
const LO = 10
const HI = 62

/**
 * Edge feather in px, per side. Only needed where the crop cuts through lit
 * pixels: the left edge runs straight through the ripple's glow and ends in a
 * hard vertical line without it.
 *
 * The top is deliberately tiny. Above the bottles the source is already black,
 * so the luminance ramp alone hides that edge — and the gold cap starts just
 * 18px below the crop line, so a wide top feather does not soften a seam, it
 * dissolves the cap.
 */
const FEATHER = { left: 110, top: 10, right: 24, bottom: 64 }

/**
 * Regions forced transparent, in crop-local coordinates.
 *
 * The concept is a whole page mockup, so its own UI is painted into the same
 * pixels as the art. The tail of its stats row — "…Design Turnaround" — sits at
 * source x 700..799, y 717..788, which lands inside this crop. Our page renders
 * that line as real text, so it cannot also arrive as part of the image; left
 * in, it double-prints under the real stats row.
 *
 * The source's bottles start at x=794, so the redaction stops at local x=92 to
 * avoid clipping the teal bottle. `fade` softens the rectangle's own edges so
 * removing it does not leave a rectangular hole in the surrounding ripple glow.
 */
const REDACT = [
  { x0: 0, y0: 534, x1: 92, y1: 632, fade: 26 },
]

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Smoothstep, so the glow ramp has no banding where it meets full transparency. */
const smooth = (t) => t * t * (3 - 2 * t)

/** 1 outside every redaction rect, 0 well inside one, smooth across the border. */
function redactionFactor(x, y) {
  let f = 1
  for (const r of REDACT) {
    if (x < r.x0 - r.fade || x > r.x1 + r.fade || y < r.y0 - r.fade || y > r.y1 + r.fade) continue
    // Signed distance to the rect, negative inside, normalised over `fade`.
    const dx = Math.max(r.x0 - x, x - r.x1)
    const dy = Math.max(r.y0 - y, y - r.y1)
    const d = Math.max(dx, dy)
    f = Math.min(f, smooth(clamp01(d / r.fade)))
  }
  return f
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`Missing source artwork: ${SRC}`)
    process.exit(1)
  }

  const { data, info } = await sharp(SRC)
    .extract(CROP)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: W, height: H, channels } = info
  if (channels !== 4) throw new Error(`expected RGBA, got ${channels} channels`)

  let opaque = 0
  for (let y = 0; y < H; y++) {
    // Distance-based falloff from each edge, combined multiplicatively so the
    // corners fade on both axes at once.
    const fTop = clamp01(y / FEATHER.top)
    const fBottom = clamp01((H - 1 - y) / FEATHER.bottom)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]

      const fLeft = clamp01(x / FEATHER.left)
      const fRight = clamp01((W - 1 - x) / FEATHER.right)
      const edge = smooth(Math.min(fTop, fBottom, fLeft, fRight))

      const a = smooth(clamp01((lum - LO) / (HI - LO))) * edge * redactionFactor(x, y)
      data[i + 3] = Math.round(a * 255)
      if (a > 0.99) opaque++
    }
  }

  mkdirSync(dirname(OUT), { recursive: true })
  const out = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 85, effort: 6 })
    .toFile(OUT)

  console.log(`${W}x${H}  ->  ${OUT.replace(ROOT, '.')}`)
  console.log(`${(out.size / 1024).toFixed(1)} KB   fully opaque: ${((opaque / (W * H)) * 100).toFixed(1)}% of pixels`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
