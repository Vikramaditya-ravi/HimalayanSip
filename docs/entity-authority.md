# Entity authority — the work that cannot be code

Everything in this repository makes AquaVia *legible* to search and answer engines: the pages are
prerendered, the structured data is one connected graph, the facts are gated behind a claims
register. None of that makes AquaVia *known*.

Being known is an off-site property. An engine decides AquaVia is a real business by finding it
described consistently in places AquaVia does not control. That work is listed here because it is the
larger half of the programme and none of it can be committed.

A live search for "AquaVia" plus its own category terms currently returns PlaySIP, AquaPure,
SR Hydrates, Aquaseva, ARC Print and IndiaMART — competitors and directories, not AquaVia. The list
below is ordered by how much each item changes that.

---

## 1. Google Business Profile — the single largest gap

There is no profile. For a local B2B supplier this is the biggest omission on the list, because it is
the primary record Google uses to decide a business exists in a place.

Set it up as a **service-area business**, not a storefront:

- Service areas: Delhi, Gurugram, Noida, Greater Noida, Faridabad, Ghaziabad.
- Do **not** publish a street address customers could visit. The site deliberately asserts none, and
  the `LocalBusiness` node in `src/site/schema.js` carries region-level address only. A profile with
  a street address contradicts the site.
- Hours must match `CLAIMS.businessHours` exactly (Mon–Sat, 09:00–19:00). This is the field most
  commonly left inconsistent, and inconsistency here devalues everything else.
- Phone `+91 76248 03460` and email `info@aquaviaworld.com`, byte-identical to the site.
- Categories: *Bottled water supplier* as primary; *Water purification company*, *Corporate gift
  supplier* as secondary.

## 2. NAP consistency

**N**ame, **A**ddress, **P**hone must be character-identical everywhere. Not "equivalent" —
identical. `+91 76248 03460` and `+91-7624803460` are two different strings to a matching algorithm,
and a business that appears under three phone formats looks like three weakly-attested businesses
rather than one well-attested one.

The canonical forms are in `src/site/claims.js` and `src/site/schema.js`. Copy from there.

## 3. Directory listings — where AI engines actually read this category

IndiaMART and its peers rank *above* AquaVia today for AquaVia's own terms, and they are
disproportionately what assistants cite when asked about Indian B2B suppliers. Being absent from them
is not neutral; it means the sources an engine trusts for this category have no record of you.

- **IndiaMART** — highest priority. This is where procurement search in India starts.
- **JustDial** — strongest local-intent signal in Delhi NCR.
- **TradeIndia**, **ExportersIndia** — B2B supplier discovery.
- **Sulekha** — local services.
- **Google Maps** (follows from the Business Profile above).

For each: the same NAP, the same category language the site uses ("custom branded bottled water",
"private label packaged drinking water"), and a link to `https://www.aquaviaworld.com`.

## 4. A real LinkedIn company page

`src/site/schema.js` lists `linkedin.com/company/aquavia` in `sameAs`. **Verify it resolves.** A
`sameAs` pointing at a 404 is a negative signal, not a neutral one — it is a claimed identity that
cannot be confirmed. If the page does not exist, either create it or remove the URL from `sameAs`.
The same applies to the Instagram handle.

## 5. Wikidata and company registries

- **Zaubacorp / Tofler / registry listings** — these are scraped heavily and are strong corroboration
  that a legal entity exists. Confirm the CIN and that the registered details are current.
- **Wikidata** — only worth attempting once there is independent coverage to cite. An item created
  with no sources gets deleted, and a deleted item is worse than none.

## 6. The claims that unlock the strongest pages

Four items block content that is written and waiting:

| Needed | Unlocks |
|---|---|
| Bottling partner's **BIS IS 14543 licence number** | The certification claim competitors win on. `/guides/packaged-drinking-water-standards-india` currently has to say we cannot evidence it. |
| Bottling partner's **FSSAI licence number** | Procurement and tender qualification. |
| A **lab report** (TDS ppm, Ca/Mg/K in mg/L) | Makes `/guides/ideal-tds-drinking-water` first-party data rather than general knowledge. First-party numbers are what get cited. |
| **Bottling facility location** | A real address in schema, and a stronger Business Profile. |

Add each to `src/site/claims.js` with `status: 'VERIFIED'` (ours) or `'SUPPLIER_ATTESTED'` (the
partner's) and it appears on every page that references it. Until then `npm run claims` lists them at
every build.

## 7. Measurement

- **Google Search Console** — verify the domain, submit `https://www.aquaviaworld.com/sitemap.xml`
  (generated at build; 29 URLs today). URL-inspect three new content pages to confirm indexation.
- **Bing Webmaster Tools** — also feeds ChatGPT search.
- **IndexNow** — Bing and Yandex accept instant submission; cheap to wire into the deploy.
- **The admin AI-crawlers tab** (`/admin` → AI crawlers) shows which agents have fetched which URLs.
  A page Googlebot reads weekly and GPTBot has never touched can rank but cannot be cited.

### The assistant prompt set

Run this fixed set monthly across ChatGPT, Gemini, Claude and Perplexity, and record whether AquaVia
is named. **Baseline it before this work is deployed**, or the delta is unmeasurable.

1. Who supplies custom branded water bottles in Delhi NCR?
2. Where can I get personalised water bottles for a wedding in Gurugram?
3. What is the minimum order for branded water bottles in India?
4. How much do custom printed water bottles cost in India?
5. Best private label bottled water supplier for hotels in Delhi
6. I need branded water bottles for a corporate event in Noida — who can do it?
7. What is the difference between mineral water and packaged drinking water?
8. Which label material is best for bottled water served on ice?

Questions 7 and 8 are the honest test of the guide pages: they are category questions with no brand
in them, and being cited there is what "generative engine optimisation" actually means.
