# Phase 0.1 — Foundation · Report
Built by Claude, 2026-11-27 · Brief: `docs/PHASE_0.1_BRIEF.md` (written for Codex; followed as binding) · Architecture: `docs/TECHNICAL_ARCHITECTURE.md` v1.0

**Status: built and tested locally, stopped at the Phase 0.1 gate for review. Phase 0.2 not started.** Nothing was pushed, deployed, purchased or signed up for.

## 1. What was built
- **A private Next.js app** in this folder: one full-screen 3D scene of the real property behind a sign-in gate.
- **The property, built from data, not by hand-modelling.** `app-data/real/geometry.json` holds every dimension (in feet) with its evidence (verified / observed / estimated / derived approximate), its source IDs and a note. Code builders turn it into the 3D model:
  - house walls 22 × 42 ft (PLUTO), brick-red, with the 1.5-storey roof
  - **two-tone roof**: steep dark NW gable (ridge 21.7 ft, official) + lower pale main roof with the reddish band at its SE edge; cream siding in the gables; **no dormers**
  - **one** red-brick chimney toward the SE
  - **front door in the NW gable end facing the corner**: white, arched, oval glass, stone surround, small gable porch roof, red-brown steps with black railings
  - windows: two double-hung and two barred basement windows on the 139th Ave (SW) wall, one window on the NE wall; other walls left blank (undocumented)
  - white single-storey SE extension
  - detached white single-car garage at the official footprint (19.3 × 10.2 ft, 11.5 ft high), dark roof, door facing 139th Ave
  - concrete driveway **from 139th Ave** to the garage plus a pad beside the extension; **no driveway on 250th St**
  - concrete walkway from the gate to the steps
  - black chain-link fence (~4 ft) on both street frontages with a black gate on 250th St; short white vinyl rear section
  - red Japanese maple in the front yard; four mature trees (NW corner, north corner, two along 139th Ave); low shrubs at the front
  - 50 × 100 ft parcel platform (dimensions verified, position approximate per D5); generic sidewalks outside both frontages, tagged as context
- **Navigation:** damped orbit / pan / zoom; animated presets **Front · Side · Rear · Top · Reset** on the right rail and on keys **1–5**. The camera can't go below ground, inside the house or garage, or lose the property.
- **Selection:** hover outline plus click for the 11 objects (`house`, `roof`, `chimney`, `front-door`, `extension`, `garage`, `driveway`, `fence-front`, `fence-rear`, `maple`, `parcel`). A compact popup shows the name, key facts, an evidence badge on each fact, and source IDs (hover a source ID for its name). Esc, the × or clicking empty space clears it. There are no permanent per-object buttons.
- **Overlay matching mockup 01:** placeholder title, the four mode tabs (only Property Explorer active; the others say "Coming in a later phase"), camera rail, quality-tier stub (Showcase / Balanced / Simple: pixel ratio and shadows), sign-out.
- **Keeping the house the hero:** tree canopies that come between the camera and the house fade to a ghost and become click-through, then return when the view clears.
- **Auth:** Google sign-in limited to an allowlist of two emails. Every page and `/api/data` requires a session (`proxy.ts`, the Next 16 name for middleware, plus server-side re-checks). `X-Robots-Tag: noindex, nofollow` on every response and a disallow-all `robots.txt`. A test-only sign-in exists for local work and E2E and is compiled out of production builds.
- **Import pipeline** (`pnpm run import`): sources S1–S16 (Google/Bing marked link-only), footprints projected into the lot frame, geometry validation that fails on missing evidence, unknown sources, "verified" without an official source, anything on the never-add list (pool, deck, shed, dormer, shutter, boulder, second chimney, attached or brick garage) and a mirrored layout.

## 2. How to run it
Requires Node 22. pnpm is run through npx because this Mac's corepack has outdated signing keys (`corepack pnpm` fails).

```bash
npx -y pnpm@10.12.1 install
```

**Local, without Google (test sign-in):**
```bash
NEXTAUTH_URL=http://localhost:3000 AUTH_TEST_MODE=1 ALLOWED_EMAILS=you@example.test npx next dev
```
Open http://localhost:3000, type the allowlisted email in "Test sign-in" and you're in. (The desktop app's preview uses `.claude/launch.json`, port 3100.)

**With Google sign-in (Vic sets this up; nothing created by Claude):**
1. Google Cloud Console → APIs & Services → Credentials → *Create OAuth client ID* → Web application.
2. Authorised redirect URI: `http://localhost:3000/api/auth/callback/google` (later also the Vercel URL + `/api/auth/callback/google`).
3. Copy `.env.example` to `.env.local` and fill in `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAILS` (the two Google accounts, comma-separated) and `NEXTAUTH_URL`.
4. `npx next dev`. The sign-in page then shows "Sign in with Google"; leave `AUTH_TEST_MODE` unset.

Scripts: `pnpm dev | build | start | lint | typecheck | test | test:e2e | check:build`, plus `pnpm run import`. The import needs `run` because plain `pnpm import` is pnpm's own built-in command (it fails with "No lockfile found"). `pnpm build` runs the build-output check automatically.

## 3. Test results (2026-11-27)
| Check | Result |
|---|---|
| `typecheck` (tsc, strict) | ✅ pass |
| `lint` (eslint + next rules) | ✅ pass |
| `test` (vitest, 33 tests) | ✅ 33/33 passed (09:25, and again at 09:38 after the `data/` files were restored; see §9) |
| `test:e2e` (Playwright, 10 tests) | ✅ 10/10 passed: unauthenticated `/` redirects; unauthenticated `/api/data` → 401; noindex + robots; non-allowlisted user rejected; allowlisted user loads scene and data; each preset animates and settles at its pose; number keys; Reset after orbiting; hard zoom stays above ground and outside the house; every object selectable by a real click with an evidence badge, and Esc clears |
| `next build` + `check:build` | ✅ build OK; the check scanned 151 output files and found no test provider and no fixture data |
| `pnpm run import` | ✅ OK (09:20, and again after the `data/` files were restored) |

Unit tests cover: schema validation, footprint extents ±0.3 ft (house s −33.6…16.9, t −5.1…19.1; garage s 34.0…44.3, t −7.1…12.3), parcel sanity margins ±1 ft (front 16.4, SW 19.9, NE 5.9, rear 5.7), never-add rejection, mirrored-layout rejection, fixture isolation, test-auth absent in production config, evidence and valid source IDs on every element, committed import output current, and camera limits proven to keep the camera out of the house.

## 4. Screenshots (review baselines, 1920×1080, headless software rendering)
`tests/e2e/__screenshots__/preset-default.png`, `preset-front.png`, `preset-side.png`, `preset-rear.png`, `preset-top.png`. These are for human review, not a hard gate. Software rendering (SwiftShader) makes shading flatter than on a real GPU.

## 5. Every estimated or derived value
Generated from `app-data/real/geometry.json` (rendered elements, excluding generic context). "Derived approximate" means calculated from records with an approximate position or value.

| Element | Parameter | Current value | Evidence | Note | What would confirm it |
|---|---|---|---|---|---|
| parcel | sMin | -50 ft | derived approximate |  | Official Digital Tax Map polygon (BACKLOG 9) |
| parcel | sMax | 50 ft | derived approximate |  | Official Digital Tax Map polygon (BACKLOG 9) |
| parcel | tMin | -25 ft | derived approximate |  | Official Digital Tax Map polygon (BACKLOG 9) |
| parcel | tMax | 25 ft | derived approximate |  | Official Digital Tax Map polygon (BACKLOG 9) |
| parcel | platformThickness | 0.6 ft | estimated | Display only: miniature platform edge, not a property dimension. | Official Digital Tax Map polygon (BACKLOG 9) |
| house-walls | sMin | -32.5 ft | derived approximate | Roof outline NW edge -33.6 plus ≈1.1 ft eave. | Owner photos / tape measure of wall and eave heights |
| house-walls | tCenter | 7.0 ft | derived approximate | Centre of the roof outline t range (-5.1 to 19.1). | Owner photos / tape measure of wall and eave heights |
| house-walls | eaveHeight | 10 ft | estimated | Not in any record; brick ground floor over a raised basement. | Owner photos / tape measure of wall and eave heights |
| house-walls | basementBandHeight | 2.5 ft | estimated | Height of the first floor above grade; sets the door sill and basement-window band. | Owner photos / tape measure of wall and eave heights |
| roof-nw | sMin | -32.5 ft | derived approximate |  | Owner photos of the NW gable and roof junction |
| roof-nw | sMax | -16.5 ft | estimated | Length of the steep front section (16 ft) is not recorded; the main section is described as larger in plan. | Owner photos of the NW gable and roof junction |
| roof-nw | pitchDeg | 46.7 deg | estimated | Derived from verified ridge height, estimated 10 ft eave and 11 ft half-width. | Owner photos of the NW gable and roof junction |
| roof-nw | overhang | 1.1 ft | derived approximate |  | Owner photos of the NW gable and roof junction |
| roof-se | sMin | -16.5 ft | estimated |  | Owner photos of the main roof (side view) |
| roof-se | sMax | 9.5 ft | derived approximate |  | Owner photos of the main roof (side view) |
| roof-se | ridgeHeight | 16.35 ft | estimated | From the estimated 30° pitch; lower than the NW ridge as observed. | Owner photos of the main roof (side view) |
| roof-se | pitchDeg | 30 deg | estimated |  | Owner photos of the main roof (side view) |
| roof-se | overhang | 1.1 ft | derived approximate |  | Owner photos of the main roof (side view) |
| chimney | s | 4 ft | estimated |  | Owner photo of the roof from 139th Ave |
| chimney | t | 10 ft | estimated |  | Owner photo of the roof from 139th Ave |
| chimney | width | 2.5 ft | estimated |  | Owner photo of the roof from 139th Ave |
| chimney | depth | 2 ft | estimated |  | Owner photo of the roof from 139th Ave |
| chimney | topHeight | 20 ft | estimated |  | Owner photo of the roof from 139th Ave |
| front-door | width | 3 ft | estimated |  | Owner photo of the front door |
| front-door | height | 6.8 ft | estimated |  | Owner photo of the front door |
| front-door | sillHeight | 2.5 ft | estimated |  | Owner photo of the front door |
| front-porch | width | 6 ft | estimated |  | Owner photo of the front door |
| front-porch | depth | 3.5 ft | estimated |  | Owner photo of the front door |
| front-porch | eaveHeight | 10 ft | estimated |  | Owner photo of the front door |
| front-porch | peakHeight | 12 ft | estimated |  | Owner photo of the front door |
| front-steps | count | 4  | estimated |  | Owner photo of the steps |
| front-steps | width | 5 ft | estimated |  | Owner photo of the steps |
| front-steps | run | 4 ft | estimated |  | Owner photo of the steps |
| front-steps | rise | 2.5 ft | estimated | Equals the estimated first-floor height above grade. | Owner photo of the steps |
| window-sw-1 | along | -22 ft | estimated |  | Owner photos |
| window-sw-1 | sillHeight | 5 ft | estimated |  | Owner photos |
| window-sw-1 | width | 3 ft | estimated |  | Owner photos |
| window-sw-1 | height | 4.5 ft | estimated |  | Owner photos |
| window-sw-2 | along | -6 ft | estimated |  | Owner photos |
| window-sw-2 | sillHeight | 5 ft | estimated |  | Owner photos |
| window-sw-2 | width | 3 ft | estimated |  | Owner photos |
| window-sw-2 | height | 4.5 ft | estimated |  | Owner photos |
| window-sw-basement-1 | along | -26 ft | estimated |  | Owner photos |
| window-sw-basement-1 | sillHeight | 0.6 ft | estimated |  | Owner photos |
| window-sw-basement-1 | width | 2 ft | estimated |  | Owner photos |
| window-sw-basement-1 | height | 1.2 ft | estimated |  | Owner photos |
| window-sw-basement-2 | along | -10 ft | estimated |  | Owner photos |
| window-sw-basement-2 | sillHeight | 0.6 ft | estimated |  | Owner photos |
| window-sw-basement-2 | width | 2 ft | estimated |  | Owner photos |
| window-sw-basement-2 | height | 1.2 ft | estimated |  | Owner photos |
| window-ne-1 | along | -27 ft | estimated | Beside the front section. | Owner photos |
| window-ne-1 | sillHeight | 5 ft | estimated |  | Owner photos |
| window-ne-1 | width | 3 ft | estimated |  | Owner photos |
| window-ne-1 | height | 4.5 ft | estimated |  | Owner photos |
| extension | sMin | 9.5 ft | derived approximate | End of the 42 ft PLUTO walls. | Owner photos of the SE extension (all sides) |
| extension | sMax | 16.4 ft | estimated | Roof outline SE edge 16.9 minus ≈0.5 ft eave. Brief's 8.5 ft (50.5 - 42) ignores the eaves; with eaves removed the inferred length is ≈6.9 ft. | Owner photos of the SE extension (all sides) |
| extension | tMin | -4 ft | estimated | Full house width assumed: the official outline is one uniform-width rectangle. | Owner photos of the SE extension (all sides) |
| extension | tMax | 18 ft | estimated |  | Owner photos of the SE extension (all sides) |
| extension | height | 9 ft | estimated |  | Owner photos of the SE extension (all sides) |
| extension | roofPitchDeg | 5 deg | estimated | Low, light-coloured roof (observed); pitch estimated. | Owner photos of the SE extension (all sides) |
| extension | windowFace | se  | estimated | One small window (observed); face not documented. | Owner photos of the SE extension (all sides) |
| garage | eaveHeight | 8 ft | estimated |  | Owner photo of the garage door side |
| garage | ridgeAlong | t  | derived approximate | Ridge along the 19.3 ft side, gable facing SW. | Owner photo of the garage door side |
| garage | doorSide | sw  | derived approximate | The 19.3 ft side runs NE–SW and the driveway enters from 139th Ave, so the door is likely on the SW end. | Owner photo of the garage door side |
| garage | doorWidth | 8 ft | estimated |  | Owner photo of the garage door side |
| garage | doorHeight | 7 ft | estimated |  | Owner photo of the garage door side |
| driveway | sMin | 33 ft | estimated |  | Owner photo / aerial of the driveway |
| driveway | sMax | 45 ft | estimated |  | Owner photo / aerial of the driveway |
| driveway | tMax | -7.1 ft | derived approximate | Ends at the garage door. | Owner photo / aerial of the driveway |
| driveway-pad | sMin | 17.5 ft | estimated |  | Owner photo / aerial of the rear pad |
| driveway-pad | sMax | 33 ft | estimated |  | Owner photo / aerial of the rear pad |
| driveway-pad | tMin | -14 ft | estimated |  | Owner photo / aerial of the rear pad |
| driveway-pad | tMax | 4 ft | estimated |  | Owner photo / aerial of the rear pad |
| walkway | sMax | -36.5 ft | estimated | Meets the foot of the front steps. | Owner photo of the front walkway |
| walkway | tMin | 5.5 ft | estimated |  | Owner photo of the front walkway |
| walkway | tMax | 8.5 ft | estimated |  | Owner photo of the front walkway |
| fence-front-250th | height | 4 ft | estimated |  | Owner photos / dated aerial |
| fence-front-250th-b | height | 4 ft | estimated |  | Owner photos / dated aerial |
| fence-front-139th | height | 4 ft | estimated |  | Owner photos / dated aerial |
| fence-front-139th-b | points | 46, -25, 50, -25 ft | estimated |  | Owner photo of the 139th Ave fence near the driveway |
| fence-front-139th-b | height | 4 ft | estimated |  | Owner photo of the 139th Ave fence near the driveway |
| gate-front | t | 7 ft | estimated | Described as a corner gate aligned with the walkway; placed on the 250th St frontage in line with the door. | Owner photo of the front gate |
| gate-front | width | 3.5 ft | estimated |  | Owner photo of the front gate |
| gate-front | height | 4 ft | estimated |  | Owner photo of the front gate |
| fence-rear | points | 50, -25, 50, -8 ft | estimated |  | Owner photo of the rear fence |
| fence-rear | height | 6 ft | estimated |  | Owner photo of the rear fence |
| maple | s | -42 ft | estimated |  | Owner photo of the front yard |
| maple | t | -7 ft | estimated |  | Owner photo of the front yard |
| maple | height | 11 ft | estimated |  | Owner photo of the front yard |
| maple | canopyRadius | 5 ft | estimated |  | Owner photo of the front yard |
| tree-corner-nw | s | -46 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-corner-nw | t | -21 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-corner-nw | height | 30 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-corner-nw | canopyRadius | 10 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-north | s | -46 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-north | t | 21 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-north | height | 28 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-north | canopyRadius | 9 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-a | s | -18 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-a | t | -29 ft | estimated | In the sidewalk strip, outside the lot. | Owner photos / dated aerial (may be street trees) |
| tree-139th-a | height | 32 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-a | canopyRadius | 10 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-b | s | 8 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-b | t | -29 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-b | height | 30 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| tree-139th-b | canopyRadius | 9 ft | estimated |  | Owner photos / dated aerial (may be street trees) |
| shrubs-front | from | -34.5, -3.5 ft | estimated |  | Owner photos |
| shrubs-front | to | -34.5, 3.5 ft | estimated |  | Owner photos |
| shrubs-front | height | 2.5 ft | estimated |  | Owner photos |
| shrubs-front-b | from | -34.5, 10.5 ft | estimated |  | Owner photos |
| shrubs-front-b | to | -34.5, 17.5 ft | estimated |  | Owner photos |
| shrubs-front-b | height | 2.5 ft | estimated |  | Owner photos |

## 6. Undocumented elevations (left blank, not invented)
- **NE wall:** only one window (beside the front section) is documented; the rest of the wall is blank.
- **SE end of the extension:** one small window placed on the SE face; the face itself is an estimate. The Bing 3D mesh hints at "4 small windows + steps to the pad", but the brief calls that mesh unreliable, so it is not used.
- **NW gable above the door, and the upper gables generally:** no windows modelled.
- **The "small upper-gable window" on the SW (139th Ave) side** in the research: with the ridge running along the long axis the SW wall has no gable, so its position can't be placed without inventing a cross-gable. **Omitted**; owner photos needed.
- **Garage walls other than the door end:** blank.

## 7. Deviations from the brief, and why
1. **Builder:** Claude instead of Codex (Vic's direction). ROADMAP operating rules updated.
2. **Next.js 16 calls middleware "proxy":** the auth gate lives in `proxy.ts`. Same function as the brief's middleware.
3. **next-auth v4.24 (current stable)** instead of Auth.js v5 (still beta). Env names follow the brief (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAILS`), plus `NEXTAUTH_URL` for local callbacks (Vercel provides it automatically).
4. **Test sign-in condition:** the brief says `NODE_ENV === 'test' && AUTH_TEST_MODE === '1'`, but `next dev` always forces `NODE_ENV=development`, so that condition could never be true in a running app. The rule used is `NODE_ENV !== 'production' && AUTH_TEST_MODE === '1'`. Production safety is proven three ways: Next inlines `NODE_ENV=production` so the branch is dead code, a unit test checks the provider is absent with `NODE_ENV=production`, and the build-output check finds no trace of it.
5. **TypeScript 6.0 instead of 7.0:** typescript-eslint (used by Next's lint rules) doesn't support TS 7 yet.
6. **Camera limits:** colliders on the house made the camera jump through the house when orbiting. Instead, the orbit target is kept in a small box at the house centre and the minimum distance is 45 ft (≈14 m), which a unit test proves is always outside the house, porch and extension. The garage keeps a collider. Trade-off: the closest zoom is ~45 ft from the house centre.
7. **Extension length ≈6.9 ft, not the brief's 8.5 ft:** 8.5 = 50.5 − 42 ignores the roof-outline eaves. With the ~0.5–1.1 ft eaves removed, the inferred wall length is ≈6.9 ft. Still an estimate.
8. **Extension width = full house width (22 ft):** the official outline is one uniform-width rectangle. Estimated.
9. **NE side fence omitted** (the brief allows this): its present state is unknown.
10. **Gate position:** described as a "corner gate aligned with the walkway". Placed on the 250th St frontage in line with the door, because a straight walkway from the true corner would be diagonal. Estimated.
11. **NW/SE roof split at s = −16.5 ft:** the length of the steep front section (16 ft) is not recorded.
12. **Added (not in brief):** canopy fading so trees never hide the house, and a sign-out link. Tabs use `aria-disabled` instead of `disabled` so their tooltips show and stay keyboard-reachable.
13. **pnpm via `npx pnpm@10.12.1`:** the local corepack is broken (signature keys out of date).

## 8. Dependencies added (all free, open source)
- **Runtime:** next 16.4, react / react-dom 19.3, three 0.187, @react-three/fiber 9.8, @react-three/drei 10.7, zustand 5.1, zod 4.6, next-auth 4.24.
- **Dev:** typescript 6.0, eslint 10 + eslint-config-next 16, prettier 3, vitest 5, @playwright/test 1.65 (Chromium headless shell downloaded to the Playwright cache), @types/*.
- **Beyond the brief's list:** **tsx**, which runs the TypeScript import and check scripts (`pnpm run import`, `pnpm check:build`) without a build step.
- `@react-three/postprocessing` was not added, as instructed.

## 9. Open questions
**For owner photos:**
1. **Street frontages:** is the NE long side the interior lot line (shared with 138-33), with the NW short end facing 250th St? This is the working interpretation; the research wording says the NE side faces 250th St (CREATIVE_DIRECTION §5).
2. **Garage door side:** SW, facing 139th Ave (derived), or another side?
3. **Extension:** length, width, roof shape, windows, any steps to the pad.
4. **Where is the "upper-gable window" seen from 139th Ave?**
5. **Gate:** exact position on the 250th St fence, and is there an opening or gate at the driveway?
6. **Rear vinyl fence:** its full run, and the NE side fence today.
7. **Eave height, roof pitches, and where the steep front roof meets the main roof.**
8. Positions and sizes of the maple and the mature trees (some may be street trees).
9. **Raised by the 1980s tax photo** (`research/photos/tax-photo-1980s-b13618-l5.jpg`, added after this build): is there a window in the upper NW gable above the door? Does the door sit in a small projecting front gable? Is the chimney nearer the front than the SE estimate? And is the front ground floor brick, or was it once stone-textured? None of this has been applied to the model yet.

**Workspace changes during this session (not made by Claude):**
- *Resolved:* the four `data/` files (`property.json`, `financial_history.csv`, `chronicle.csv`, `building_footprints.geojson`) briefly disappeared from `data/` at about 09:29 and are now back. The import and all 33 unit tests pass again.
- *Merged:* the temporary `Sharices-Property-App-Photo-Archive-2026-11-27/` package has been folded into the workspace: `research/photos/` (15 NYC aerial crops 1924–2024 and a montage), `research/PHOTO_ARCHIVE.md` and `research/HIGGSFIELD_PROMPT_PACK.md`, plus the placard-verified **1980s tax photo** (question 9). Muse's copies of the README, `docs/` and the other research files were older than the reconciled workspace versions and were not taken. It contains no owner photos, so the questions above remain open. **It was not used in Phase 0.1.**
- The superseded `docs/* copy.md` files (pre-reconciliation PRD, CREATIVE_DIRECTION, RESEARCH_BRIEF, ROADMAP) and the merged Muse package folder and zip were moved to the Trash at Vic's direction.
- **Git:** the repository is initialised but nothing is committed yet. The `data/` question that held the first commit is now settled.
