/**
 * First-touch attribution capture.
 *
 * The UTM is on the landing page. The conversion happens several sections later,
 * after the query string is long gone from a shared link or a scroll-driven
 * journey. Without capturing it once and replaying it, every conversion appears
 * to come from nowhere — which is the single most common way analytics setups
 * silently fail.
 *
 * Captured on the first page of a session, stored under one sessionStorage key,
 * and replayed onto every batch the tracker sends.
 */

const KEY = 'av_attr';

export interface Attribution {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  referrer: string | null;
  referrerType: 'search' | 'social' | 'referral' | 'direct';
  landingPage: string | null;
}

const SEARCH_HOSTS =
  /(^|\.)(google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.|baidu\.|ecosia\.|brave\.|startpage\.|qwant\.)/i;
const SOCIAL_HOSTS =
  /(^|\.)(facebook\.|fb\.|instagram\.|linkedin\.|lnkd\.|twitter\.|x\.com|t\.co|pinterest\.|reddit\.|youtube\.|youtu\.be|whatsapp\.|wa\.me|telegram\.|t\.me|quora\.|threads\.)/i;

export function classifyReferrer(referrer: string | null): Attribution['referrerType'] {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname;
    if (SEARCH_HOSTS.test(host)) return 'search';
    if (SOCIAL_HOSTS.test(host)) return 'social';
    return 'referral';
  } catch {
    return 'direct';
  }
}

function externalReferrer(): string | null {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    // Keep the referrer ONLY if it's external. Our own pages are the journey,
    // not its source — treating them as a source would make the site its own
    // biggest traffic channel.
    if (new URL(ref).hostname === window.location.hostname) return null;
    return ref;
  } catch {
    return null;
  }
}

function capture(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const p = (k: string) => params.get(k)?.trim() || null;
  const referrer = externalReferrer();

  return {
    utmSource: p('utm_source'),
    utmMedium: p('utm_medium'),
    utmCampaign: p('utm_campaign'),
    utmTerm: p('utm_term'),
    utmContent: p('utm_content'),
    gclid: p('gclid'),
    fbclid: p('fbclid'),
    msclkid: p('msclkid'),
    referrer,
    referrerType: classifyReferrer(referrer),
    landingPage: window.location.pathname + window.location.hash,
  };
}

let cached: Attribution | null = null;

/**
 * Read the session's attribution, capturing it on first call.
 *
 * Deliberately never overwritten once set: this is FIRST touch. A visitor who
 * arrives from an ad, wanders off to Google, and comes back must still be
 * credited to the ad.
 */
export function getAttribution(): Attribution {
  if (cached) return cached;
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) {
      cached = JSON.parse(stored) as Attribution;
      return cached;
    }
  } catch {
    // sessionStorage can throw in private mode or with storage disabled.
  }

  cached = capture();
  try {
    sessionStorage.setItem(KEY, JSON.stringify(cached));
  } catch {
    // Non-fatal: attribution degrades to per-request rather than per-session.
  }
  return cached;
}
