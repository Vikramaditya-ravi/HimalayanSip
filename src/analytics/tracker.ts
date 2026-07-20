import { getAttribution } from './attribution';
import { type EventName, isClientEmittable } from './catalog';

/**
 * Browser tracker. Small, dependency-free, runs on every page.
 *
 * Design rules, all load-bearing:
 *  - track() never awaits, never throws, never blocks a click.
 *  - Telemetry must never break a page. Everything is wrapped in try/catch.
 *  - Flushes on unload use sendBeacon, because fetch() is killed mid-flight when
 *    a page goes away — and the last event before someone leaves is often the
 *    most informative one you will ever get from them.
 */

const ENDPOINT = '/api/events';
const MAX_BATCH = 20;
const DEBOUNCE_MS = 1000;

export interface TrackProps {
  props?: Record<string, unknown>;
  sectionId?: string;
  productSku?: string;
  industrySlug?: string;
  queryText?: string;
  pageUrl?: string;
  prevPage?: string;
}

interface QueuedEvent extends TrackProps {
  name: EventName;
  t: number;
}

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;
let prevPage: string | null = null;

function currentPage(): string {
  // One-page site: the hash is what distinguishes "pages", so it's part of the URL.
  return window.location.pathname + window.location.hash;
}

function send(events: QueuedEvent[], useBeacon: boolean): void {
  if (events.length === 0) return;
  const payload = JSON.stringify({ events, attribution: getAttribution() });

  try {
    if (useBeacon && typeof navigator.sendBeacon === 'function') {
      // Blob rather than a raw string so the Content-Type is right; sendBeacon
      // survives the page being torn down, which is the entire reason it exists.
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {
      /* Dropping an event is always preferable to surfacing an error. */
    });
  } catch {
    /* no-op */
  }
}

function flush(useBeacon = false): void {
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  send(batch, useBeacon);
}

/**
 * Queue an event. Safe to call from anywhere, including render paths and click
 * handlers on the critical path.
 */
export function track(name: EventName, extra: TrackProps = {}): void {
  try {
    if (!isClientEmittable(name)) {
      // Compile-time checked from TS call sites; this catches JS call sites in
      // App.jsx and anything trying to emit a server-truth event from a browser.
      if (import.meta.env?.DEV) {
        console.error(
          `[analytics] "${name}" is not a client-emittable event. ` +
            `Add it to the catalog, or emit it server-side if it's a conversion.`,
        );
      }
      return;
    }

    queue.push({
      name,
      t: Date.now(),
      pageUrl: extra.pageUrl ?? currentPage(),
      prevPage: extra.prevPage ?? prevPage ?? undefined,
      ...extra,
    });

    if (queue.length >= MAX_BATCH) {
      flush();
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => flush(), DEBOUNCE_MS);
  } catch {
    /* Telemetry must never break a page. */
  }
}

/** Fire a page view and remember where we came from. */
export function trackPageView(page?: string): void {
  try {
    const next = page ?? currentPage();
    track('page_viewed', { pageUrl: next, prevPage: prevPage ?? undefined });
    prevPage = next;
  } catch {
    /* no-op */
  }
}

/**
 * Install listeners. Idempotent — React Strict Mode double-invokes effects in
 * development, and without this guard every event would be recorded twice.
 */
export function initTracker(): void {
  if (started) return;
  started = true;

  try {
    getAttribution();
    trackPageView();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush(true);
    });
    // pagehide covers bfcache navigations, which never fire unload.
    window.addEventListener('pagehide', () => flush(true));

    // Hash navigation is this site's equivalent of a route change.
    window.addEventListener('hashchange', () => trackPageView());
  } catch {
    /* no-op */
  }
}

/** Exposed for tests. */
export function __reset(): void {
  queue = [];
  started = false;
  prevPage = null;
  if (timer) clearTimeout(timer);
  timer = null;
}
