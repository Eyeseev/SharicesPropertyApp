# Phase 0.1 — Foundation · Implementation Brief for Codex
Issued 2026-11-27 · Architecture: docs/TECHNICAL_ARCHITECTURE.md v1.0 (approved) · Roadmap gate: docs/ROADMAP.md §0.1

## 1. Objective
Build the working foundation of the private property app. It should show a **recognisable, correctly laid-out 3D model of the real property** (house, extension, detached garage, parcel, driveway, walkway, fences, trees), with free camera navigation, preset viewpoints and selection of major objects, behind authentication. Every dimension must trace to a record or be explicitly marked as an estimate.

This phase is about **correct geometry and solid structure**, not beauty. Signature styling is Phase 0.2. Avoid disposable visual polish (ROADMAP).

## 2. Read first (in this order)
1. `docs/TECHNICAL_ARCHITECTURE.md`: stack, data model, coordinate frame, repo layout, testing. **Binding.**
2. `research/VISUAL_REFERENCE_BRIEF.md`: the property's real geometry. **The authority for shape.**
3. `docs/CREATIVE_DIRECTION.md` §5: the table of mockup deviations you must **not** copy.
4. `data/building_footprints.geojson` and `data/property.json`: official dimensions and evidence.
5. `mockups/01_PROPERTY_EXPLORER.png`: the intended screen layout (nav, camera rail). Use it for layout only, never for geometry.

## 3. Authorised and not authorised
**Authorised:**
- Create the app in this folder.
- Run `git init` and commit locally.
- Install the open-source dependencies in §4.
- Write code, tests and docs.
- Run everything locally.

**Not authorised (stop and ask Vic):**
- Any paid service, paid asset or paid API.
- Creating any account or OAuth app. Vic creates the Google OAuth client and the GitHub repo himself.
- Pushing to any remote.
- Deploying anything (deployment is Phase 0.3).
- Editing or deleting anything in `research/`, `data/`, `mockups/` or `references/`. These are read-only inputs.
- Using Google Street View, Google Maps or Bing imagery as textures, files or embeds.
- Adding features from later phases (financial panels, Chronicle, photos, timeline, signature shaders).
- Inventing property facts.

## 4. Stack (approved; use current stable versions, exact versions pinned via lockfile)
- **Framework and language:** Next.js (App Router), TypeScript strict, pnpm.
- **3D:** three, @react-three/fiber, @react-three/drei.
- **App libraries:** zustand, zod, next-auth (Auth.js) with the Google provider.
- **Dev tooling:** vitest, @playwright/test, eslint, prettier.
- **Do not add yet:** `@react-three/postprocessing` (Phase 0.2).
- Any other dependency needs a one-line justification in the report, and it must be free and open-source.

## 5. Repository setup
- Use the layout in TECHNICAL_ARCHITECTURE §10. The existing folders stay where they are and are committed (decision D4).
- `.gitignore`:
  - `node_modules`, `.next`, `.env*` (with `!.env.example`), test output, `.DS_Store`
- `.env.example`:
  - `AUTH_SECRET=`, `AUTH_GOOGLE_ID=`, `AUTH_GOOGLE_SECRET=`, `ALLOWED_EMAILS=` (comma-separated, two accounts)
  - No real values anywhere in the repo.
- Nothing private in `public/`. In this phase `public/` should hold at most a favicon.
- `pnpm` scripts:
  - `dev`, `build`, `start`, `lint`, `typecheck`
  - `test` (vitest), `test:e2e` (playwright)
  - `import` (see §8)

## 6. Authentication (decision D3)
- Auth.js with the Google provider. In the `signIn` callback, allow only emails listed in `ALLOWED_EMAILS` (case-insensitive) and reject everything else.
- Middleware protects every route except the sign-in page and Auth.js endpoints. Route handlers (e.g. `/api/data`) re-check the session server-side.
- Add `X-Robots-Tag: noindex, nofollow` on all responses and a disallow-all `robots.txt`.
- **Test-only sign-in:** a credentials provider for Playwright, enabled **only** when `NODE_ENV === 'test'` **and** `AUTH_TEST_MODE === '1'`. Include a unit test plus a build-output check that prove it is absent from production builds.
- Until Vic provides OAuth credentials, local development uses test mode. Document how to switch.

## 7. Geometry specification (`app-data/real/geometry.json`)
Hand-author it, validate it with the Zod `GeometryElement` schema (TECHNICAL_ARCHITECTURE §7.2), and give every element `evidence`, `sourceIds` and `notes`.

Units are feet in the spec and metres in the scene. Unknown values stay **parameters marked `estimated`**, with the reason in `notes`. They are never silent constants.

### 7.1 Lot-aligned frame
Work in a lot-aligned frame:
- **s** = distance toward SE along the long axis
- **t** = distance toward NE across the lot
- origin = the PLUTO point (40.6628678, −73.7305241)
- long-axis bearing = **145.8°** (from the footprints)

The import script (§8) must reproduce these footprint extents, to ±0.3 ft, as a test:

| Element | s range (ft) | t range (ft) | Evidence |
|---|---|---|---|
| House roof outline (incl. eaves + extension) | −33.5 … 16.9 | −5.1 … 19.1 | verified polygon (S16) |
| Garage outline | 34.0 … 44.3 | −7.0 … 12.4 | verified polygon (S16) |

### 7.2 Parcel (decision D5)
- A 50 × 100 ft rectangle with s from −50 to 50 and t from −25 to 25, i.e. **centred on the PLUTO point** and aligned to the house axis.
- Evidence: `derived_approximate`. The dimensions are verified (PLUTO, S1). The position assumes the PLUTO point lies near the lot centre.
- Sanity check (passes): it gives a ≈16.5 ft front yard, a ≈20 ft SW side lawn along 139th Ave, a ≈6 ft NE side strip, and a ≈6 ft rear margin behind the garage. That matches the observed layout. Record this reasoning in `notes`.

### 7.3 Street frontages
- **NW short end (s = −50) faces 250th Street. SW long side (t = −25) faces 139th Avenue.** The lot is on the SE corner of the intersection.
- **NE long side (t = +25) is the interior lot line shared with 138-33.** Do not model 138-33's driveway or outbuilding.
- Known research wording issue: VISUAL_REFERENCE_BRIEF §1/§7 say the NE long side "faces 250th Street". That conflicts with the same brief's lot-line trap note, its NE side-fence note, and the corner-lot geometry. Use the interpretation above, mark it `observed` with a note, and list it in the report for owner-photo confirmation.

### 7.4 Elements to build

| Element | Spec | Evidence |
|---|---|---|
| Main house walls | 22 ft wide (t) × 42 ft long (s), starting at the NW end. Centre it inside the roof outline, leaving ≈1 ft eave overhang per side | verified dims (PLUTO S1); placement derived |
| Storeys / height | 1.5 storeys; max roof height 21.7 ft above grade (S16). Eave height and wall height are **estimated** parameters. Expose a basement-window band low on the walls | verified height; eave estimated |
| NW front gable section | Steep symmetric gable, ridge along s, gable end facing NW. **Dark grey/brown shingle** | observed |
| SE main roof | Larger, **visibly lower pitch**, **light/medium grey shingle**, narrow reddish-brown band at its SE edge. Pitches are estimated parameters, and the NW pitch must be steeper than the SE one | observed; pitches estimated |
| **No dormers** | None anywhere | observed (absence) |
| Chimney | **Exactly one**, red brick, toward the SE through the main roof's SE slope area. Position estimated | observed |
| Front door | Centred in the **NW gable end**: white, arched top, oval glass, stone surround, small projecting gable porch roof; red-brown concrete steps with black metal railings | observed |
| Walkway | Straight concrete path from the corner gate to the front steps | observed |
| Windows, SW (139th Ave) wall | Two ground-floor double-hung windows, two small barred basement windows low on the wall, one small upper-gable window | observed |
| Windows, NE wall | One ground-floor window beside the front section | observed |
| Other windows | Not documented. Omit them and list "undocumented elevations" in the report. Don't invent symmetry | unknown |
| Materials (flat colours this phase) | Red-brown brick ground floor on all sides; warm cream horizontal siding on the upper gables; white trim, frames and door | observed |
| SE extension | Single storey, white, at the SE end, inside the roof outline (≈8.5 ft long = 50.5 − 42, an inference). Width and roof are estimated. Low light roof, one small window | observed presence (PLUTO ext EG); size estimated; date unknown |
| Garage | Detached single-car white frame building with a white door and a **dark grey pitched roof**, at the §7.1 outline, 11.5 ft roof height. Its 19.3 ft side runs NE–SW, so the door is likely on the **SW end facing 139th Ave**. Mark that orientation `derived_approximate` | verified outline and height; door side derived |
| Driveway and pad | Light concrete from 139th Ave (t = −25) running NE to the garage door, widening to a pad beside the extension. Width estimated (single car). **No driveway on 250th St** | observed; width estimated |
| Fence, present day | **Black chain-link, ≈4 ft**, along the NW (250th St) and SW (139th Ave) frontages, with a black metal **corner gate** aligned to the walkway. Height estimated | observed (Oct 2024–May 2026) |
| Rear fence | White vinyl section at the rear (first seen May 2026). Exact run unknown, so keep it short and mark it estimated | observed; extent estimated |
| NE side fence | Low side fence on the NE lot line (seen 2017–18). Present state unknown. Include it as `estimated` with low visual weight, or omit it and report the choice | observed (historical) / unknown |
| Red Japanese maple | Middle of the front yard (NW). Small ornamental size | observed; position approximate |
| Mature trees | NW corner, north corner near 250th St, and along the 139th Ave edge, canopies overhanging the SW side. Positions approximate; street trees may stand outside the lot | observed; approximate |
| Shrubs | Low shrubs along the house base at the front | observed |
| Lawns | Small front lawn, SW side lawn strip, narrow rear lawn strip | observed |
| Context | Flat ground (~16 ft elevation, no grading). Generic sidewalk and curb strip outside the two frontages, tagged `context` (not property data). **No neighbouring buildings** | context |
| **Never add** | Pool, deck, shed, second chimney, dormers, shutters, boulder, attached or brick garage, mirrored layout | observed absence / CREATIVE_DIRECTION §5 |

### 7.5 Dated variants
Include the present-day state only, but fill in `validFrom` / `validTo` where they are known. For example, the black fence has `validFrom: {from: '2022-11', to: '2024-10', approximate: true}`.

Do not build the silver 2012 fence, the no-fence state or the 2015 antenna yet. They may appear as spec entries with `render: false` if that's useful for testing the schema.

## 8. Import (minimum for this phase)
- `scripts/import/sources.ts` creates `app-data/real/sources.json`, hand-seeded from `research/SOURCE_INDEX.md` (S1–S16) with rights fields. Google and Bing entries are `link_only`.
- `scripts/import/footprints.ts` reads the GeoJSON, projects it into the local and lot-aligned frames, writes `app-data/real/footprints.json`, and tests against the §7.1 table.
- `scripts/import/geometry.ts` validates `geometry.json`. It **fails** on: missing evidence; unknown source IDs; `verified` evidence on any value that has no official source; and any element in the "Never add" list.
- `app-data/fixtures/`: a small fictional property used only in tests. Production code must not import it, and a test and a build check must enforce this.
- Facts, financials, the Chronicle and photos are **not** imported until Phase 0.3.

## 9. Scene and interaction
- One persistent `<Canvas>` with a minimal DOM overlay matching the mockup layout:
  - a top bar with a placeholder title (the final name is open) and **disabled** tabs: Property Explorer, Financials, Chronicle, Photos. Later tabs get a "coming in a later phase" tooltip.
  - a right camera rail: **Front · Side · Rear · Top · Reset**.
  - a small quality-tier stub (Showcase / Balanced / Simple), stored in zustand.
- **Lighting and materials:** simple and neutral, enough to read the forms. Use flat or simple PBR colours that match the observed materials. No bloom, particles, reflections or grid shader yet.
- **Camera:** drei `CameraControls` with damping, orbit, pan and zoom, and limits so the camera can't go below ground, inside the house or lose the property. Animate the presets:
  - Front: from the 250th St/139th Ave corner, looking SE at the NW gable door. This should resemble the research brief §7 description.
  - Side: from 139th Ave, looking NE at the SW elevation.
  - Rear: from the SE.
  - Top: overhead, with the long axis vertical on screen.
  - Store the presets as data (`app-data/real/cameras.json`).
- **Selection:** hover highlight plus click to select. Selectable IDs: `house`, `roof`, `chimney`, `front-door`, `extension`, `garage`, `driveway`, `fence-front`, `fence-rear`, `maple`, `parcel`.
  - The compact popup shows the name, key dimensions, an evidence badge (verified / observed / estimated / derived approximate) and source IDs.
  - Escape or clicking empty space clears the selection.
  - No permanent per-object buttons.
- Keyboard: Tab and Enter work on the overlay controls; presets get number-key shortcuts.

## 10. Tests required
- **Unit (vitest):**
  - schema validation
  - footprint extents (§7.1, ±0.3 ft)
  - parcel sanity margins (§7.2, ±1 ft)
  - "never add" rejection
  - fixture isolation
  - test-auth provider absent in production configuration
  - every element has evidence and valid source IDs
- **E2E (playwright):**
  - unauthenticated requests to `/` and `/api/data` redirect or return 401
  - a non-allowlisted test user is rejected
  - an allowlisted test user loads the scene
  - each camera preset animates and settles
  - selecting each object ID opens a popup with an evidence badge
  - Reset restores the default view
- **Screenshots:** one per preset at a fixed size (1920×1080), saved to `tests/e2e/__screenshots__/` as **review baselines**. These are for human review in this phase, not a hard gate.
- Run `typecheck`, `lint`, `test` and `test:e2e` and report the results honestly, including failures.

## 11. Acceptance criteria (ROADMAP §0.1 plus this brief)
1. The property is recognisable against VISUAL_REFERENCE_BRIEF §7–§8, including:
   - the gable-end door facing the corner
   - the two-tone roof
   - brick below, cream above
   - the white extension and detached white garage bookending the SE
   - the driveway from 139th Ave
   - black chain-link on both frontages with a corner gate
   - the red maple in the front yard
2. Nothing in the "never add" list appears, and the layout is not mirrored.
3. Navigation is stable: presets, orbit, pan, zoom and Reset all work, and the camera can't get lost or clip inside geometry.
4. All the listed major objects are selectable, and each popup shows evidence and sources.
5. There is no interior, and there are no neighbouring buildings.
6. Every estimate and approximation is listed in the report.
7. Every route requires authentication, nothing private is in `public/`, and no secrets are committed.
8. All required tests exist and pass, or failures are reported with their output.

## 12. Report back
Write `docs/PHASE_0.1_REPORT.md` in plain language, covering:
- what was built
- how to run it, including setting up OAuth credentials
- test results
- screenshots, by path
- a **table of every estimated or derived value**, with its current number and what would confirm it
- undocumented elevations
- deviations from this brief and why
- the dependencies added
- open questions for owner photos, including the NE frontage wording issue (§7.3), the garage door side, and the extension size

Then stop for review at the Phase 0.1 gate. Do not begin Phase 0.2.
