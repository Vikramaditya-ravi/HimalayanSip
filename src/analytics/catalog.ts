/**
 * The event catalog — single source of truth.
 *
 * Adding an event here is the ONLY way to add an event. `EventName` is derived
 * from these keys, so a typo in a tracking call from TypeScript is a compile
 * error. Calls from App.jsx (plain JS) are covered by the catalog-scan test in
 * src/analytics/__tests__/catalog-usage.test.ts plus a dev-mode console error.
 *
 * `status: "planned"` reserves a name for a feature that doesn't exist yet, so
 * that when it ships the event slots into existing dashboards with no rename and
 * no backfill.
 */

/** Subject soft-keys this project uses. Mirrors the columns on Event. */
export type Subject =
  | 'leadId'
  | 'productSku'
  | 'industrySlug'
  | 'sectionId'
  | 'queryText';

export interface EventDef {
  subjects: readonly Subject[];
  status: 'live' | 'planned';
  description: string;
}

export const EVENTS = {
  // -------------------------------------------------------------------------
  // Browsing / intent / UI. Safe to emit from a browser.
  // -------------------------------------------------------------------------
  page_viewed: {
    subjects: [],
    status: 'live',
    description: 'Document loaded. One per page load.',
  },
  section_viewed: {
    subjects: ['sectionId'],
    status: 'live',
    description:
      'A page section scrolled into view (~0.4 threshold). This is a one-page site, ' +
      'so section views stand in for route-change page views and are what makes ' +
      'top-pages and bounce meaningful.',
  },
  product_viewed: {
    subjects: ['productSku'],
    status: 'live',
    description: 'A bottle-size card entered the viewport.',
  },
  product_cta_clicked: {
    subjects: ['productSku'],
    status: 'live',
    description: '"Order Now" clicked on a product card.',
  },
  industry_clicked: {
    subjects: ['industrySlug'],
    status: 'live',
    description: 'An industry chip was clicked.',
  },
  faq_opened: {
    subjects: [],
    status: 'live',
    description: 'A FAQ <details> accordion was expanded.',
  },

  search_performed: {
    subjects: ['queryText'],
    status: 'live',
    description:
      'Site search run. props.resultCount is mandatory — a search without its ' +
      'result count cannot answer the only question worth asking.',
  },
  search_zero_results: {
    subjects: ['queryText'],
    status: 'live',
    description:
      'Search returned nothing. The most commercially valuable event on the site: ' +
      'this list is a product roadmap written by buyers.',
  },
  search_result_clicked: {
    subjects: ['queryText', 'sectionId'],
    status: 'live',
    description: 'A search result was clicked.',
  },

  customizer_opened: {
    subjects: [],
    status: 'live',
    description: 'Bottle customizer became visible. Strongest intent signal on this site.',
  },
  customizer_logo_uploaded: {
    subjects: [],
    status: 'live',
    description: 'A logo was uploaded to the customizer. Never store the image or filename.',
  },
  customizer_color_changed: {
    subjects: [],
    status: 'live',
    description: 'Bottle colour changed in the customizer.',
  },
  customizer_size_changed: {
    subjects: ['productSku'],
    status: 'live',
    description: 'Bottle size changed in the customizer.',
  },

  contact_intent_clicked: {
    subjects: [],
    status: 'live',
    description:
      'A direct-contact affordance was clicked. props.channel is one of ' +
      'whatsapp | call | email | instagram | linkedin.',
  },

  // ---- Conversion funnel, step by step ----
  contact_form_viewed: {
    subjects: [],
    status: 'live',
    description: 'Contact form scrolled into view. Funnel step 1 (the form is inline, not a modal).',
  },
  contact_form_started: {
    subjects: [],
    status: 'live',
    description: 'First focus on any contact form field. Funnel step 2.',
  },
  contact_form_field_completed: {
    subjects: [],
    status: 'live',
    description:
      'A field was filled and blurred. props.field carries the field NAME ONLY — ' +
      'never the value the visitor typed.',
  },
  contact_form_validation_failed: {
    subjects: [],
    status: 'live',
    description:
      'Client-side validation rejected the form. props.fields lists which fields ' +
      'failed, never what was in them.',
  },

  // ---- Reserved: features that do not exist yet ----
  quote_modal_opened: {
    subjects: [],
    status: 'planned',
    description: 'Reserved for a future dedicated quote modal flow.',
  },
  sample_requested: {
    subjects: [],
    status: 'planned',
    description:
      'Reserved. The sample bar currently only scrolls to the contact form; when it ' +
      'becomes a real request flow, this name is already wired into the funnel.',
  },

  // -------------------------------------------------------------------------
  // Server truth. Conversions, money, and status changes. A browser must never
  // be able to forge these — they are absent from CLIENT_EMITTABLE below.
  // -------------------------------------------------------------------------
  lead_submitted: {
    subjects: ['leadId'],
    status: 'live',
    description: 'Emitted after the Lead row is written. The conversion event.',
  },
  lead_submit_failed: {
    subjects: [],
    status: 'live',
    description: 'Server rejected or failed to persist a lead submission.',
  },
  lead_contacted: {
    subjects: ['leadId'],
    status: 'live',
    description: 'Admin marked the lead as contacted.',
  },
  lead_won: {
    subjects: ['leadId'],
    status: 'live',
    description: 'Deal won. props.value carries revenue in INR. Attributed to the BUYER’s visitorId.',
  },
  lead_lost: {
    subjects: ['leadId'],
    status: 'live',
    description: 'Deal lost. props.reason optional.',
  },
  lead_on_hold: {
    subjects: ['leadId'],
    status: 'live',
    description: 'Deal paused.',
  },
  lead_dispatched: {
    subjects: ['leadId'],
    status: 'live',
    description: 'Order dispatched to the customer.',
  },

  admin_login_succeeded: {
    subjects: [],
    status: 'live',
    description: 'Admin session established.',
  },
  admin_login_failed: {
    subjects: [],
    status: 'live',
    description: 'Failed admin login. NEVER record the attempted password.',
  },
  admin_lead_updated: {
    subjects: ['leadId'],
    status: 'live',
    description:
      'Admin wrote to a lead. props.fields lists WHICH fields changed — never the ' +
      'old or new values.',
  },

  // -------------------------------------------------------------------------
  // Infrastructure reporting on itself.
  //
  // A stalled rollup and a genuinely quiet fortnight produce identical dashboards.
  // The ABSENCE of these events is the alarm.
  // -------------------------------------------------------------------------
  rollup_completed: {
    subjects: [],
    status: 'live',
    description: 'Nightly rollup finished. props carries per-step row counts and duration.',
  },
  events_pruned: {
    subjects: [],
    status: 'live',
    description: 'Raw events past the retention cutoff were deleted. props.deleted = count.',
  },
  insights_generated: {
    subjects: [],
    status: 'live',
    description: 'Detectors ran and insights were written. props.findings = count.',
  },
} as const satisfies Record<string, EventDef>;

export type EventName = keyof typeof EVENTS;

export const EVENT_NAMES = Object.keys(EVENTS) as EventName[];

export const LIVE_EVENT_NAMES = EVENT_NAMES.filter((n) => EVENTS[n].status === 'live');

export function isEventName(name: string): name is EventName {
  return Object.prototype.hasOwnProperty.call(EVENTS, name);
}

/**
 * The allowlist of events a browser may emit.
 *
 * ONLY browsing, intent, and UI events. Conversions, money, and status changes are
 * server truth, emitted after the row is written. A client must never be able to
 * forge a won deal.
 *
 * Note `quote_modal_opened` and `sample_requested` are included despite being
 * `planned` — they are client-side by nature, so when those features ship the
 * ingest endpoint already accepts them.
 */
export const CLIENT_EMITTABLE = new Set<EventName>([
  'page_viewed',
  'section_viewed',
  'product_viewed',
  'product_cta_clicked',
  'industry_clicked',
  'faq_opened',
  'search_performed',
  'search_zero_results',
  'search_result_clicked',
  'customizer_opened',
  'customizer_logo_uploaded',
  'customizer_color_changed',
  'customizer_size_changed',
  'contact_intent_clicked',
  'contact_form_viewed',
  'contact_form_started',
  'contact_form_field_completed',
  'contact_form_validation_failed',
  'quote_modal_opened',
  'sample_requested',
]);

export function isClientEmittable(name: string): name is EventName {
  return isEventName(name) && CLIENT_EMITTABLE.has(name);
}

/**
 * Events that count as engagement for the bounce definition. A session with <= 1
 * page view AND none of these is a bounce. Defined here so lib/metrics.ts and the
 * rollup SQL cannot drift apart.
 */
export const ENGAGEMENT_EVENTS: readonly EventName[] = [
  'product_viewed',
  'product_cta_clicked',
  'industry_clicked',
  'faq_opened',
  'search_performed',
  'search_result_clicked',
  'customizer_opened',
  'customizer_logo_uploaded',
  'customizer_color_changed',
  'customizer_size_changed',
  'contact_intent_clicked',
  'contact_form_viewed',
  'contact_form_started',
  'contact_form_field_completed',
];

/** The conversion funnel, in order. Counted in SESSIONS, not events. */
export const FUNNEL_STEPS: readonly EventName[] = [
  'page_viewed',
  'contact_form_viewed',
  'contact_form_started',
  'contact_form_field_completed',
  'lead_submitted',
];
