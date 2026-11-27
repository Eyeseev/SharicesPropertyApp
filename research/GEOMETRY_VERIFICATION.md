# GEOMETRY & RECORD VERIFICATION — 138-37 250th Street, Rosedale, NY 11422
## Targeted verification mission, 2026-11-27 · BBL 4136180005 · BIN 4289397

Labels: **[OFFICIAL]** = from a government record · **[CALC]** = calculated by Muse from official geometry (method stated) · **[EST]** = estimate from imagery · **[OPEN]** = unresolved.

---

## 1. Official tax-lot parcel polygon — RETRIEVED ✅ [OFFICIAL]
- **Source:** NYC Department of Finance, **Digital Tax Map** — ArcGIS service `Digital_Tax_Map_VIEW`, layer 5 (TAX_LOT_POLYGON), owner dof.nyc.data, query `BBL=4136180005`, retrieved 2026-11-27.
- **Saved:** `data/tax_lot_polygon.geojson` (single feature, WGS84).
- **Measured from the polygon [CALC]:** a true rectangle, edges **100.4 ft × 51.1 ft** (vs PLUTO's nominal 50 × 100). Long-axis bearing ≈ **144.9°** (NW–SE); short-axis ≈ 55.6° (NE–SW).
- **Lot faces (DTM layer 4, TAX_LOT_FACE) [OFFICIAL]:** four faces with recorded lengths 50 / 50 / 100 / 100 ft. `BLOCK_FACE_FLAG=1` (a real street frontage) on exactly two faces: the **NW 50-ft end** and the **SW 100-ft side**. The SE end and NE side are interior lot lines (flag 0).

## 2. Orientation & street frontages — CONFLICT RESOLVED ✅
Earlier sources disagreed (the Visual Reference Brief said the NE long side "faces 250th Street"; PropertyShark listed both streets as frontages without saying which side). The Digital Tax Map + address geometry settle it:

| Lot edge | Length | Fronts | Evidence |
|---|---|---|---|
| NW short end | 50 ft (51.1 measured) | **250th Street** | DTM block-face flag = 1; 250th St addresses continue NE from the corner (138-33, 138-23 geocode along a NE–SW axis, bearing ≈ 52°) |
| SW long side | 100 ft (100.4 measured) | **139th Avenue** | DTM block-face flag = 1; 139th Ave addresses continue SE along the lot (250-11, 250-17 geocode along a NW–SE axis, bearing ≈ 142°) |
| NE long side | 100 ft | **Nothing — interior line** against 138-33 250th St's lot | DTM block-face flag = 0 |
| SE short end | 50 ft | Interior line (rear) | DTM block-face flag = 0 |

- The house's long axis (bearing ≈ 145.8° from its footprint polygon) is **parallel to 139th Avenue and to the lot's long axis** [CALC]. The front door faces NW onto the 250th Street end / the corner.
- **Correction applied:** VISUAL_REFERENCE_BRIEF §§1, 6, 7 previously implied the NE side faces 250th Street. It does not — that side is a side yard against the neighbour. (The brief's placement of door, driveway and garage was and remains correct.)

## 3. Building placement inside the lot [CALC from official polygons]
Method: perpendicular distances from each footprint's centroid to the four DTM lot lines, minus the footprint's half-width/half-length. Polygons: DOF tax lot (§1) × OTI building footprints (data/building_footprints.geojson).

**House** (roof outline 24.2 × 50.5 ft):
- NW gable wall ≈ **19 ft back** from the 250th Street lot line (front-yard depth).
- SW wall ≈ **8 ft** from the 139th Avenue lot line (narrow side yard along the avenue).
- NE wall ≈ **18–19 ft** from the NE lot line (the wide side yard, against 138-33).
- SE end of the outline ≈ **30 ft** short of the SE lot line (rear zone = extension end → driveway pad → garage).

**Garage** (19.4 × 10.2 ft):
- Long axis runs **NE–SW** (bearing ≈ 56°), i.e. its long dimension lies *across* the lot's width; the 10.2-ft dimension lies along the lot's long axis.
- SE wall ≈ **3 ft** from the SE lot line; roughly **centred across the lot width** (centroid ≈ 25.5 ft from each long lot line).
- Imagery shows the door on the garage's NW long face, opening toward the driveway pad and house [from Street View/aerials, prior mission].

**Driveway [EST from 2024 aerial + Street View]:** enters from 139th Avenue near the SE end, single-width (≈10–12 ft) running NE along the rear to a wider pad in front of the garage. Widths are visual estimates; alignment is confirmed by the 2024 ortho and the placement math above (the ~30-ft rear zone is exactly the driveway/pad/garage band).

**Extension [CALC + EST]:** the official footprint outline is one merged rectangle (24.2 × 50.5 ft). PLUTO's main-house depth is 42 ft, so the extension accounts for ≈ **8.5 ft of length** along the SE end [CALC — an inference from two official figures, not a direct measurement]. Its width is **not separately resolved** by any official polygon; Street View suggests it is slightly narrower than the house and single-storey [EST]. Do not model an exact extension width as fact.

## 4. When did the extension and garage first appear? — narrowed, not dated
- **1951 aerial:** resolution too low to separate extension or garage. No claim.
- **1996 aerial:** main roof form (dark gable + pale main roof) clearly present; extension/garage not conclusively separable at this resolution. No claim.
- **2004 aerial:** a pale segment at the house's SE end matches the extension's position and tone → **extension present by 2004** [probable-to-confirmed]. A small dark roof at the SE rear is consistent with the garage, partly tree-covered → **garage probable by 2004**.
- **Aug 2012 Street View:** both extension and garage **certain**.
- The footprint dataset lists construction_year 1945 for the garage as well as the house — that is the dataset carrying the lot's building year, **not evidence** the garage dates to 1945. DOB digital records contain no permit for either structure (see §7), so no documentary date exists in the checked systems. **Bracket: extension and garage were built sometime between the house's construction (officially 1945 — but see the build-year conflict, §10) and 2004; present by 2004 (extension confirmed, garage probable), certain by 2012.**

## 5. Ground-floor materials: 1980s photo vs today — narrowed, still [OPEN]
Direct examination of the saved 1980s tax photo (2026-11-27):
- In the **same frame**, the long side wall reads **red-brown brick**, while the **NW gable-end ground floor reads grey, rough, stone-textured** — so a whole-photo colour cast does **not** explain the difference; the gable end genuinely presented a different surface in the 1980s.
- Modern Street View (2012–2026) shows the gable end as red-brown brick matching the sides.
- **Most likely explanation [inference, not fact]:** the gable end carried a stone-veneer or cementitious/stucco facing in the 1980s that was later removed or covered, OR the brick was painted/coated grey and later restored. Which one, and when it changed, is **not documented** in any checked source (no DOB permits; Street View only begins 2012, already brick).
- **New evidence (2026-11-27, later session): the 1940s tax photo (§10) shows the same pattern ~40 years earlier** — stone/stone-veneer texture specifically around the projecting entry gable, brick everywhere else on the ground floor. That makes "an original stone-veneer treatment at the entry projection" the leading explanation: in the small, faded 1980s frame the stone-textured projection reads as the whole gable end. The question is therefore **narrowed**: not "was the gable brick or stone?" but "how far did the stone treatment extend, and does any of it survive under/behind today's brick reading at the gable end?" Still [OPEN] at that narrower scope.
- What could settle the remainder: the hi-res Archives print of the 1980s photo (paid), or a pre-2012 photo from the owner.
- **Modelling guidance:** present-day concepts = brick (verified). A 1980s-period concept should render the gable end grey stone-textured, sides brick.

## 6. Taxes — verified against NYC DOF directly; $6,669 conflict RESOLVED
- **Source:** NYC Open Data, DOF "Property Valuation and Assessment Data" (yjxr-fw8i), query boro 4 / block 13618 / lot 5, FINAL rows. This DOF extract covers **2010/11–2018/19**; every overlapping figure **matches the PropertyShark table exactly** (e.g. 2016/17: market $389,000, assessed $23,340; lot 50×100; building 22×42; 1.5 stories; class A2; tax class 1). PropertyShark's historical table is therefore DOF-accurate for those years.
- DOF open data does not publish this lot's 2019/20–2026/27 finals in a queryable table (RNOPV dataset has no row for this lot; the DOF assessment-change file shows FY2027 tentative changes exist, extracted 2025-11-28). Recent-year figures in the package remain PropertyShark-relayed DOF data, labelled as such.
- **The $6,669 conflict — RESOLVED (reasoned, medium-high confidence):** $6,669 is the **2026/27** figure. Evidence: (1) PropertyShark's page header labels it "Tax 2026-2027"; the "2025-2026" label appears only in FAQ boilerplate that also carries stale 2023/24 assessment values ($646,000/$38,760), marking that block as unrefreshed template text. (2) Arithmetic: the verified 2025/26 row (assessed $39,540, taxable $31,937, rate 19.843%) yields **$6,337**, and no combination of 2025/26 inputs yields $6,669; $6,669 is consistent with a 2026/27 roll. **Use: 2025/26 = $6,337; 2026/27 = $6,669 (PropertyShark-relayed, pending a DOF source for that year).**

## 7. Permits — DOB retry COMPLETE ✅
The previously rate-limited dataset was retried 2026-11-27: **NYC DOB Permit Issuance (ipu4-2q9a), BIN 4289397 → 0 records.** Combined with Job Application Filings (0) and DOB Violations (0) from 2026-11-26, all three DOB digital systems are now checked: **no digitally recorded jobs, permits or violations for this house.** (Absence in digital systems still does not prove no work occurred — see §4.)

## 8. Flood classification — now OFFICIAL ✅
**FEMA National Flood Hazard Layer** (hazards.fema.gov, public/NFHL, layer "Flood Hazard Zones", point query at the lot's coordinates, 2026-11-27): **FLD_ZONE = X, ZONE_SUBTY = "AREA OF MINIMAL FLOOD HAZARD", SFHA_TF = F (not a Special Flood Hazard Area), DFIRM_ID 360497 (Queens County).** This upgrades the earlier PropertyShark-relayed "Zone X" from medium confidence to **verified**. Hurricane evacuation zone 4 remains NYC-relayed (unchanged).

## 9. What this improves for the application
- The parcel platform can now be built from the **official surveyed lot polygon** (100.4 × 51.1 ft) with buildings placed by calculated offsets, not eyeballed.
- Orientation is settled: door NW to 250th St, long elevation on 139th Ave, NE side is a private side yard — fence/gate and street dressing belong on the NW + SW edges only.
- Extension gets an honest ≈8.5-ft length with width left flexible; garage orientation (long axis across the lot) is now polygon-confirmed.
- A 1980s period state gains one verified difference: grey stone-textured gable end.

## 10. 1940s tax photo — FOUND, and it conflicts with the official build year [OPEN]
- Retrieved (viewed) 2026-11-27 via the free **1940s.nyc** mirror of the Municipal Archives REC-0040 collection: identifier `nynyma_rec0040_4_04931_0005_w4`, https://1940s.nyc/map/photo/nynyma_rec0040_4_04931_0005_w4. In-frame sign: **"4931 - 5 Q"** (1940s tax Block 4931, Lot 5). The mirror places Block 4931 at modern Block 13618; the neighbouring Lot 8 dot is consistent. No file copy could be saved (site Download inert, direct fetch bot-blocked) — link + observations only. Full write-up: PHOTO_ARCHIVE §B2.
- The photo (survey bulk **1939–41**) shows a **finished brick house** matching this house's distinctive features: arched door in a projecting gable end, stone-textured door surround, brick chimney toward the SE end, brick ground floor with lighter upper gables.
- **Conflict:** PLUTO year-built = **1945**; the 1924 aerial shows **no house** on the lot. If the photo is this house, it was built **1925–~1940** and the official year is wrong or marks a rebuild/alteration. If the mirror's automated placement is wrong (the site itself warns it can be), 1945 stands. The feature matches and the Lot 5 sign argue for the photo; the official record argues for 1945. **Both are preserved. The app should not state a single build year as settled until the Archives' own metadata (Luna, down on 2026-11-27) or the ~1950 Sanborn sheet confirms placement.**
- App value either way: the photo is the earliest street-level view of the house (or of its immediate predecessor form), and its entry-projection stone texture + shutters + hedge + unpaved street are period details no other source provides.
