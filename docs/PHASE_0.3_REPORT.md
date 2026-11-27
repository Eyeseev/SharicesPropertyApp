# Phase 0.3 — Living database (MVP completion): report
Built by Claude, 2026-11-27. Scope: ROADMAP 0.3. Data model: `docs/TECHNICAL_ARCHITECTURE.md` §7–9. Research inputs are unchanged and read-only (`data/`, `research/`).

## 1. What was built
| Area | Implementation |
|---|---|
| Data model | Zod schemas for Fact, FinancialEntry, ChronicleEvent, Photo, Conflict (`src/data/schema.ts`). New evidence level **`reported`**: an official figure relayed by a secondary source (see §4, decision 1) |
| Import | `scripts/import/{facts,financial,chronicle,photos,conflicts,records,csv}.ts` read `data/property.json`, `financial_history.csv`, `chronicle.csv` and write `app-data/real/{facts,financials,chronicle,photos,conflicts}.json`. 35 facts, 48 financial entries, 17 chronicle events, 19 photos, 7 conflicts |
| Import safety | Fails on: unknown or missing source, `verified` without an official source, an estimate under a verified/reported label, duplicate ids, dangling conflict or photo ids, a sale without ACRIS, an unknown amount outside a sale, a stored photo from a link-only source, a mockup placeholder photo, a raw field that moved, a CSV row that changed, a new unmapped conflict |
| Private serving | `GET /api/photos/[id]`: session and allowlist check, id looked up in the photo records (no caller paths), path confined to `research/photos`, `Cache-Control: private, no-store`. The proxy also blocks it. Photos are bundled for Vercel through `outputFileTracingIncludes` |
| Time model | `src/data/time.ts` `resolveStateAt` (present only in the UI; date logic already tested for 2012, 2016, 2023, 2025 and pre-2012) |
| Financials panel | Overview (market value, recorded sale, tax, third-party estimates kept apart), per-year market-value chart with every year, Assessments table, Source details |
| Chronicle panel | Dated list, selected event with prev/next, type, importance, evidence, source and conflict popover, links to photos |
| Photos panel | Date and viewpoint filters, nearest-to-today indicator, cards, enlargement (Esc, arrows), honest empty state |
| Info drawer | Left "i" tab: every fact with evidence badge and source popover, explicit "Unknown", open questions |
| Shell | Tabs switch modes; one primary layer at a time; panels collapse; the camera rail moves clear of the panel; `?mode=` deep links; Explorer stays a clean full-screen model |

## 2. Data honesty, as built
- **Taxes:** 2025/26 is $6,337. The $6,669 figure appears only as the 2026/27 tax (resolved by Muse's reasoning, medium-high confidence, still `reported`). It is never on the current-year card.
- **Evidence per year:** tax years 2016/17–2018/19 are `verified` (checked at NYC Open Data, S19). All other years are `reported` (PropertyShark, S8). The chart marks the difference with filled and hollow dots.
- **Kinds are never mixed:** recorded sales (ACRIS, verified), DOF market values (labelled "not an appraisal"), assessed/taxable values, taxes, and third-party estimates ($641k–$740k, `estimated`, low confidence).
- **Unknowns:** 1975 deed price, renovation history, bedrooms/bathrooms (third-party claim only) are shown as Unknown or Reported with a note, not invented.
- **Build year:** shown as "1945 (city record)" with an open-conflict flag in the drawer, the Chronicle and the popover; both claims are listed.
- **Photos:** only real files and links. The invented mockup photo cards are absent (a unit test and an import rule enforce it). Street View and the 1940s photo are links only, never embedded.
- **Fixtures:** `app-data/fixtures` is still imported by nothing; the build check passes.

## 3. Verification
- Import, `tsc`, eslint, prettier clean. 59 unit tests (data records, import currency, validation rejections, time model, fixture isolation, auth config) pass.
- Browser tests: photo route (401 without a session; images only for stored records; 404 for link-only ids, unknown ids and path tricks), Financials, Chronicle, Photos, Info drawer, mode switching and deep link, plus the 0.1/0.2 scene tests.
- Production build passes and the post-build check finds no test provider or fixtures; the photo route bundles the 17 files it needs.
- Looked at all four modes in the browser at 1600×900. New review screenshots: `tests/e2e/__screenshots__/mode-*.png`.
- **Not done:** a deployed private Vercel instance and a real Google sign-in (needs Vic's accounts, see §5). Frame rate is still unmeasured (software GL in tests).

## 4. Decisions for review
1. **New evidence value `reported`.** The PRD's levels have no place for "official data, relayed by an aggregator". Calling it `verified` would overstate it and `estimated` would be wrong. Badge text: "Reported".
2. **Tax-year coverage.** The repo only holds 2016/17 onward. Muse's DOF extract covers 2010/11–2018/19; the earlier years are not in `data/` yet, so the chart starts at 2016/17.
3. **1980s tax photo** is stored and shown (rights: unknown, "private reference only"). This is fine for a private two-person app and wrong for any public use.
4. **Playwright can reuse a running dev server** (`E2E_BASE_URL`), because Next allows one dev server per folder.
5. Sources S21–S23 (aerials, 1980s and 1940s photos) were added by the importer; Muse's `SOURCE_INDEX.md` does not list them.

## 5. Needed from Vic before the private deployment (ROADMAP 0.3 last step)
- A Google Cloud OAuth client (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`), the two allowed emails (`ALLOWED_EMAILS`), and `AUTH_SECRET`.
- A Vercel project on the free Hobby plan, linked to the GitHub repo, with those variables set; production sign-in tested with both accounts.
- Approval of the Vercel/GitHub arrangement (cost target $0). Nothing has been created or deployed.

## 6. Known gaps
- No Time Machine UI (Phase 0.4); the panels show the present day.
- Owner photos, beds/baths, renovation dates and the build-year resolution still need Sharice or an archive visit.
- Phone layout is a simple bottom sheet, not a designed mobile experience.
