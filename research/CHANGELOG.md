# CHANGELOG — Sharice's Property App research package
## Mission: Property Geometry Verification & Targeted Research — 2026-11-27
Property: 138-37 250th Street, Rosedale, NY 11422 · BBL 4136180005 · BIN 4289397
All sources free and publicly accessible. No purchases, no outreach, no agency requests, no code/architecture/mockup changes.

## NEW files
- **`data/tax_lot_polygon.geojson`** — the official NYC DOF Digital Tax Map parcel polygon for this lot (ArcGIS `Digital_Tax_Map_VIEW`, layer 5, query BBL=4136180005, WGS84). Measured edges 100.4 × 51.1 ft.
- **`research/GEOMETRY_VERIFICATION.md`** — the mission report: parcel + frontage resolution, calculated building placement, extension/garage dating, ground-floor material analysis, DOF tax verification + $6,669 resolution, DOB permit retry, official FEMA result, and the 1940s-photo build-year conflict (§10).
- **`CHANGELOG.md`** — this file.

## MODIFIED files
- **`data/property.json`** — added `verification_2026_11_27` (parcel polygon + frontages, placement calculations, official FEMA result, DOB permits retry = 0, DOF verification, $6,669 resolution, 1940s tax photo record, build-year conflict) and appended the build-year conflict to `conflicts_preserved`.
- **`research/VISUAL_REFERENCE_BRIEF.md`** — **correction:** §§1, 6, 7 previously implied the NE long side faces 250th Street. Per the Digital Tax Map it is an interior lot line; street frontages are only the NW 50-ft end (250th St) and SW 100-ft side (139th Ave). Placement of door/driveway/garage unchanged (was already correct).
- **`research/PHOTO_ARCHIVE.md`** — new §B2: the **1940s tax photo, found** via 1940s.nyc (link-only; in-frame sign "4931 - 5 Q"; feature-by-feature match; build-year conflict flagged). §F updated: 1940s item closed, 1951–1996 aerial gap marked as checked with no further free sources.
- **`research/IMAGERY_MANIFEST.md`** — added **IMG-H9** (1940s tax photo, link-only reference with URL and rights note).
- **`research/RESEARCH_SUMMARY.md`** — Addendum 3 summarising this mission.
- **`research/BACKLOG.md`** — closed: tax photos (both), DOB permit retry, FEMA confirmation, parcel polygon, DOF verification + $6,669. Added: build-year conflict confirmation (Luna metadata / Sanborn) as the top historical open item.
- **`research/SOURCE_INDEX.md`** — added S17 (DOF Digital Tax Map), S18 (FEMA NFHL), S19 (DOF valuation/assessment data), S20 (DOB Permit Issuance retry).

## Key findings (one line each)
1. Parcel polygon retrieved; lot is a true rectangle, 100.4 × 51.1 ft measured (PLUTO nominal 50 × 100).
2. Orientation settled: frontages = NW end (250th St) + SW side (139th Ave); NE side is a private lot line.
3. Placement calculated from official polygons: house ≈19 ft off 250th St, ≈8 ft off 139th Ave, ≈30 ft rear band (extension → pad → garage); garage ≈3 ft off the rear line, long axis across the lot; extension ≈8.5 ft long (calculated), width not officially resolvable.
4. **1940s tax photo found** — and it shows a finished house matching this one, **conflicting with the official 1945 build year** (photo survey 1939–41; 1924 aerial shows no house). Preserved as an open conflict; neither date asserted over the other.
5. Ground-floor material question narrowed: stone/stone-veneer sits at the entry projection in both the 1940s and 1980s photos, brick elsewhere — likely an original feature, not a later cladding change.
6. Extension present by 2004, garage probable by 2004, both certain by Aug 2012; no documentary construction date exists in digital records.
7. Taxes verified against NYC DOF directly (2010/11–2018/19 match exactly); **$6,669 = the 2026/27 figure**, 2025/26 = $6,337.
8. FEMA flood classification now official: **Zone X, Area of Minimal Flood Hazard, not a Special Flood Hazard Area** (DFIRM 360497).
9. DOB Permit Issuance retry: **0 records** — all three DOB digital systems now checked, all zero.

## Still unresolved after this mission
- Build-year conflict (1945 official vs 1939–41 photo) — needs Archives Luna metadata or the ~1950 Sanborn sheet.
- Extension width; exact construction dates for extension and garage.
- DOF finals for 2019/20–2026/27 (not published in a queryable DOF table; aggregator-relayed figures stand, labelled).
- 1940s photo exists only as a link (site blocks file download); hi-res Archives prints of either tax photo remain a paid option for Vic.
- Owner photos, beds/baths, and renovation dates remain owner-only items (see BACKLOG).
