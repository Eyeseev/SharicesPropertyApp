# Sharice's Property App — Project Workspace

Status (2026-11-27): **Research package delivered · creative direction and mockups approved · documentation reconciled.**
Technical architecture approved (`docs/TECHNICAL_ARCHITECTURE.md` v1.0). **Phase 0.1 Foundation built by Claude** (brief `docs/PHASE_0.1_BRIEF.md`, report `docs/PHASE_0.1_REPORT.md`), awaiting gate review. Implementation moved from Codex to Claude at Vic's direction (2026-11-27). Historical imagery collection remains a research follow-up.

Run locally: `docs/PHASE_0.1_REPORT.md` §2.

Confirmed property: **13837 250th Street, Rosedale, NY 11422** (Queens address form: 138-37 250th Street)
User-confirmed: 2026-11-26.

## Identity (verified)
- BBL: 4136180005 (Queens / Borough 4, Block 13618, Lot 5)
- BIN: 4289397
- Alternate address on record: 250-01 139th Ave (corner lot)
- Coordinates: 40.6628678, -73.7305241 (PLUTO 26v3)

## Final creative decisions (summary)
Full detail: `docs/CREATIVE_DIRECTION.md`.
- **Definitive signature style:** `mockups/APPROVED_SIGNATURE_STYLE.png` (the glowing-parcel Cape Cod image).
- **Artistic influence:** 75% luminous digital architectural miniature, 25% luxury architectural rendering.
- **Keep:** glowing parcel boundaries, fine cyan and gold details, atmospheric particles, warm windows, recognizable property architecture.
- **Four approved interface mockups** (Property Explorer, Financials, Chronicle/Time Machine, Photo Archive) define the intended user experience.
- **The property is the main attraction** in every view.
- **Priorities:** desktop graphical quality, interface usability, visual consistency.
- **Mockups set style and UX; verified research sets geometry.** The mockups' dormers, long-side front door, uniform roof, shutters, cream garage and boulder are artistic deviations and are not copied. Lanterns, path lights and glowing posts are styling, not property facts.

## Data honesty
Verified records, observed imagery, owner-provided facts, estimates and historical approximations are always kept and displayed as distinct. Missing property information is never invented; it stays "unknown" and is tracked in `research/BACKLOG.md`. Placeholder content in the mockups (e.g. sample photo entries) is illustrative, not data.

## Workspace structure
- `docs/`: PRD, CREATIVE_DIRECTION (final, 2026-11-27), TECHNICAL_ARCHITECTURE (approved v1.0), PHASE_0.1_BRIEF (written for Codex, followed as binding by Claude), PHASE_0.1_REPORT, RESEARCH_BRIEF, ROADMAP (PRD/ROADMAP received minor consistency updates on 2026-11-27)
- `research/`: summary, source index, visual reference brief, imagery manifest, chronicle research and backlog (original records, unchanged), plus the 2026-11-27 photo research additions: `PHOTO_ARCHIVE.md`, `HIGGSFIELD_PROMPT_PACK.md` and `photos/` (15 NYC aerial crops 1924–2024 and a montage)
- `data/`: property.json, financial_history.csv, chronicle.csv, building_footprints.geojson (original structured data, unchanged)
- `mockups/`: `APPROVED_SIGNATURE_STYLE.png` plus the four approved interface mockups (01 Property Explorer, 02 Financials, 03 Time Machine, 04 Photo Archive)
- `references/`: earlier inspiration images (mood only, not geometry sources)
- Application (Phase 0.1): `app/` (routes, sign-in, API), `src/` (scene, builders, UI, data schemas, auth), `app-data/real/` (normalised, evidence-tagged geometry, sources, footprints, camera presets), `app-data/fixtures/` (fictional, tests only), `scripts/import/` (validation pipeline), `tests/` (unit + E2E)

File names in `mockups/` and `references/` were corrected on 2026-11-27. See CREATIVE_DIRECTION.md §1 for the history.

## Resolved discrepancy (history)
The original project documents were copied into `docs/` on 2026-11-26. `PRD.md` (vision paragraph) and `RESEARCH_BRIEF.md` (mission paragraph) incorrectly placed the property in Rhode Island. Research followed the user-confirmed address in Rosedale, Queens, New York; all research sources, portals and records in the package therefore relate to NYC/Queens. Both references were corrected on 2026-11-26 at Vic's direction, with all other approved requirements preserved at that time. The initial research-stage status has since been superseded by the project status above.

## Open contradiction (flagged 2026-11-27)
The research says the NE long side "faces 250th Street", but the corner-lot geometry says the NW short end faces 250th St and the NE side is the interior lot line with 138-33. Working interpretation and reasoning: `docs/CREATIVE_DIRECTION.md` §5. Research files are unchanged; owner photos should confirm.

## Known gaps
See `research/BACKLOG.md`. The most important: owner exterior photos, the official tax-lot (parcel) polygon, and the SE extension's size and date. Also: the garage door side, undocumented window layouts (NE wall, SE rear, extension), direct DOF verification of the tax figures, and the final product name.

## Rules
No purchases, no outreach, no submissions. Private data stays in this workspace, never in a public repo.
