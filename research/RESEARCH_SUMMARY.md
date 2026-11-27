# Initial Research Summary — Sharices Property App
Property: 138-37 250th Street, Rosedale, Queens, NY 11422 · Retrieved 2026-11-26 · Stage 1–3 initial package

## Identity (verified)
Queens corner lot, BBL 4136180005 (Block 13618, Lot 5), BIN 4289397, also addressed 250-01 139th Ave.
Coordinates 40.6628678, -73.7305241. Zoning R3X. Queens CB13, Council 31, School District 29, Precinct 116.
**Discrepancy flagged:** PRD/RESEARCH_BRIEF say Rhode Island; user-confirmed address is New York. User address followed.

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
Street View is rich: 3 viewpoints, 5–6 dates each, Aug 2012 → May 2026, all four elevations effectively covered (front/corner, both long sides, rear partially via 139th Ave + aerials). Satellite from Google + Bing agree. Historical stills (1980s tax photo) and historical aerials are identified with exact retrieval routes but not yet extracted. ALL commercial imagery is link/observe-only for rights reasons; owner photos are the missing gold source.

## Confidence
Identity/geometry/financial-record facts: **high** (official PLUTO/ACRIS, cross-checked). Exterior appearance/change dates: **high** (dated Street View). Permits-absence: **medium-high** (digital systems only). Flood zone: **medium** (secondary). AVM values & beds/baths: **low / low-medium**.

## Addendum — 2026-11-26 follow-up (at Vic's direction)
- PRD.md + RESEARCH_BRIEF.md Rhode Island references corrected to Rosedale, Queens, New York; all other requirements preserved.
- Official building footprint polygons RETRIEVED (see S16): house roof outline 24.2 × 50.5 ft / 21.7 ft high; garage 19.4 × 10.2 ft / 11.5 ft high. GeoJSON in data/. This reconciles with PLUTO: the outline is a roof outline (eaves + SE extension merged), PLUTO's 22 × 42 ft remains the wall/gross-area record.
- VISUAL_REFERENCE_BRIEF.md prepared for the Higgsfield phase (research/).
- Parcel (tax-lot) GIS polygon: still not retrieved — dimensions verified, polygon stays on the backlog. Not estimated.

## Addendum 2 — 2026-11-27 photo hunt (at Vic's direction)
- 15 official NYC aerial crops 1924–2024 saved (CC BY 4.0) — research/photos/aerials/ + timeline montage. 1924 = pre-house farmland; 1951 = earliest aerial with the house.
- **1980s tax photo RETRIEVED** via 80s.nyc mirror (Luna gallery down, wrong-host TLS cert): placard-verified image of the house, saved as research/photos/tax-photo-1980s-b13618-l5.jpg. New facts: chain-link fence present in the 1980s; siding distinctly yellow then; front gable ground floor reads grey stone-textured (unresolved vs modern brick).
- No 2021 listing photos exist in public indexes; no blueprints online (DOB Queens microfilm / NYPL Sanborn Atlas 158 Queens v.23 are in-person routes). Full index: research/PHOTO_ARCHIVE.md.

## Addendum 3 — 2026-11-27 verification mission (at Vic's direction)
Full detail: research/GEOMETRY_VERIFICATION.md; change list: CHANGELOG.md (project root).
- **Parcel polygon RETRIEVED** (NYC DOF Digital Tax Map): true rectangle 100.4 × 51.1 ft, saved as data/tax_lot_polygon.geojson. **Orientation conflict RESOLVED:** street frontages are the NW 50-ft end (250th St) and the SW 100-ft side (139th Ave) only — the NE long side is an interior lot line, correcting the Visual Reference Brief. Building placement calculated from the two official polygons (house ≈19 ft back from 250th St, ≈8 ft off 139th Ave, ≈30 ft rear zone; garage ≈3 ft off the rear line, long axis across the lot; extension ≈8.5 ft long [CALC], width unresolved).
- **1940s tax photo FOUND** via 1940s.nyc (link-only): a finished brick house matching this house's distinctive features, in-frame sign "4931 - 5 Q". **This conflicts with PLUTO's 1945 build year** — preserved as an open conflict (photo implies 1925–~1940); do not state one year as settled. The photo also narrows the 1980s grey-gable question: stone texture sits at the entry projection in both the 1940s and 1980s frames, brick elsewhere.
- **Extension/garage dating narrowed:** extension present by 2004 (aerial), garage probable by 2004, both certain by Aug 2012; no documentary date exists.
- **Taxes verified against NYC DOF directly** (Open Data yjxr-fw8i, FINAL rows 2010/11–2018/19 — matches the PropertyShark table exactly). **$6,669 conflict RESOLVED:** it is the 2026/27 figure; 2025/26 = $6,337.
- **FEMA flood zone X now OFFICIAL** (NFHL point query: Zone X, Area of Minimal Flood Hazard, not SFHA, DFIRM 360497).
- **DOB Permit Issuance retry complete: 0 records** — jobs/violations/permits all zero.
- No additional free aerials exist for 1951–1996 from the checked services (NYC series jumps 1951→1996; NYS ITS/NAPP unreachable; EarthExplorer needs an account; HistoricAerials paid).
