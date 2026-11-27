# Phase 0.2 — Signature style: report
Built by Claude, 2026-11-27. Scope: ROADMAP 0.2. Style source: `docs/CREATIVE_DIRECTION.md` and `mockups/APPROVED_SIGNATURE_STYLE.png`. Geometry source: `research/VISUAL_REFERENCE_BRIEF.md` and `app-data/real/geometry.json` (unchanged apart from the earlier official-parcel update).

## 1. What was built (all in `src/scene/style/` unless noted)
| Signature element (CREATIVE_DIRECTION §3) | Implementation |
|---|---|
| Dark-blue night atmosphere | `Atmosphere.tsx`: gradient sky dome with a faint warm horizon glow, matching fog, cool moonlight with shadows, blue fill, soft cyan rim light |
| Glowing gold parcel boundary and curb | `GlowLines.tsx`: HDR gold lines on the sidewalk curb and lot edge, derived from the verified lot extents; three slim marker posts |
| Cyan/gold ground grid | `GridGround.tsx`: anti-aliased shader grid with gold nodes, travelling pulses, distance fade; blurred reflections on the Showcase tier |
| Luxury-material accents (25%) | `surfaces.ts`: procedural textures for brick, siding, shingle (both roof directions), concrete, lawn, chain-link and warm window glass. Metric UVs, so every material keeps one real-world scale. No photos or third-party imagery |
| Warm windows, lanterns, path lights | Emissive window glass, two porch lanterns with real point lights, twelve path lights with light pools (`Ambience.tsx`) |
| Atmospheric bokeh | `Particles.tsx`: drifting soft discs in gold, cyan and rose |
| Stylized vegetation | `vegetation.ts`: merged lumpy leaf clusters with vertex-colour ramps, a hand-tuned red maple with limbs and warm emissive, gentle wind sway |
| Bloom, tone mapping, vignette, SMAA | `Effects.tsx` (`@react-three/postprocessing` 3.2.2, `postprocessing` 6.39.6; free, open source, approved in the architecture doc) |
| Quality tiers | `quality.ts`: Showcase (reflections, full chain, 260 discs), Balanced (no reflections, lighter chain), Simple (no composer, 24 discs, no shadows). The tier is remembered per browser; first visit guesses from device hints |

## 2. Data honesty
- Lanterns, path lights, marker posts, light pools, grid and bokeh are stylistic (CREATIVE_DIRECTION §3.4). They live in scene code only, are never raycast, and a unit test fails if any appear in `geometry.json`.
- Window glow does not claim interior lighting or window counts. Basement windows stay dark.
- Mockup deviations (dormers, shutters, boulder, hydrangeas, cream garage, wall lantern on the garage) were **not** copied (CREATIVE_DIRECTION §5).

## 3. Verification
- Import, `tsc`, eslint and prettier clean. 35 unit tests and all 10 Playwright tests pass (selection, camera limits, presets still work with the new materials and effects).
- Looked at all three tiers in the browser pane; five review screenshots regenerated in `tests/e2e/__screenshots__/`.
- **Not measured:** frame rate. Tests run on software GL, which is far slower than real hardware, so no FPS numbers are claimed (ROADMAP 1.0 sets no targets). The first Showcase load took several seconds to compile shaders on that software renderer.

## 4. Known gaps and decisions for review
1. **Default camera framing:** it looks steeply down, so only the far ground is behind the property. Bokeh therefore floats above the ground around the lot, not across a sky as in the mockup. A lower hero preset would fill the background better.
2. **Garage door side** is still derived, not confirmed. Garage shows white siding on all sides.
3. **Roof rim light:** the cyan edge glow on the roofs in the mockup is not done (a thin emissive roof-edge line is the likely route).
4. **UI:** top bar, camera rail and popup are readable and unobstructive, but the mockup's left "i" tab and bottom "Present day" pill are not built (they belong with 0.3 and 0.4).
5. **Build year** is shown as an open conflict (1945 record vs 1939–41 tax photo) in the object facts, not in the 3D scene.
6. **Owner photos** are still outstanding; the visual lock the architecture asked for before 0.2 has not had them.
7. **Dependencies added:** `@react-three/postprocessing`, `postprocessing`.
