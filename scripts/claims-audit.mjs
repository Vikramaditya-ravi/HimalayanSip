/**
 * Claims audit — prints what the site still cannot say.
 *
 * Runs as part of `npm run build`. It never fails the build: an outstanding
 * claim is a business gap, not a code defect, and blocking a deploy on a licence
 * number nobody has sent yet would only teach everyone to skip the check.
 *
 * What it does instead is keep the list in front of whoever is deploying. Each
 * entry is a sentence the site is currently NOT allowed to write, and the page
 * that wanted it is measurably weaker without it.
 *
 * src/site/claims.js is plain ESM with no JSX and no imports of its own, so node
 * loads it directly — the audit needs no build step and no bundler.
 */

import { outstandingClaims } from '../src/site/claims.js'

const outstanding = outstandingClaims()

if (outstanding.length === 0) {
  console.log('\n  claims audit: every claim in the register is verified or attributed.\n')
} else {
  console.log(`\n  claims audit — ${outstanding.length} unverified claim(s), each rendering as nothing:\n`)
  for (const { key, label, note } of outstanding) {
    console.log(`    CLAIM_TODO  ${key.padEnd(18)} ${label}`)
    if (note) console.log(`                ${' '.repeat(18)} ${note}`)
  }
  console.log('\n  Supply these and the pages that need them get materially stronger.\n')
}
