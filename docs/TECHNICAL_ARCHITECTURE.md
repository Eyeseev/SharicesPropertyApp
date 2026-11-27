# Technical Architecture
Version 1.0 · 2026-11-27 · Prepared by Claude (architecture role, per ROADMAP operating rules)
Status: **Approved 2026-11-27. All decisions D1–D8 in §14 were approved as recommended by Vic.** Nothing here is implemented yet. Phase 0.1 (Codex) may begin within the ROADMAP rules.

Inputs: docs/PRD.md, docs/ROADMAP.md, docs/CREATIVE_DIRECTION.md, research/*, data/*, mockups/*.

---

## 1. Goals that shape every choice
| Requirement (source) | Architectural consequence |
|---|---|
| Desktop graphical quality is paramount (PRD, CREATIVE_DIRECTION §9) | Real-time WebGL scene with a post-processing pipeline, quality tiers, and no aggressive simplification on desktop |
| The property is the hero in every view (CREATIVE_DIRECTION §4) | One persistent 3D scene that never unmounts; every mode is an overlay plus a camera/data-layer change |
| Verified vs estimated vs unknown must be visible (PRD Data, CREATIVE_DIRECTION §8) | Every value and every geometry element carries an evidence status, enforced by schema validation at import time |
| No invented facts; fixtures isolated from real records (PRD) | Real data and test fixtures live in separate trees, and a build check prevents fixtures reaching production |
| Private, authenticated, never public (PRD, README rules) | Server-side auth gate in front of pages, data and photos; nothing private in public static assets |
| Free first; paid needs approval (PRD) | Baseline monthly cost of $0 (§12) |
| Time Machine later (ROADMAP 0.4) | Date-aware data model and scene from day one, so 0.4 isn't a rewrite |
| Codex builds autonomously within phases (ROADMAP) | Mainstream, well-documented stack; geometry as reviewable code; strong automated tests |

## 2. Recommended stack
| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | One language for app, import scripts and tests |
| App framework | **Next.js (App Router)** on Vercel | Server-side auth middleware and protected route handlers for data and photos. Native fit with the approved private Vercel deployment |
| 3D | **three.js via React Three Fiber**, plus `@react-three/drei` and `@react-three/postprocessing` | The most mature web 3D ecosystem; declarative scene that is easy for Codex to extend; camera controls, reflector ground, instancing and bloom are all available |
| UI overlay | React DOM over the canvas, CSS Modules plus design tokens | Crisp, accessible text (not rendered in WebGL), and bloom can't wash out the UI |
| State | Zustand | Small shared store (mode, selected date, selection, camera preset, quality tier) read by both scene and UI |
| Charts | Hand-built SVG components (or visx if needed) | Full control over the gold/cyan styling; the dataset is tiny |
| Validation | Zod | One schema definition used for import validation, TypeScript types and tests |
| Tests | Vitest, plus Playwright (E2E and screenshots) | See §11 |
| Package manager | pnpm | Fast and deterministic. Installing anything still waits for implementation approval |

Not recommended now: a game engine (Unity/Unreal web builds are heavy, a poor fit for UI-heavy data panels, and harder to keep private and cheap); WebGPU-only rendering (keep WebGL2, and revisit WebGPU at 1.0 since three.js supports both); a database (all data is small, curated and reviewed; versioned JSON in the repo is simpler and auditable).

## 3. System overview
```
research/ + data/  (raw, preserved, never edited by the app)
        │  pnpm import  (scripts/import — normalise + validate, fails loudly)
        ▼
app-data/real/*.json  (normalised, evidence-tagged, reviewed via git diff)
app-data/fixtures/*.json  (fictional test data — dev/test only)
        │  server-only loader (requires session)
        ▼
Next.js server ── auth middleware ── /api/data, /api/photos/[id]
        │
        ▼
Browser: React UI overlay  ⇄  Zustand store  ⇄  R3F scene (persistent canvas)
```

## 4. Coordinate system and geometry workflow
### 4.1 Local frame
- Origin: the PLUTO point (40.6628678, −73.7305241). Units: **feet** in data, converted to metres (1 unit = 1 m) in the scene so three.js lighting and physics defaults stay sane.
- Projection: a local equirectangular (east/north) projection. Over a 100 ft lot the error is negligible.
- Scene rotation: rotate so the house's long axis runs along the scene's Z axis. Derived from the official footprints (`data/building_footprints.geojson`):

| Element | Derived value | Status |
|---|---|---|
| House outline | 24.1 × 50.3 ft, long-axis bearing **325.8° / 145.8°** (≈ N34°W) | Derived from verified polygon |
| House outline centroid | 1.1 ft E, 10.8 ft N of the PLUTO point | Derived |
| Garage outline | 19.3 × 10.2 ft; its **19.3 ft side runs NE–SW (≈ 236°)**, across the lot | Derived from verified polygon |
| Garage position | Centroid ≈ 47 ft SE of the house centroid along the long axis, ≈ 4 ft SW of the house centreline | Derived |
| House NW outline edge to garage SE edge | ≈ 78 ft of the 100 ft lot depth | Derived |

  (Computed 2026-11-27 from the GeoJSON. The import script must reproduce these numbers as a test.)
- **Parcel:** the official tax-lot polygon is still missing. Approved (D5): render a 50 × 100 ft rectangle aligned to the house axis, placed using the footprints and street frontages, and tagged `evidence: derived_approximate` (dimensions verified, position approximate), with the source details saying so. It gets replaced when the polygon is retrieved. *(The research deliberately did not estimate the polygon; this is a labelled display approximation, not a research record.)*

### 4.2 Geometry as code (D2, approved)
Build the property from a **parametric geometry spec** (`app-data/real/geometry.json`) and TypeScript builders, rather than a hand-modelled 3D file.

- The spec holds dimensions, roof sections and pitches, openings (doors and windows per elevation), materials, vegetation placements and fence runs. Each element has `evidence` (verified, observed, estimated, unknown), `sourceIds`, `validFrom` / `validTo` and an optional `variantOf`.
- Builders (`src/scene/builders/*`) turn the spec into meshes: walls with openings, two-tone gable roofs, chimney, porch, extension, garage, fence runs with posts, driveway and walkway slabs, and parcel platform.
- **Why code:** it's reproducible and reviewable in git; dimensions trace to records; dated variants (fence states, 2015 antenna) are data, not separate models; Codex can work on it without a desktop 3D tool; and owner photos can correct it by editing numbers.
- Unknown dimensions (e.g. extension length ≈ 8.5 ft, an inference) are explicit `estimated` entries with notes, never silent constants.
- Escape hatch: if 1.0 polish needs sculpted detail, export the generated model to GLB and refine it in Blender, keeping the spec as the source of truth for dimensions.
- Geometry must follow `research/VISUAL_REFERENCE_BRIEF.md` and the "do not copy" table in CREATIVE_DIRECTION §5: no dormers, door in the NW gable end, two-tone roof, one SE chimney, white SE extension, detached garage, driveway from 139th Ave, and nothing on the 138-33 side.

### 4.3 Selectable objects
Named groups get stable IDs (`house`, `roof`, `chimney`, `front-door`, `extension`, `garage`, `driveway`, `fence-front`, `fence-rear`, `maple`, `parcel`). Raycast selection gives a highlight effect and a compact popup linked to that object's records. There are no permanent per-object buttons (CREATIVE_DIRECTION §6).

## 5. Rendering design (signature style)
Mapping the approved style to concrete techniques:

| Signature element | Technique |
|---|---|
| Dark-blue night atmosphere | Gradient environment and fog; AgX or ACES tone mapping; low cool ambient light plus one soft "moon" directional light with shadows |
| Glowing gold parcel boundary and curb | Emissive tube/ribbon geometry along the parcel edge, with **selective bloom** |
| Fine cyan/gold grid and circuit lines | Custom shader on a large ground plane: procedural street grid, thin anti-aliased lines, travelling light pulses, distance fade |
| Ground reflections | drei `MeshReflectorMaterial` (blurred) on the ground plane. Disabled on lower tiers |
| Atmospheric bokeh particles | Instanced camera-facing sprites in a background shell (soft discs in gold, cyan and rose) with slow drift. Cheaper and more controllable than true depth-of-field |
| Warm windows | Emissive window materials with subtle fake-interior cards (no interior modelling, per PRD), plus bloom |
| Lanterns and path lights | Emissive bulbs plus a few real point lights near the entrance only; the rest are faked with light cards and bloom to keep costs down |
| Luxury-rendering materials (25%) | PBR materials for brick, siding, shingle, concrete and lawn. Procedural or permitted CC0 textures only (no Google imagery, per IMAGERY_MANIFEST); baked ambient occlusion via contact shadows |
| Stylized vegetation | Instanced leaf-cluster meshes with a wind-sway vertex shader; signature red maple as a hand-tuned asset; stylized lawn shader |
| Idle life | Slow particle drift, grid pulses and a gentle camera breathe. No sound |

**Post-processing chain (desktop Showcase tier):** selective bloom, SMAA, vignette, mild colour grading. Optional subtle depth-of-field for cinematic presets only.

**Quality tiers:** Showcase (desktop default: full chain, DPR up to 2), Balanced (reduced shadows and particles), Simple (phone: no reflector, fewer particles, DPR 1–1.5, lighter vegetation). The tier is auto-selected from device and GPU hints, can be overridden manually, and the choice is remembered per browser. No numeric performance targets are set (ROADMAP 1.0); FPS is measured and reported per preset (§11).

**Camera:** drei `CameraControls` (orbit, pan, zoom, damped) with limits that keep the property framed; animated transitions to the Front, Side, Rear and Top presets and Reset. Preset definitions are data, so the 1.0 cinematic tour can reuse them as keyframes.

## 6. Interface architecture
- **Layout:** a persistent full-screen `<Canvas>` with a DOM overlay layer: top nav, right camera rail, left info tab, right collapsible panel, and bottom timeline pill/drawer. This matches the four approved mockups.
- **Modes** are store state, not separate pages that remount the scene: `explorer | financials | chronicle | photos`. Only one primary data layer is active at a time (PRD). Markers and statistics on the model are optional toggles. URL query sync (`?mode=financials&date=2021-03-08`) gives shareable deep links within the private app.
- **Design tokens** (`src/ui/tokens.css`): navy surfaces, gold accent and active state, cyan for timeline and digital accents, a serif display font for headings and a sans-serif font for values, all self-hosted via `next/font`. Contrast is checked against WCAG AA.
- **Panels:** Financials (Overview/Assessments tabs, value cards, per-year chart, source details), Chronicle (event detail and source link), Photos (filters, nearest-date indicator, cards, expand-to-lightbox), and an Info drawer.
- **Evidence badges:** one shared `<Evidence status=… />` component and an info popover showing source, date, confidence and notes. Every number in the UI renders through a `<Value record=…>` component that requires a record. There is no way to print a bare number.
- **Responsive:** desktop is first. On phone, panels become bottom sheets and the camera rail collapses to a menu. A phone-specific design pass comes later (no mobile mockup approved).

## 7. Data model
### 7.1 Principles
Raw research files are **inputs and are never modified**. The app reads only normalised, validated output. Conflicts are preserved as data rather than resolved in code.

### 7.2 Core types (Zod schemas, `src/data/schema.ts`)
```ts
Evidence = 'verified' | 'observed' | 'owner_provided' | 'estimated'
         | 'derived_approximate' | 'historical_approximation' | 'unknown'

Source   { id: 'S1'…'S16', name, type: 'official'|'secondary'|'imagery'|'avm'|'context'|'owner',
           url?, retrieved, rights: 'usable_data'|'link_only'|'owner_permitted'|'unknown' }

DateSpec { exact?: 'YYYY-MM-DD' | 'YYYY-MM' | 'YYYY', from?, to?, label?, approximate: boolean }

Fact     { id, category: 'identity'|'parcel'|'building'|'environment'|'context',
           field, value, unit?, effective?: DateSpec, evidence, confidence, sourceIds[], notes? }

FinancialEntry { id, kind: 'recorded_sale'|'dof_market_value'|'assessed_value'|'taxable_value'
                 |'property_tax'|'avm_estimate', taxYear?, date?, amountUsd: number|null,
                 evidence, confidence, sourceIds[], notes? }   // kinds never mixed in one series

ChronicleEvent { id, date: DateSpec, type: 'construction'|'transfer'|'finance_record'|'imagery'
                 |'exterior_change'|'addition'|'permit'|'damage'|'news'|'weather'|'context',
                 importance: 1|2|3, scope: 'property'|'neighbourhood', title, detail,
                 evidence, confidence, sourceIds[], geometryChanges?: GeometryChange[] }

Photo   { id, date: DateSpec, viewpoint: 'front'|'side_139th'|'side_250th'|'rear'|'aerial'|'other',
          sourceId, rights, storage: 'stored'|'link_only', url?, blobKey?, caption?, evidence }

Conflict { id, topic, statements: {value, sourceId}[], status: 'unresolved'|'resolved', notes }

GeometryElement { id, kind, params, evidence, sourceIds[], validFrom?: DateSpec, validTo?: DateSpec,
                  variantOf? }
```
- **Mapping from current files:** `property.json` becomes Facts, FinancialEntries (sales, AVMs) and Conflicts; `financial_history.csv` becomes FinancialEntries (one per kind per year, including the low-confidence 2026/27 $6,669 row linked to its Conflict); `chronicle.csv` becomes ChronicleEvents; `SOURCE_INDEX.md` becomes Sources (a hand-maintained `sources.json` seeded from it); `building_footprints.geojson` becomes GeometryElement params; IMAGERY_MANIFEST entries become `link_only` Photos (no copies; Google/Bing are never stored).
- **Mockup placeholders are not data:** the invented 1945/1975 photo entries are never imported. An empty archive shows the "Photo not yet available" state.
- **Labels:** the ACRIS source shows as "ACRIS — NYC Dept. of Finance, City Register". DOF values via PropertyShark show as "NYC DOF (via PropertyShark, secondary)" until direct verification.

### 7.3 Time model
- A single `selectedDate` (default: present) lives in the store.
- `resolveStateAt(date)` is a pure function that returns visible geometry variants and applicable records, and flags anything whose validity at that date is approximate or unknown.
- Fence example: silver chain-link (observed Aug 2012) → none (Sep 2015 – Nov 2022) → black chain-link (installed between Nov 2022 and Oct 2024, rendered with an "approximate date" badge during the bracket).
- **Before Aug 2012 there is no verified exterior imagery.** Approved (D6): show present-day massing in a muted "appearance unverified" treatment, with only the dated records active.
- Built in Phase 0.3 as plumbing (present day only). Phase 0.4 adds the timeline UI and transitions on top, without changing the model.

## 8. Import and update pipeline
1. Muse delivers raw research into `research/` and `data/`; originals are kept unchanged.
2. `pnpm import` runs `scripts/import/*`: parse, normalise, validate with Zod, and write `app-data/real/*.json` with stable IDs.
3. Validation **fails the import** on: a missing evidence status or source; an unknown source ID; an estimate stored under a verified kind; a date range with from > to; duplicate IDs; or a geometry element without evidence. It **warns** on new conflicts and low-confidence values used in headline cards.
4. A human reviews the git diff of `app-data/real/` (batch review per PRD). Routine automatic updates stay deferred.
5. A unit test reruns the import and confirms the committed output is current.

## 9. Privacy, authentication and hosting
- **Repository:** private GitHub repository. No secrets in git (`.env.local` is ignored; secrets go in Vercel environment variables). Nothing private goes in `public/`; data and photos are served only by authenticated route handlers.
- **Research files (D4, approved):** `research/` and `data/` are committed to the private repo so the import is reproducible.
- **Authentication (D3, approved): Auth.js with Google sign-in and an allowlist of exactly two accounts** (Victor and Sharice). It's free, there are no passwords to manage, and sessions are server-verified. Middleware protects every route except the sign-in page; route handlers re-check the session.
- **Hosting:** Vercel. Local development first, then a private production deployment. Indexing is blocked (`X-Robots-Tag: noindex`, robots disallow) as defence in depth. Preview deployments are also behind the same app auth.
- **Owner photos (when provided):** stored outside the repo in private object storage, served only through `/api/photos/[id]` after the session check. Vercel Blob is the candidate. Before any photo upload, confirm the storage option keeps files private and check its cost (D7, approved).
- **Third-party imagery:** Google Street View and Bing are link-out only, opening in a new tab from photo cards. They are never embedded, cached or used as textures (IMAGERY_MANIFEST rights).

## 10. Proposed repository layout
```
app/                    Next.js routes (page, sign-in, api/data, api/photos/[id])
src/scene/              Canvas, lighting, post, ground grid shader, particles, camera presets
src/scene/builders/     parametric house/garage/fence/vegetation builders
src/ui/                 nav, panels, timeline, evidence components, tokens.css
src/data/               zod schemas, server-only loaders, resolveStateAt()
src/state/              zustand store
scripts/import/         raw → normalised import + validation
app-data/real/          normalised real data (generated, committed, reviewed)
app-data/fixtures/      fictional fixtures (tests/dev only)
tests/unit, tests/e2e   vitest, playwright
docs/ research/ data/ mockups/ references/   (existing, unchanged)
```

## 11. Testing strategy
| Layer | What | Tool |
|---|---|---|
| Schema and import | Every record validates; derived geometry numbers in §4.1 reproduced; committed output is current; conflicts preserved | Vitest |
| Data honesty | Every rendered number comes from a record; estimates never appear under a "Recorded"/"Verified" label; mockup placeholder photos absent | Vitest and component tests |
| Fixture isolation | Production build fails if anything imports `app-data/fixtures` | Build-time check plus a test |
| Time logic | `resolveStateAt` for 2012, 2016, 2023 (fence bracket), 2025 and present | Vitest |
| Auth | Unauthenticated page, `/api/data` and `/api/photos` requests redirect or return 401; non-allowlisted account rejected | Playwright |
| Visual regression | Screenshots of each camera preset and mode at a fixed seed and time, with tolerance for GPU noise; compared against approved baselines, which are then reviewed against the mockups by a human | Playwright (GPU-enabled Chromium where available) |
| Performance (measure, not gate) | FPS and frame time per preset and tier logged to a report | Playwright plus an in-app stats probe |
| Accessibility | Contrast of tokens, keyboard navigation of panels and timeline | axe via Playwright |

## 12. Cost (baseline target: $0/month)
| Item | Plan | Cost |
|---|---|---|
| Vercel hosting | Hobby (personal, non-commercial) | $0 |
| GitHub private repo | Free | $0 |
| Auth.js plus Google OAuth | Open source / free | $0 |
| Fonts, three.js stack, CC0 textures | Open source / free | $0 |
| Photo storage (later) | Vercel Blob or similar; small volume | Likely within free allowance. **Confirm before use** |
| Possible upgrades | Vercel Pro, paid imagery or records (BACKLOG 14–16) | **Approval required** |

Prices and plan limits must be rechecked when the account is set up.

## 13. Mapping to roadmap phases
| Phase | Architecture delivered |
|---|---|
| 0.1 Foundation | Repo scaffold, auth gate, local frame, geometry spec plus builders (house, garage, extension, parcel, driveway, fences, trees), camera presets, selection, a basic scene and lighting, import pipeline for geometry and sources, unit tests |
| 0.2 Signature style | Grid shader, parcel glow, bloom chain, particles, reflector ground, PBR and stylized materials, vegetation shaders, quality tiers, visual-regression baselines |
| 0.3 Living database (MVP) | Full import (facts, financial, chronicle, photos-as-links), all four panels, evidence components, `resolveStateAt` (present only), auth E2E, private Vercel deploy |
| 0.4 Time Machine | Timeline drawer, playback (speeds, event pauses), geometry variant transitions, date-synchronised photos, uncertainty treatments |
| 1.0 Masterpiece | Cinematic tour from preset keyframes, material and lighting polish, optional GLB refinement, WebGPU evaluation |

## 14. Decisions (all approved 2026-11-27)
| # | Decision | Approved choice |
|---|---|---|
| D1 | App framework and 3D stack | Next.js, React Three Fiber and three.js (WebGL2) |
| D2 | Geometry workflow | Parametric geometry spec plus code builders; Blender/GLB only as a 1.0 refinement |
| D3 | Authentication | Auth.js with Google sign-in and a two-account allowlist |
| D4 | Research files in the private repo | Yes: commit `research/` and `data/` to the private repo |
| D5 | Parcel placement until the official polygon is found | 50 × 100 ft rectangle aligned to the footprints, labelled "dimensions verified, position approximate" |
| D6 | Pre-2012 appearance | Muted "appearance unverified" massing; no invented historical states |
| D7 | Owner photo storage | Private object storage behind the auth check; confirm privacy and cost before first upload |
| D8 | Performance targets | None for now; measure and report FPS per preset (consistent with ROADMAP) |

## 15. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Recognisability without owner photos | Build from the verified brief; the geometry spec makes later corrections cheap; request owner photos before 0.2 visual lock |
| Mockup geometry creeping into the model | "Do not copy" table (CREATIVE_DIRECTION §5) as review criteria; screenshot review against the research brief, not only the mockups |
| Bloom and particles overwhelming readability | UI in the DOM; selective bloom only; panel backdrop blur and contrast tokens |
| Headless WebGL screenshot flakiness | Fixed seeds and time; tolerance thresholds; GPU-enabled runner when available; human approval of baselines |
| Phone performance | Simple tier, DPR cap, reflector and particle reduction |
| Private data leaking via static assets or previews | No private files in `public/`; auth on all routes and previews; noindex; tests for unauthenticated access |
| Imagery rights | Link-only for Google/Bing enforced by the `rights` field; import rejects `storage: stored` for link-only sources |

## 16. Explicitly out of scope (unchanged from PRD)
Interior modelling, neighbouring buildings, additional themes, live integrations, automated monitoring, risk simulations, sound.
