# Sharices Property App — Product Requirements Document
Version 1.0 · Discovery baseline · Working product title: Property Digital Twin

## Vision
A private interactive digital museum of Sharice's property in Rosedale, Queens, New York: a beautiful stylized exterior digital twin, real-world data, and the story of the property through time. Real estate is a data layer, not the entire product. Users are Victor and Sharice; separate user profiles are unnecessary. Desktop is the showcase (approximately 75% usage), phone is primarily for occasional viewing (25%).

## Scope and priorities
- Model the actual house, entire parcel, driveway, fences, trees, landscaping and visible exterior structures. Aim for roughly 80% visual resemblance, higher when inexpensive. No interior or neighboring building models. Interior-related data may be represented externally.
- Prioritize artistic beauty over photorealism and desktop graphical fidelity over aggressive performance optimization. Maintain usable controls and readable text. One signature style; silent experience.
- Use actual property data from the beginning; fictional fixtures must be isolated from real records. Unknowns must never become invented facts.
- MVP: recognizable exterior, early signature styling (approved reference and rules: docs/CREATIVE_DIRECTION.md), free orbit/pan/zoom and front/rear/side/overhead presets, major object selection with compact popup and optional details, basic property data, financial history where available, simple chronological Property Chronicle, collapsible photo archive with enlargement. Object interaction is secondary.
- Open immediately on the current property, with clean full-screen 3D and optional statistics/markers. Expandable data panels, easily toggled photo sidebar; avoid permanent redundant object buttons. Preset data views and one primary layer at a time (interpretation of combined preferences).

## Data and history
Distinguish recorded sales, estimated market values, assessments and taxes; show charts, floating indicators or spatial effects where meaningful. Collect broadly, implement selectively. Preserve source, date, confidence and evidence for each claim; distinguish verified, owner-provided, estimated, projected and unknown. Keep missing categories in research backlog. Historical date ranges are acceptable. Central archive and contextual document access are eventual goals; use permitted copies or links.

Property Chronicle: include relevant construction, transfers, improvements, permits, damage, accidents, noteworthy news and weather events. Distinguish local context from verified property impacts. Categorize by type and importance; filters later. Personal memories optional later. Avoid unnecessary personal details of previous owners.

## Post-MVP experience
Collapsible timeline accessible from any mode; earliest supported date to present. Multiple playback speeds, event-aware skipping and pauses, object highlighting and explanations; smooth appearance/disappearance first, cinematic construction animations later. Synchronize photos with selected date; nearest available image clearly dated, filtering available, sidebar toggle and enlargement. Eventually compare two dates across data, photos and model. Never present unknown historical geometry as established fact. Optional cinematic showcase tells property story through camera choreography, typography and animation, without audio. Signature lighting first, selectable and live conditions later. Relevant neighborhood comparison data may be included without modeling surrounding properties.

## Maintenance and constraints
Muse researches and prepares structured imports; batch review initially, eventual trusted routine updates only after explicit rules and approval; significant changes require approval. Ask Sharice only when reasonable sources are exhausted. Minimal human-facing research documentation; app is the viewing interface. Local development then private Vercel deployment; authentication required even without separate profiles. No public private-data assets or secrets in repository. Free sources first; paid services require approval. Codex autonomous within approved phases, alternating functional and graphical improvements. Actual imagery and approved Higgsfield mockups precede production coding; avoid polished disposable prototypes. *(Status 2026-11-27: signature style and four interface mockups approved; owner photos still pending.)*

## Deferred
Interior modeling, neighborhood expansion (reuse concepts later), additional themes, personal scrapbook, extensive live integrations, automated monitoring, and illustrative risk simulations (tree fall, drainage blockage, storms). No engineering-grade predictions without adequate evidence. Future scenario priorities depend on Sharice's feedback.

## Success and open decisions
MVP passes when actual parcel and recognizable exterior can be explored, major features selected, available financial records and chronological events viewed, photos toggled/enlarged, unknowns clearly marked, and private access verified. Final ambition: exceptionally beautiful stylized interactive experience with historical playback and cinematic showcase. Technical architecture, exact sources, imagery permissions, authentication method, budget and final product name remain open (the mockups use "Private Property Explorer" as a placeholder title only). Round 4 financial scope interpreted as market value/sales/assessments/taxes; inflation-adjusted comparison optional, not required. Document archive interpreted as central plus contextual access. No research or implementation authorized by this document alone.
