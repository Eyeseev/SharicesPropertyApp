# Source Index — retrieved 2026-11-26; supplemented 2026-11-27
| # | Source | Type | URL / reference | What it established |
|---|---|---|---|---|
| S1 | NYC PLUTO 26v3 (NYC Open Data API 64uk-42ks, bbl=4136180005) | Official | https://data.cityofnewyork.us/resource/64uk-42ks.json?bbl=4136180005 | BBL, lot/building dims, area, zoning R3X, year 1945, class A2, 2 buildings, assessed totals, coordinates, admin districts |
| S2 | NYC PAD via Geosearch (Planning Labs) | Official | https://geosearch.planninglabs.nyc/v2/search?text=138-37%20250th%20Street%20Queens%20NY%2011422 | BIN 4289397, BBL confirmation |
| S3 | ACRIS Legals (NYC Open Data 8h5j-fqxa) | Official | Query: borough=4, block=13618, lot=5 | Complete recorded-doc list for the lot: 2021 deed+mortgage, 1975 deed+mortgage, 1994 satisfaction |
| S4 | DOB Job Filings (NYC Open Data ic3t-wcy2) | Official | Query BIN 4289397 + block/lot | 0 filings |
| S5 | DOB Violations (3h2n-5cm9) / HPD Violations (wvxf-dwi5) | Official | Query BIN 4289397 | 0 / 0 |
| S6 | DOB Permit Issuance (ipu4-2q9a) | Official | — | Query hit HTTP 429 rate limit; NOT completed — backlog |
| S7 | USGS EPQS elevation service | Official (federal) | https://epqs.nationalmap.gov/v1/json?x=-73.7305241&y=40.6628678 | Elevation 16.45 ft |
| S8 | PropertyShark property page | Secondary (govt-derived) | https://www.propertyshark.com/mason/Property/784922/138-37-250-St-Queens-NY-11422/ | Sale $569k 2021, tax table 2016/17–2025/26, flood zone X, evac zone 4, Walk Scores, permits note. Owner names redacted by source; not collected |
| S9 | Google Maps / Street View | Imagery | See IMAGERY_MANIFEST.md IMG-01..04 | Exterior geometry/materials, dated change ranges 2012–2026 |
| S10 | Bing Maps aerial + 3D | Imagery | https://www.bing.com/maps?cp=40.662934~-73.730552&lvl=20&style=h | Independent aerial confirmation |
| S11 | SKYDB building record #356933310 | Secondary | https://www.skydb.net/building/356933310/138-37-250th-street/ | Height 6.6 m, 1.5 floors, 1945 |
| S12 | RealtyTrac / PropertyReach / Highrises / BatchLeads | AVM aggregators | See property.json market_estimates | Low-confidence value range $641k–$740k; 3bd/1ba claim |
| S13 | NYC311 + Municipal Archives guides (tax photos) | Official guidance | https://portal.311.nyc.gov/article/?kanumber=KA-02939 | 1940s + 1980s tax photo collections, prices, access |
| S14 | NYCityMap / aerial history reporting; NYS GIS; USGS EarthExplorer | Imagery archives | See IMAGERY_MANIFEST IMG-H3..H6 | Historical aerial coverage identification |
| S15 | Rosedale neighbourhood histories (Wikipedia; Century Block documentary notes; CityNeighborhoods.NYC) | Context | https://en.wikipedia.org/wiki/Rosedale,_Queens | Foster's Meadow origins, farmland until mid-1930s, Hook Creek/Jamaica Bay lowland, flooding/sewer context — neighbourhood level only |
| S16 | NYC Building Footprints (NYC Open Data 5zhs-2jue, OTI) | Official GIS | Query: mappluto_bbl=4136180005, retrieved 2026-11-26 (follow-up) | House polygon 24.2×50.5 ft, roof 21.68 ft; garage polygon 19.4×10.2 ft, roof 11.49 ft; ground elev 16 ft; saved as data/building_footprints.geojson. Parcel (tax-lot) polygon itself not extractable in this session — remains backlog |
| S17 | NYC OTI / DoITT ArcGIS Now & Then aerial services | Official imagery | https://www.arcgis.com/home/item.html?id=1a8a1f670cc34731b9e65ddf17bf8d70 ; PHOTO_ARCHIVE.md §A | 15 dated aerial crops 1924–2024 reported saved; CC BY 4.0 attribution per archive report |
| S18 | NYC Municipal Archives Luna gallery | Official archive | https://nycma.lunaimaging.com/ ; PHOTO_ARCHIVE.md §B | Unreachable 2026-11-27 (TLS/503 failure); the 1980s photo was obtained via S21 instead; the 1940s collection is unchecked |
| S21 | NYC Municipal Archives 1980s tax photo (REC-0041) via the 80s.nyc mirror | Official archive (mirror) | 80snyc.bdon.org/photos/4/13618/0005.jpg ; PHOTO_ARCHIVE.md §B | Placard-verified 1980s front photo of the house: NW gable end, arched door, chain-link fence, yellow siding; private reference only |
| S19 | Public listing-site searches | Search attempt | PHOTO_ARCHIVE.md §D (Zillow, Redfin, Realtor.com, StreetEasy, Compass) | No indexed 2021 listing photo gallery found |
| S20 | Sanborn / NYPL / LOC and DOB plan leads | Archive leads | PHOTO_ARCHIVE.md §E; LOC series sanborn06198; NYPL Atlas 158, Queens v. 23 (1942) | Original plans and relevant map sheet not retrieved; possible offline routes |

S17–S20 are transcribed from the 2026-11-27 photo research report; no independent retrieval or verification was performed during reconciliation. S21 was added when the Muse photo-archive package was merged; the saved image was inspected and its placard checked.
