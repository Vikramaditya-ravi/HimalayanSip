/**
 * Geo from edge headers.
 *
 * We never persist a raw IP. Country and city come from the CDN, which already
 * resolved them — so there is no reason for the IP itself to reach the database.
 */

export interface Geo {
  country: string | null;
  city: string | null;
}

type Headers = Record<string, string | string[] | undefined>;

function h(headers: Headers, key: string): string | null {
  const v = headers[key] ?? headers[key.toLowerCase()];
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return null;
  // Vercel percent-encodes city names containing non-ASCII characters.
  try {
    return decodeURIComponent(s).trim() || null;
  } catch {
    return s.trim() || null;
  }
}

export function geoFromHeaders(headers: Headers): Geo {
  return {
    country:
      h(headers, 'x-vercel-ip-country') ??
      h(headers, 'cf-ipcountry') ??
      h(headers, 'x-geo-country'),
    city: h(headers, 'x-vercel-ip-city') ?? h(headers, 'cf-ipcity') ?? h(headers, 'x-geo-city'),
  };
}

/**
 * Client IP, for rate limiting ONLY. Never store the return value of this.
 */
export function clientIp(headers: Headers): string {
  const fwd = h(headers, 'x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h(headers, 'x-real-ip') ?? 'unknown';
}
