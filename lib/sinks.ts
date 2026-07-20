import { Prisma } from '@prisma/client';
import { prisma } from './db.js';
import type { EventRow } from './track.js';

/**
 * Event sinks.
 *
 * The database sink is the source of truth and always writes. Vendor sinks are
 * optional, consent-gated, and run in the background — adding one must touch zero
 * components, which is the whole reason this seam exists.
 */

export interface Sink {
  name: string;
  /** If true, this sink is skipped unless the event carries consent. */
  requiresConsent: boolean;
  write(rows: EventRow[]): Promise<void>;
}

export const dbSink: Sink = {
  name: 'database',
  // The first-party sink stores no PII and no raw IP, so it runs for everyone.
  requiresConsent: false,
  async write(rows) {
    await prisma.event.createMany({
      // A null `props` must become a SQL NULL, not the JSON literal `null` —
      // Prisma distinguishes these and `Prisma.JsonNull` would store a JSON null,
      // which then fails `props IS NULL` checks in the detector SQL.
      data: rows.map(({ props, ...rest }) => ({
        ...rest,
        props: props === null ? Prisma.DbNull : (props as Prisma.InputJsonValue),
      })),
    });
  },
};

/**
 * Vendor sinks. Empty by design.
 *
 * When one is added it must ONLY be reachable with consent granted, and its
 * browser-side script must never be fetched before consent (see src/analytics/consent.jsx).
 *
 * Example shape:
 *   { name: 'ga4', requiresConsent: true, async write(rows) { ...fetch measurement protocol... } }
 */
export const vendorSinks: Sink[] = [];

export function sinksFor(consent: boolean): { primary: Sink; background: Sink[] } {
  return {
    primary: dbSink,
    background: vendorSinks.filter((s) => !s.requiresConsent || consent),
  };
}
