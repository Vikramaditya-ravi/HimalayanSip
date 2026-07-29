/**
 * The claims register.
 *
 * Every factual assertion the site makes about water, licensing, logistics or
 * capability lives here as data, with a status saying how well we can stand
 * behind it. Nothing about presentation is decided here — this is the answer to
 * "may we say this at all", not "how does it look".
 *
 * Why it exists: the site previously described a bottling plant, a well field
 * and a refrigerated fleet in the first person. AquaVia owns none of them; a
 * bottling partner does, and the partner — not AquaVia — holds the BIS IS 14543
 * and FSSAI licences. Unattributed, those lines are the exact pattern that
 * search quality systems and LLM trust heuristics discount, and the fix is not
 * to delete the detail but to say whose it is.
 *
 * The three statuses:
 *
 *   VERIFIED           We have a document. Renders plainly.
 *   SUPPLIER_ATTESTED  True of our bottling partner, not of us. Renders WITH the
 *                      attribution attached — there is no way to render one of
 *                      these as a first-person claim.
 *   TODO               Nobody has produced the number yet. Renders NOTHING.
 *
 * That last one is the point of the whole module. `claim()` returns null for a
 * TODO, so an unverified fact is structurally incapable of reaching a page: you
 * cannot forget to remove a placeholder, because a placeholder never renders.
 * scripts/claims-audit.mjs lists what is still outstanding at every build so the
 * gaps stay visible instead of quietly hardening into fact.
 */

export const CLAIMS = {
  // ── Outstanding. Each of these is a real competitive gap. ──────────────────
  // Competitors in this category publish "BIS IS 14543 certified, food-grade,
  // lab-tested" and win the comparison on it. We cannot claim a licence we do
  // not hold — but we can cite our partner's, with attribution, the moment
  // someone sends the numbers.
  supplierBIS: {
    status: 'TODO',
    label: 'Bottling partner BIS IS 14543 licence number',
    note: 'Ask the bottling partner. Highest-value outstanding item on the site.',
  },
  supplierFSSAI: {
    status: 'TODO',
    label: 'Bottling partner FSSAI licence number',
    note: 'Ask the bottling partner.',
  },
  tds: {
    status: 'TODO',
    label: 'TDS at bottling (ppm)',
    note: 'Needs a lab report. The site claims mineral balancing and publishes no numbers.',
  },
  minerals: {
    status: 'TODO',
    label: 'Calcium / magnesium / potassium (mg/L)',
    note: 'Needs a lab report. Would make /guides/ideal-tds-drinking-water first-party.',
  },
  waterSource: {
    status: 'TODO',
    label: 'Verified source of the bottled water',
    note: 'The site said "Himalayan springs" alongside Delhi NCR bottling. Not published until confirmed.',
  },
  bottlingLocation: {
    status: 'TODO',
    label: 'Bottling facility town / district',
    note: 'Enables a real address in schema and a Google Business Profile.',
  },
  foundingYear: {
    status: 'TODO',
    label: 'Year AquaVia was founded',
    note: 'Feeds Organization.foundingDate and the About page.',
  },

  // ── Verified against the corporate pricing brochure. ───────────────────────
  leadTime: {
    status: 'VERIFIED',
    value: '2–3 business days',
    source: 'operations, superseding the 5–10 day figure in the corporate pricing brochure',
    label: 'Production and delivery time',
  },
  proofTime: {
    status: 'VERIFIED',
    value: '24–48 hours',
    source: 'corporate pricing brochure',
    label: 'Digital proof turnaround',
  },
  serviceArea: {
    status: 'VERIFIED',
    value: 'Delhi, Gurugram, Noida, Greater Noida, Faridabad and Ghaziabad',
    source: 'stated service area',
    label: 'Delivery area',
  },
  businessHours: {
    status: 'VERIFIED',
    value: 'Monday to Saturday, 9am to 7pm IST',
    source: 'sales desk',
    label: 'Sales desk hours',
    // Machine-readable twin, so the LocalBusiness schema and the visible line
    // cannot drift. These two used to disagree: the schema said Mon–Fri
    // 09:00–18:00 while the contact panel said Mon–Sat 9am–7pm, and a business
    // that contradicts itself about its own opening hours is exactly what an
    // engine uses to discount everything else it says.
    schema: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' },
  },

  // ── True of the bottling partner. Never rendered without saying so. ────────
  coldChain: {
    status: 'SUPPLIER_ATTESTED',
    value: '4°C',
    attribution: 'our bottling partner',
    label: 'Cold-chain dispatch temperature',
  },
  filtrationStages: {
    status: 'SUPPLIER_ATTESTED',
    value: 'seven-stage filtration ending in ozonation',
    attribution: 'our bottling partner',
    label: 'Filtration process',
  },
}

/**
 * The value of a claim, or null if we cannot stand behind it yet.
 *
 * Callers render `{claim('tds')}` directly: a TODO collapses to nothing, and
 * React renders null as nothing at all, so the sentence around it has to be
 * written to survive its absence. That is deliberate friction — it forces the
 * copy to work without the number rather than shipping "TDS: TBD".
 */
export function claim(key) {
  const c = CLAIMS[key]
  if (!c || c.status === 'TODO') return null
  return c.value
}

/** True when a claim is publishable — for gating a whole sentence or block. */
export function hasClaim(key) {
  return claim(key) !== null
}

/**
 * A claim with its attribution attached, for prose.
 *
 * SUPPLIER_ATTESTED claims come back as "4°C (per our bottling partner)" rather
 * than a bare figure, which is the whole reason the status exists.
 */
export function attributedClaim(key) {
  const c = CLAIMS[key]
  if (!c || c.status === 'TODO') return null
  if (c.status === 'SUPPLIER_ATTESTED') return `${c.value} (per ${c.attribution})`
  return c.value
}

/** Everything still outstanding. Used by the build audit and its test. */
export function outstandingClaims() {
  return Object.entries(CLAIMS)
    .filter(([, c]) => c.status === 'TODO')
    .map(([key, c]) => ({ key, label: c.label, note: c.note }))
}
