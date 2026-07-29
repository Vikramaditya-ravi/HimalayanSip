# AquaVia Analytics

First-party traffic and product analytics. The event stream is the product;
third-party vendors are optional, consent-gated sinks.

## The one architectural rule

**Everything reads from the event stream. Nothing else.**

`lib/metrics.ts` queries `Event` and the rollup tables derived from it. It never
joins `Lead` or any other business table. If a number you want isn't in the
stream, **emit a better event** — never add a join. That is what keeps the
dashboard from breaking every time the business schema changes.

Revenue works this way too: `lead_won` carries its value in `props`, and
first-touch attribution comes from the stitched `leadId` on prior events. So
revenue-by-source is answerable without ever reading the `Lead` table.

---

## Status: LIVE

Deployed to production and verified on **https://www.aquaviaworld.com**.

Note the live domain is `www.aquaviaworld.com`, *not* `himalayan-sip.vercel.app`
— that hostname returns `DEPLOYMENT_NOT_FOUND` and is not attached to this
project. The dead host is no longer referenced anywhere: `SITE_URL` in
`src/site/data.js` is the single source for the canonical, OG and JSON-LD URLs
on every route. The `*.vercel.app` deployment URLs are behind Vercel SSO
protection, so only the custom domain is publicly reachable.

Functions execute in `iad1` (confirmed via `X-Vercel-Id: bom1::iad1`), which is
why the database is in `aws-us-east-1` — co-located with the functions rather
than with the Delhi NCR users, since every query is function→DB.

### Done

- **Neon project `aquavia-analytics`** (org `Ravi`, `aws-us-east-1`, PG 17).
  Region matches Vercel's default `iad1` — the DB should sit next to the
  *functions*, not the users, since every query is function→DB.
- **Schema migrated.** `prisma/migrations/20260719141407_init` is applied; 9
  tables live, `occurredAt`/`receivedAt` confirmed `timestamp with time zone`.
- **`.env` written** (gitignored) with the pooled `DATABASE_URL`, the unpooled
  `DIRECT_URL`, and freshly generated `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`,
  and `CRON_SECRET`.
- **All 21 SQL surfaces verified against Neon PG17** — the local suite runs on
  PG18, so this confirms no major-version drift.

### Still to do

1. **Revoke the old Web3Forms key.** The integration is gone from the code and
   `WEB3FORMS_KEY` is no longer read anywhere, but the key `1f5d2cae…` is still
   in git history and still live until it is deleted in the Web3Forms dashboard.
   Delete it there, and drop the variable from Vercel's production environment.
2. **Vercel.** No project exists under the logged-in scope
   (`ravi-prakashs-projects-2d3a609c`), so the live `himalayan-sip.vercel.app`
   is on a different account. Once linked:
   ```bash
   vercel link
   # push every non-empty local var to production
   vercel env add DATABASE_URL production   # etc.
   ```
   `ADMIN_SESSION_SECRET` and `CRON_SECRET` must be set or the admin login and
   cron routes **fail closed** — they refuse rather than running open.
3. **Deploy**, then verify the deploy-only surface (see Verification status).

### Local development

```bash
vercel dev   # site + /api functions + middleware together
```

`npm run dev` alone runs Vite without the API; the tracker fails silently (by
design) and no events land.

### Working against the test database

`npm run test:db` boots a throwaway local PostgreSQL and **truncates every
table**. It refuses to run against any non-local host, so a mis-set
`DATABASE_URL` cannot wipe production. Do not remove that guard.

---

## How it fits together

| Piece | File | Note |
|---|---|---|
| Event catalog | `src/analytics/catalog.ts` | The only place events are defined |
| Identity minting | `middleware.js` | httpOnly `vid`/`sid`, minted only when missing |
| Ingest | `api/events.ts` | Public, unauthenticated, **always 204** |
| Browser tracker | `src/analytics/tracker.ts` | Batches 20 / debounces 1s / `sendBeacon` on unload |
| Delegated clicks | `src/analytics/delegate.ts` | One capture-phase listener; `data-evt` wins over href sniffing |
| Attribution | `src/analytics/attribution.ts` | First touch, captured once, replayed on every batch |
| Server emission | `lib/track.ts` | Never throws; resolves identity/geo/device itself |
| Stitching | `lib/stitch.ts` | The one mutation of an immutable stream |
| Metrics | `lib/metrics.ts` | Single source of truth for every definition |
| Rollups | `lib/rollup.ts` | Idempotent; **mirrors `metrics.ts` 1:1** |
| Detectors | `lib/detectors.ts` | Pure SQL, numeric evidence |
| Narration | `lib/narrate.ts` | Ranks and writes up — **never computes a number** |
| Dashboard | `admin.html` + `src/admin/` | Separate Vite entry; not in the marketing bundle |

### Adding an event

1. Add it to `src/analytics/catalog.ts` with a `status` and a description.
2. If a browser may emit it, add it to `CLIENT_EMITTABLE`. **Only browsing,
   intent, and UI events** — conversions, money, and status changes are server
   truth, emitted after the row is written.
3. Emit it: `track('name', {...})` in the browser, or `track(name, {...}, ctx)`
   on the server.

A typo is a compile error from TypeScript call sites, and a test failure from the
plain-JS marketing code in `src/sections` and `src/site`
(see `src/analytics/__tests__/catalog-usage.test.ts`).

### Changing a metric definition

Change it in `lib/metrics.ts` **and** `lib/rollup.ts` in the same commit. If they
drift, dashboard numbers will change when a date range crosses the retention
boundary — the hardest class of analytics bug to notice.

---

## Discontinuity: the multi-page split (2026-07-28)

The marketing site went from one route to six (`/`, `/products`, `/pricing`,
`/process`, `/about`, `/contact`). **Trend lines that cross this date are not
comparable**, and nothing is wrong with the data — the definitions simply now
describe a different site.

What moved, and why:

- **Page views per session jump.** `page_viewed` fires once per document load.
  Before, a visitor who read everything produced one page view; now the same
  visitor produces up to six.
- **Bounce rate falls, mechanically.** The definition in
  `src/analytics/catalog.ts` is "≤ 1 page view **and** none of
  `ENGAGEMENT_EVENTS`". A visitor who lands on `/` and clicks through to
  `/pricing` is no longer a bounce even if they touch nothing — because they
  genuinely did navigate. The number got more meaningful, not just smaller.
- **`pageUrl` changes shape.** It was `/` plus a fragment (`/#pricing`); it is
  now a real path plus an optional fragment (`/pricing`, `/process#filtration`).
  Any saved query grouping on `pageUrl` needs re-checking.
- **`section_viewed` is unchanged.** Sections kept their ids and their
  `TrackInView` wrappers, so per-section funnels stay continuous across the cut.
  These are the safest series to compare against pre-split data.

---

## Privacy

- No PII in `props`, ever. Names, emails, phones, and message bodies live on
  `Lead`. Funnel events record **which field** was completed, never its value.
- No raw IP is persisted. It is used transiently for rate limiting only; geo
  comes from CDN headers.
- First-party analytics runs for everyone — no consent gate.
- Third-party vendor scripts are **never fetched** before consent is granted.
  Consent is `granted | denied | null`, and **unanswered is not denied**.

---

## Verification status

- `npm test` — 43 tests, no database needed
- `npm run test:db` — 36 tests against **real PostgreSQL** (starts a local cluster)
- `npm run typecheck`

### The timezone bug this found

`Event.occurredAt` was originally `timestamp without time zone`. Every
`NOW() - INTERVAL` comparison — `liveVisitors`, all seven detectors, rollup
staleness — was then silently off by the server's UTC offset. On an IST server
"visitors in the last 5 minutes" returned **0 instead of 2**, and no detector
ever fired. Neon defaults to UTC, so this would have looked fine in production
and broken on any other host.

Fixed by making instant columns `@db.Timestamptz(3)` and pinning all day
bucketing to `AT TIME ZONE 'UTC'`, so rollup days don't shift with server
timezone. The suite now passes under UTC, Asia/Kolkata, Pacific/Auckland, and
America/New_York.

**Verified against real PostgreSQL 18 (`npm run test:db`):**

- Every metric in `metrics.ts`: overview, trend, all six dimension breakdowns,
  funnel, contact intent, revenue-by-source, velocity, depth, retention, search,
  products, live, recent feed, infra health
- Bots and admin actors excluded from visitor-facing numbers
- Revenue attributed to **first touch**, read from the stream, totalling exactly once
- **Identity stitching**: `leadId` back-stamped onto prior anonymous events only —
  pre-existing associations survive; landing-page UTM becomes answerable from the
  conversion; `visitorIdOf` resolves to the buyer, not the admin
- **Rollup idempotency**: running twice produces byte-identical rows
- Rollup revenue and search counts agree with the raw path
- `__all__` row carries true uniques, always ≤ the sum of per-name uniques
- Approximate-data path: every metric flips to rollups and reports `rolledUp: true`
- Retention pruning deletes past the cutoff and leaves rollups intact
- All seven detectors execute and produce numeric evidence
- Narration falls back to templated prose with no API key, losing no finding

**Verified without a database (`npm test`):**

- Ingest always returns 204 — valid batches, malformed JSON, wrong method
- A browser cannot forge `lead_won` / `lead_submitted` / `rollup_completed`
- Body-supplied `visitorId` / `sessionId` / `actor` are ignored; cookies win
- Malformed identity cookies are rejected, not trusted
- Batch capped at 20; clock skew clamped; same-batch ordering preserved
- Attribution replayed onto every event; no IP in any persisted row
- Oversized `props` capped
- Admin session signing: round-trip, tamper, wrong-secret, expiry, **fails closed**
- Cron auth **fails closed** when `CRON_SECRET` is unset
- Bot detection across 10 real bot UAs; device/browser classification
- Marketing page still renders every section, product, and form field after
  instrumentation, and no longer ships the Web3Forms key

**Verified end-to-end through `vercel dev` against production Neon:**

- Middleware mints `vid` (httpOnly) on first load and **not** on repeat loads,
  so static responses stay CDN-cacheable
- `/api/events` returns 204 and persists; `vid_pub` and `sid` arrive as separate
  headers with `vid_pub` matching `vid` exactly
- A forged `lead_won` from a browser returns 204 and **writes nothing**
- Full conversion chain: UTM on landing → replayed → stitched → answerable from
  the conversion; `lead_submitted` emitted server-side with `source: server`
- Admin: 401 unauthenticated, 401 on wrong password, 200 on correct, gated reads
- Cron: 401 without secret, 200 with; both rollup and insights routes run

Test data was deleted afterwards; the production stream starts empty.

**Two bugs this found (both would have shipped):**

1. `middleware.js` used `request.cookies.get()` — a **Next.js-only API**. In a
   non-Next project the edge runtime passes a standard `Request`, so this threw
   on *every* request.
2. `Headers.append('set-cookie', …)` joins repeated values into one
   comma-separated header, and clients keep only the first — `vid_pub` and `sid`
   were silently dropped. Middleware now sets exactly one cookie; the Node ingest
   endpoint owns the rest, where a Set-Cookie array serialises correctly.

A third, found by the integration suite: `overview`'s conversion count applied no
bot filter while the funnel and the rollup both did — so the headline number
disagreed with itself and would have shifted when a range crossed the retention
boundary. Spam-bot form submissions also counted as conversions.

**Verified on production (www.aquaviaworld.com):**

- Edge middleware on the real edge runtime — mints `vid` httpOnly + Secure on
  first load, does not re-mint on repeat
- `/api/events` → 204 and persists to Neon; a forged `lead_won` writes nothing
- `/api/analytics/*` → 401 unauthenticated, 200 after admin login
- `/api/cron/rollup` → 401 without secret, runs with it
- `/api/lead` → 400 on invalid input (route loads and executes)

**A fourth bug, caught only by deploying:**

Vercel compiles `api/**.ts` to `.js` but does not rewrite extensionless relative
imports, and Node's ESM loader requires explicit extensions — so **every API
route 500'd** with `ERR_MODULE_NOT_FOUND`. Ironically this was caused by an
earlier fix: stripping `.js` so Vite could resolve `.ts` sources. The two
runtimes want opposite things.

The rule now: **`api/` and `lib/` use explicit `.js` extensions on relative
imports (Node ESM); `src/` stays extensionless (Vite).** Don't "tidy" either one
to match the other.

**Still NOT verified:**

- Cron firing on Vercel's *scheduler* (the routes work; the schedule fires at
  02:00/02:30 UTC)
- The browser tracker in a real browser — batching, `sendBeacon` on unload, the
  delegated click listener. **Load the site and check the Live tab.**
- LLM narration against a live Anthropic API key (only the fallback is tested)
