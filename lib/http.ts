/**
 * Minimal request/response shapes for Vercel's Node runtime.
 *
 * Defined locally rather than pulling in `@vercel/node` — we use four properties
 * and adding a package for four properties is not a trade worth making.
 */

export interface ApiRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
  cookies?: Record<string, string | undefined>;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string | string[]): ApiResponse;
  json(body: unknown): void;
  send(body?: unknown): void;
  end(body?: unknown): void;
}

/** Parse a Cookie header. Vercel populates `req.cookies`, but `vercel dev` and
 *  edge-forwarded requests are not always consistent, so we parse defensively. */
export function parseCookies(req: ApiRequest): Record<string, string> {
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    return req.cookies as Record<string, string>;
  }
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

export function serializeCookie(
  name: string,
  value: string,
  opts: { maxAge?: number; httpOnly?: boolean; path?: string; sameSite?: string } = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${opts.path ?? '/'}`];
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  parts.push(`SameSite=${opts.sameSite ?? 'Lax'}`);
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  if (opts.httpOnly) parts.push('HttpOnly');
  return parts.join('; ');
}

export function appendCookie(res: ApiResponse, cookie: string, existing: string[]): string[] {
  const next = [...existing, cookie];
  res.setHeader('Set-Cookie', next);
  return next;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Identity values are only ever accepted if they look like something we minted. */
export function asUuid(value: string | undefined | null): string | null {
  if (!value) return null;
  return UUID_RE.test(value) ? value.toLowerCase() : null;
}

/** Read a JSON body, tolerating both parsed objects and raw strings. */
export function readJsonBody(req: ApiRequest): unknown {
  if (req.body == null) return null;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body;
}
