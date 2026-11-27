# PHOTO ARCHIVE — 138-37 250th Street, Rosedale, NY 11422
## Public photographs & plan documents, from construction (1945) to today
Compiled 2026-11-27. Everything below was retrieved or verified on that date unless noted.
Saved copies live in `research/photos/`. Rights are stated per item — **do not reuse beyond the stated terms.**

---

## A. SAVED — Aerial photographs, 1924–2024 (15 dated views) ✅
**Source:** NYC OTI / DoITT official orthophotography services (ArcGIS "Now & Then" layers, tiles.arcgis.com org yG5s3afENB5iO9fj).
**License: © City of New York, CC BY 4.0** (per maps.nyc.gov/tiles) — reuse permitted with attribution. Crops are centred on the lot (40.6628678, -73.7305241), ~660 px across at zoom 20, north up. Files: `research/photos/aerials/aerial-<year>.png`. Timeline montage: `research/photos/aerial-timeline-1924-2024.png`.

| Year | What it shows at this lot |
|---|---|
| **1924** | **Pre-house.** Unpaved road intersection, scattered trees, open Foster's Meadow farmland character. No building on the lot. |
| **1951** | Earliest aerial **with the house** (built 1945). B/W, low resolution — roof mass and street pattern legible, fine detail not resolvable. |
| 1996 | Colour ortho; house, garage and driveway pattern legible. |
| 2001-2, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022 | Biennial series — roof, extension, driveway, garage and tree canopy trackable across two decades. |
| **2024** | Latest city ortho — matches the verified present-day layout exactly (two-tone roof, white extension, driveway, garage, corner crosswalks). |

Note: the old maps.nyc.gov tile endpoints now return a "service has moved" placeholder — these crops came from the City's current ArcGIS tile services, found via the relocated NYC Then & Now app (web map item 1a8a1f670cc34731b9e65ddf17bf8d70).

## B. RETRIEVED 2026-11-27 — NYC tax photograph, 1980s (the earliest street-level photo of the house) ✅
**File:** `research/photos/tax-photo-1980s-b13618-l5.jpg` (610×480 JPEG)
**Source:** NYC Municipal Archives, 1980s Department of Finance tax assessment photographs (REC-0041, 1982–88), retrieved via the 80s.nyc mirror's public photo service (80snyc.bdon.org/photos/4/13618/0005.jpg) because the Archives' own Luna gallery was down (see below). **Identity is certain:** the photographer's placard in the frame reads "13837 250 Street — B 4, BLK 13618, LOT 5."
**What it shows (NW gable end from the corner, autumn/winter, bare trees):**
- Steep dark gable roof and pale-yellow upper gable siding — matching today's two-tone reading, and confirming the siding read as distinctly **yellow** in the 1980s.
- White arched front door with stone surround, small gable porch, small window in the gable peak.
- **Silver/galvanised chain-link fence** already enclosing the front yard in the 1980s (fence timeline now: chain-link 1980s → silver chain-link Aug 2012 → absent 2015–2022 → black chain-link by Oct 2024).
- A dog standing in the front yard; mature shrubs at the foundation; leafless street trees.
- **Open question for the architects:** the front gable's ground floor reads as **grey stone-textured cladding** in this photo, versus red-brown brick in 2012–2026 Street View. This may be a stone veneer later removed/covered, or a film/lighting artefact of the 1980s colour negative scan. Flagged, NOT resolved — do not model either way on this photo alone.
- **Reviewer check (Claude, 2026-11-27, image inspected directly):** the placard is legible and matches (13837 250 Street · B 4 · BLK 13618 · LOT 5). Further *provisional* observations for owner-photo confirmation, which are not yet geometry facts: (a) a double-hung **window in the upper NW gable** above the door (the Phase 0.1 model leaves that gable blank); (b) the arched door sits in a **small projecting front gable** set in front of the taller main gable; (c) the **chimney appears closer to the front section** than the model's SE estimate, but perspective makes its position uncertain. The white figure in the yard could be a dog or a lawn ornament.
**Rights:** NYC Municipal Archives image. This low-resolution copy is the version the Archives' ecosystem makes publicly viewable (watermarked low-res saves are the sanctioned free tier); prints / hi-res files are paid via the Archives order form — purchase needs Vic's approval. Treat as private project reference, not for publication.
**Access note:** the Archives' Luna gallery (nycma.lunaimaging.com) was unreachable on 2026-11-27 (TLS certificate issued for the wrong host; direct requests empty/503) — a vendor-side outage. The 80s.nyc route bypassed it for the 1980s collection.
**1940s tax photo (REC-0040):** still unchecked — the 1940s mirror (1940s.nyc, different codebase/backend) was not retrievable the same way, and Luna is down. Given the bulk of that collection is 1939–41 and the house was built 1945, a frame may show the vacant lot or not exist. Remains on the backlog.

## C. LINK-ONLY — Street-level photography, 2012–2026
Google Street View (3 viewpoints, dated captures Aug 2012 → May 2026) and Bing aerial/3D — full pano URLs and dated observations are in `IMAGERY_MANIFEST.md` (IMG-01..07, IMG-H1..H7). **Terms prohibit copying/embedding** — these remain links + written observations only. This is still the richest street-level record of the house: the 1980s tax photo (B) is the only known street-level photo earlier than 2012.

## D. NOT FOUND — 2021 sale listing photos
The March 2021 sale ($569,000) left **no publicly indexed listing photos**: targeted searches of Zillow, Redfin, Realtor.com, StreetEasy and Compass surface no photo page for this address (only PropertyShark/SKYDB data pages, which carry no house photos). The sale may have been off-market or its MLS (OneKey) photos were never syndicated publicly. If Sharice has the 2021 listing packet or closing photos, those would be unique — worth asking her. **Do not** pursue people-search sites that surfaced prior-resident names — out of scope and unnecessary personal information.

## E. PLANS & "BLUEPRINTS" — what exists and what doesn't
- **No original blueprints are publicly available online.** For a 1945 NYC house, original New Building plans (if retained) sit on microfilm with the **NYC DOB Queens borough office / Municipal Archives** — in-person or FOIL territory, not downloadable. DOB digital systems hold **zero** job filings for this BIN (verified 2026-11-26), consistent with no digitised plan set.
- **Closest plan-view documents that DO exist:**
  1. **Official building footprint polygons** (photogrammetric, 2017 edit) — already saved: `data/building_footprints.geojson` (house 24.2×50.5 ft, garage 19.4×10.2 ft). This is the best machine-usable "plan" of the house.
  2. **Sanborn fire insurance map, Queens vol. covering Rosedale, ed. updated to ~1950** (Library of Congress series sanborn06198, public domain where digitised) — LOC has **not** put the post-1930 Queens sheets online (copyright); NYPL holds the physical volume: *Sanborn, Atlas 158, Queens v. 23 (1942)*, offsite, by appointment. An in-person NYPL/LOC visit is the only route to the sheet showing this house's 1950 footprint, materials codes and outbuildings.
  3. **E. Belcher Hyde / Bromley Queens atlases** (NYPL Digital Collections, 1852–1955 insurance atlases) — pre-date or bracket the house; useful for lot subdivision history, not yet sheet-extracted.
  4. The **1951 aerial** (Section A) functions as the earliest photographic plan of the built property.

## F. Still missing / backlog after this hunt
1. ~~1980s tax photo~~ — RETRIEVED 2026-11-27 via 80s.nyc (Section B). Optional: order the hi-res print/file from the Archives (paid, Vic's approval).
2. 1940s tax photo existence check — retry Luna when its certificate is fixed; may be a vacant-lot frame or absent.
3. Sanborn ~1950 sheet — in-person NYPL (Atlas 158, Queens v. 23) or LOC Geography & Map Room.
4. Original 1945 plans — DOB Queens microfilm / possible FOIL request (Vic decision; a request = contacting an agency, needs his go-ahead).
5. Owner photos (Sharice) — still the best-rights, highest-value source, including any 2021 listing photos she kept.
6. USGS EarthExplorer / HistoricAerials frames between 1951 and 1996 — EarthExplorer needs a free account to download; HistoricAerials is paid (approval needed). The 1951→1996 gap is currently bridged only by the 1980s tax photo (Section B).

*Attribution for Section A images: © City of New York, CC BY 4.0, via NYC OTI ArcGIS ortho services, retrieved 2026-11-27.*
