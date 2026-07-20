import type { EventName } from './catalog';
import { track } from './tracker';

/**
 * One delegated listener on document, capture phase — not per-component handlers.
 *
 * Per-component handlers rot: someone adds a new WhatsApp button in six months
 * and forgets to wire tracking, and the gap is invisible because a missing event
 * looks exactly like an event that didn't happen. Delegation means new markup is
 * instrumented by default.
 *
 * Capture phase so we still see the click even if a handler calls
 * stopPropagation() on the way up.
 */

let installed = false;

interface Resolved {
  name: EventName;
  props?: Record<string, unknown>;
  productSku?: string;
  industrySlug?: string;
  sectionId?: string;
}

function fromHref(href: string): Resolved | null {
  const h = href.toLowerCase();
  if (h.includes('wa.me') || h.includes('api.whatsapp.com')) {
    return { name: 'contact_intent_clicked', props: { channel: 'whatsapp' } };
  }
  if (h.startsWith('tel:')) {
    return { name: 'contact_intent_clicked', props: { channel: 'call' } };
  }
  if (h.startsWith('mailto:')) {
    return { name: 'contact_intent_clicked', props: { channel: 'email' } };
  }
  if (h.includes('instagram.com')) {
    return { name: 'contact_intent_clicked', props: { channel: 'instagram' } };
  }
  if (h.includes('linkedin.com')) {
    return { name: 'contact_intent_clicked', props: { channel: 'linkedin' } };
  }
  return null;
}

function resolve(el: Element): Resolved | null {
  // An explicit data-evt always wins over href sniffing.
  const tagged = el.closest<HTMLElement>('[data-evt]');
  if (tagged) {
    const name = tagged.dataset.evt as EventName | undefined;
    if (name) {
      return {
        name,
        productSku: tagged.dataset.sku,
        industrySlug: tagged.dataset.industry,
        sectionId: tagged.dataset.section,
        props: tagged.dataset.evtProps ? safeParse(tagged.dataset.evtProps) : undefined,
      };
    }
  }

  const anchor = el.closest<HTMLAnchorElement>('a[href]');
  if (anchor) return fromHref(anchor.getAttribute('href') || '');

  return null;
}

function safeParse(raw: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function initDelegatedTracking(): void {
  if (installed) return;
  installed = true;

  try {
    document.addEventListener(
      'click',
      (e) => {
        try {
          const target = e.target;
          if (!(target instanceof Element)) return;
          const resolved = resolve(target);
          if (!resolved) return;
          const { name, ...rest } = resolved;
          track(name, rest);
        } catch {
          /* never interfere with the click itself */
        }
      },
      true,
    );

    // Native <details> accordions never fire click on the content, only toggle.
    document.addEventListener(
      'toggle',
      (e) => {
        try {
          const el = e.target;
          if (!(el instanceof HTMLDetailsElement) || !el.open) return;
          const name = (el.dataset.evt as EventName) || 'faq_opened';
          track(name, {
            sectionId: el.dataset.section,
            props: { question: el.dataset.question },
          });
        } catch {
          /* no-op */
        }
      },
      true,
    );
  } catch {
    /* no-op */
  }
}
