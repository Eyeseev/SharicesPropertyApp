# Initial Research Summary — Sharices Property App
Property: 138-37 250th Street, Rosedale, Queens, NY 11422 · Retrieved 2026-11-26 · Stage 1–3 initial package; reconciled 2026-11-27

## Identity (verified)
Queens corner lot, BBL 4136180005 (Block 13618, Lot 5), BIN 4289397, also addressed 250-01 139th Ave.
Coordinates 40.6628678, -73.7305241. Zoning R3X. Queens CB13, Council 31, School District 29, Precinct 116.
**Discrepancy resolved 2026-11-26:** original PRD/RESEARCH_BRIEF said Rhode Island; corrected to user-confirmed Rosedale, Queens, New York.

## Geometry & building (verified + observed)
- Lot 50 × 100 ft = 5,000 sq ft, corner (250th St × 139th Ave), elevation ~16.4 ft (USGS).
- House: built 1945, class A2, 1.5 storeys, ~21.7 ft high (SKYDB 6.6 m), 22 × 42 ft, 1,052 sq ft, 1 unit, frame, brick/masonry walls.
- Observed form: Cape Cod — red-brown brick ground floor, pale yellow/cream gable siding, dark shingle NW gable roof + light-grey main roof, brick chimney, white arched front door (stone surround, gable porch) on the NW end facing the intersection.
- Second building: detached white frame garage at SE rear, reached by a concrete driveway from 139th Ave. White single-storey extension at the house's SE end (date unknown, pre-Aug 2012).
- Site: small front yard (NW) with a red Japanese maple, side lawn on 139th Ave, paved rear by garage. No pool, deck or shed in any imagery.
- Trap for modellers: the driveway/outbuilding immediately NE belong to 138-33, not this lot.

## Financial (kept separate by type, per PRD)
- **Recorded sales:** 2021-03-08 — $569,000 (deed 2021030900225001). 1975 deed recorded, price unknown. ACRIS shows no other transfers for this lot.
- **Assessments/taxes (DOF via PropertyShark):** full table 2016/17–2025/26 in data/financial_history.csv. DOF market value $389k (2016/17) → $659k (2025/26); tax $4,666 → $6,337, plus a $6,669 figure labelled inconsistently (see conflicts in data/property.json).
- **Market estimates (NOT sales):** AVMs $641k–$740k, stale crawls, low confidence. Zillow/Redfin not retrievable free — backlog.

## History & permits
- No DOB job filings, no DOB violations, no HPD violations for this BIN in NYC Open Data; PropertyShark: no recent permits. DOB permit-issuance dataset retry is backlogged (rate-limited 2026-11-26).
- The SE extension and all fence changes have NO matching digital permit record found — visible only in imagery.
- Dated exterior changes (Street View): silver chain-link fence (Aug 2012) → no fence (Sep 2015–Nov 2022) → black chain-link fence (by Oct 2024, still May 2026). House form/materials otherwise unchanged 2012–2026. Rear white vinyl fence + patio umbrella first clearly seen May 2026.
- Neighbourhood context only: Rosedale = former Foster's Meadow farmland/marsh by Hook Creek; farmland until mid-1930s; low-lying with documented area flooding and a major sewer programme. No evidence any flood affected THIS property.

## Environment
FEMA flood zone X (secondary source — official FIRM check backlogged), hurricane evacuation zone 4, Walk 86 / Transit 64 / Bike 57.

## Imagery verdict
Street View is rich: 3 viewpoints, 5–6 dates each, Aug 2012 → May 2026, all four elevations effectively covered (front/corner, both long sides, rear partially via 139th Ave + aerials). Satellite from Google + Bing agree. Historical aerials: 15 NYC crops from 1924–2024 reported saved on 2026-11-27, CC BY 4.0 with attribution. The 1980s tax photograph was retrieved via the 80s.nyc mirror and placard-verified (the Luna gallery was down); the 1940s photo remains unchecked. Commercial imagery remains link/observe-only; owner photos remain a major gap. See PHOTO_ARCHIVE.md.

## Confidence
Identity/geometry/financial-record facts: **high** (official PLUTO/ACRIS, cross-checked). Exterior appearance/change dates: **high** (dated Street View). Permits-absence: **medium-high** (digital systems only). Flood zone: **medium** (secondary). AVM values & beds/baths: **low / low-medium**.

## Addendum — 2026-11-26 follow-up (at Vic's direction)
- PRD.md + RESEARCH_BRIEF.md Rhode Island references corrected to Rosedale, Queens, New York; all other requirements preserved.
- Official building footprint polygons RETRIEVED (see S16): house roof outline 24.2 × 50.5 ft / 21.7 ft high; garage 19.4 × 10.2 ft / 11.5 ft high. GeoJSON in data/. This reconciles with PLUTO: the outline is a roof outline (eaves + SE extension merged), PLUTO's 22 × 42 ft remains the wall/gross-area record.
- VISUAL_REFERENCE_BRIEF.md prepared for the Higgsfield phase (research/).
- Parcel (tax-lot) GIS polygon: still not retrieved — dimensions verified, polygon stays on the backlog. Not estimated.

## Addendum — 2026-11-27 photo research
- 1924 aerial shows pre-house land; 1951 is the earliest retrieved aerial with the house. The 1996–2024 series supports broad exterior layout comparisons.
- No publicly indexed 2021 listing photo gallery or original downloadable plan set found in targeted searches; this is not proof that none exist.
- **1980s tax photo retrieved** (`research/photos/tax-photo-1980s-b13618-l5.jpg`, placard-verified). New facts: chain-link fence present in the 1980s and gable siding distinctly yellow then. Unresolved: the front ground floor reads grey stone-textured vs modern brick. The 1940s photo may not exist. Sanborn and original plan leads remain open.
- The frontage contradiction in VISUAL_REFERENCE_BRIEF.md remains unresolved: working interpretation NW short end / SW long side street frontage, NE interior boundary; verify against parcel or owner photos.
- These updates are from PHOTO_ARCHIVE.md and the reconciled README; the saved images were not independently inspected in this merge.
