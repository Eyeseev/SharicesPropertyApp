# Creative Direction
Status: **Approved — final creative direction, 2026-11-27.** The mockup phase is complete. This document supersedes the earlier pre-mockup direction. Rules from that version that still apply are kept below. Re-checked against all five approved images, the research and the data on 2026-11-27 (added: garage and lighting deviations, the street-frontage wording conflict, the timeline label, financial labelling and pre-2012 notes).

## 1. Definitive reference
- **Approved signature style:** `mockups/APPROVED_SIGNATURE_STYLE.png`. It shows Sharice's Cape Cod on a glowing parcel, with cyan/gold grid lines and bokeh particles.
- **Approved interface mockups** (they define the intended user experience):
  - `mockups/01_PROPERTY_EXPLORER.png`: Property Explorer default view
  - `mockups/02_FINANCIAL_INTELLIGENCE.png`: Financials view
  - `mockups/03_TIME_MACHINE.png`: Chronicle + Time Machine timeline
  - `mockups/04_PHOTO_ARCHIVE.png`: Photo Archive
- **Earlier inspiration** (secondary, mood only): `references/eDxfV1…jpeg` (luminous digital city miniature), `references/Create-a-high-end-stylized-3D-architectu.png` (earlier luxury-rendering concept of the property) and `references/EARLY_GENERIC_GLOW_HOUSE_REFERENCE.png` (generic glowing house; not this property and not a geometry source).
- **File history (2026-11-27):** files were renamed at Vic's direction to fix mix-ups. The signature image was previously `references/Create-one-new-architectural-hero-mockup.png`. The generic house image was previously `mockups/APPROVED_SIGNATURE_STYLE.png`. Mockups 01 and 02 had their contents swapped.

## 2. Artistic influence
- **75% luminous digital architectural miniature:** a dark-blue night atmosphere, a glowing digital ground plane, fine light lines, floating particles, and the property presented as a precious scale model.
- **25% luxury architectural rendering:** believable materials (brick, siding, shingle, concrete, lawn), warm interior window glow, refined landscape lighting, soft shadows and reflections.
- Beauty over photorealism. One extraordinarily polished signature style; other themes come much later.

## 3. Signature elements that must be kept
1. **Glowing parcel boundary:** a warm gold light line tracing the lot edge and sidewalk curb, with the parcel shown as a raised miniature platform.
2. **Fine cyan and gold details:** thin circuit/street-grid lines on the dark ground plane, small glowing nodes and marker posts. Restrained by default, richer in data modes.
3. **Atmospheric particles:** soft gold, cyan and occasional rose bokeh drifting in the background, never covering the property.
4. **Warm windows:** amber interior glow, porch lanterns and small path lights. *Lanterns, path lights, glowing marker posts and the lit ground grid are stylistic lighting and digital augmentation. They are not documented fixtures of the property and must never appear in data, popups or the Chronicle as property facts.*
5. **Recognizable property architecture:** the real house, garage, fence, driveway and red Japanese maple, built from the research geometry (see §5).
6. **Stylized but believable vegetation:** lush lawns and shrubs, plus a signature red maple and mature trees, with no realistic individual leaves.
7. Dark-blue atmosphere, cinematic signature lighting (night/dusk), soft reflections on the ground plane.

Translucent glass is reduced to optional digital-augmentation accents (cyan highlights, data overlays) in data modes. The approved images use physical architectural materials for the property itself. *(Interpretation of the earlier "glass + physical surfaces" note, to confirm if needed.)*

## 4. The property is the main attraction, in every view
- The model stays dominant, centred and unobstructed in Explorer, Financials, Chronicle, Time Machine and Photos.
- Panels float at the screen edges, are translucent dark navy with thin gold borders, and collapse.
- The surroundings are an abstract grid only. No neighbouring buildings are modelled.
- Data layers must communicate information rather than decorate. One primary data layer at a time.

## 5. Mockups set style and UX; research sets geometry
The approved images are aspirational. Where they differ from the verified record, **production follows `research/VISUAL_REFERENCE_BRIEF.md`**. Known artistic deviations in the mockups that must **not** be copied:

| Mockup shows | Verified / observed reality |
|---|---|
| Two front roof dormers | **No dormers** in any imagery; the upper floor is lit by gable-end windows |
| Front door centred on the long facade | Arched white door with oval glass, stone surround and small gable porch, **in the NW gable end facing the street corner** |
| One uniform dark roof | **Two-tone roof:** dark steep NW gable, pale-grey lower main roof |
| Black window shutters | Not documented; omit unless owner photos show them |
| Boulder and hydrangea beds in the front yard | Not documented; small lawn, walkway, low shrubs at the house base, red maple |
| Cream-sided side wing | **White** single-storey SE extension (size and date unknown) |
| Driveway/garage placement read loosely | Concrete driveway **from 139th Ave at the SE end**; detached white single-car frame garage at the SE rear corner, dark pitched roof. No driveway on 250th St |
| Cream-sided garage with a wall lantern and a wide windowed door | **White** walls and a **white** single-car door (Aug 2012 imagery). Lantern not documented. Door side probably faces 139th Ave (derived, unconfirmed) |
| Boulder, flowering hydrangeas, path lights (all views) | Not documented; see §3 item 4 for lighting |

**Street frontages (wording conflict in the research, flagged 2026-11-27):** `research/VISUAL_REFERENCE_BRIEF.md` §1, §2 and §7 and the `orientation` note in `data/property.json` say the NE long side "faces 250th Street". That conflicts with the corner-lot geometry (the 50 ft lot front is on 250th St), the 138-33 lot-line trap note and the NE side-fence note. Working interpretation: the **NW short end faces 250th St, the SW long side faces 139th Ave, and the NE long side is the interior lot line shared with 138-33**. The research files are left unchanged; confirm with owner photos.

Fence: present-day black chain-link on both frontages with a corner gate (consistent with the mockups). The house is a compact 1.5-storey, 1,052 sq ft Cape Cod with red-brown brick below, warm cream siding above, and one red-brick chimney toward the SE.

## 6. Interface (from the four approved mockups)
- **Top navigation:** product title at left (placeholder "Private Property Explorer"; final name is still open), then tabs: Property Explorer · Financials · Chronicle · Photos. The active tab is gold with an underline.
- **Camera presets** stacked at right: Front · Side · Rear · Top · Reset, plus free orbit/pan/zoom.
- **Left edge "i" tab:** opens property info / data markers.
- **Right-side collapsible panel per mode:**
  - *Financials:* Overview / Assessments tabs, with municipal market value, recorded sale and annual tax, each with year and an info icon; a market value trend chart; and a "Source details" row.
  - *Chronicle:* the selected event with prev/next, type, date, price/value and a source link, plus the note "Historical geometry is illustrative where uncertain."
  - *Photos:* date and viewpoint filters, a "nearest available date" indicator, cards with date, viewpoint, source and reference link, an expand control, and a "Photo not yet available" state.
- **Bottom timeline:** a "Present day" pill that is reachable from every mode and expands into the Time Machine: event markers on a dated track, previous/next event, play/pause, speed, and **Return to present**. (The Photos mockup labels the same pill "Time Machine Timeline". Treat both as one control with one consistent label; the label is to be chosen during design.)
- Typography: elegant serif headings with clean, readable values. Accessible contrast on dark navy. Gold for active and primary actions, cyan for the timeline and digital accents.
- Avoid redundant permanent roof/land/fence/driveway buttons. Select major objects directly on the model, with a compact popup and optional details.

## 7. Mockup content is illustrative, not data
- The Photos mockup entries (*March 8 2021, County recorder*; *July 12 1975, County historical archive*; *April 16 1945, Local historical society*) are **invented placeholders**. No such photos exist in the research package and these sources were not found. They must not enter the data.
- "County recorder" should read **ACRIS (NYC Department of Finance, City Register)**. The 1975 record is a deed recorded 1975-01-07 with the price unknown.
- The Financials chart in the mockup draws a smooth line from $389,000 to $659,000. The real chart must plot every tax year in `data/financial_history.csv`, including the 2024/25 dip to $613,000.
- "Official municipal property information" must reflect the actual source: DOF figures currently come via PropertyShark (a secondary source, medium confidence) until they are verified directly.
- The values shown that do match the data are $659,000 DOF market value (2025/26), $569,000 recorded sale (2021-03-08) and $6,337 tax (2025/26).
- "Municipal market value" is the DOF figure used for assessment. It is not an appraisal or a sale price, and the info icon must say so. Third-party AVMs ($641k–$740k, low confidence) are a separate "estimate" category.
- The $6,669 tax figure has an unresolved year-label conflict (`data/property.json` conflicts log). It must not be shown as the current tax until DOF is checked directly.

## 8. Data honesty in the interface
- Visibly distinguish **verified** (official record), **observed** (dated imagery), **owner-provided**, **estimated** (AVMs, inferred dimensions), **historical approximation** (date ranges, reconstructed states) and **unknown**.
- Recorded sales, DOF market values, assessments, taxes and third-party estimates are always labelled as different things.
- Never invent missing property information. Show "unknown" or "not yet available" instead.
- Uncertain historical geometry is labelled illustrative. Dated states are never mixed (e.g. 2012 silver fence with 2024 black fence).
- The earliest exterior imagery is Aug 2012. Events before that (1945 construction, 1975 deed, 1994 mortgage satisfaction) are recorded facts with **no known appearance**. Any pre-2012 view of the model is a historical approximation and must say so.
- Every value carries source, date and confidence, available through the info icon or source details.

## 9. Priorities
1. Desktop graphical quality (the showcase; ~75% of use).
2. Interface usability: readable text, clear controls, an unobstructed model.
3. Visual consistency across all views.

Phone gets a simplified presentation later. No mobile mockup has been approved yet.

## 10. Carried forward from the earlier direction
- Silent experience: no sound.
- Signature lighting first; selectable day/night and live atmosphere later.
- Subtle idle animation; optional automatic showcase.
- Context-dependent selection effects.
- Final showcase: optional silent cinematic camera tour through the earliest known state, dated changes, the financial story and the present day. No invented history.
- Do not waste time polishing throwaway prototypes.
