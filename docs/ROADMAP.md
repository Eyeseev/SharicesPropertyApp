# Product Roadmap
Approved direction; phase gates below are proposed operational acceptance criteria.

## 0 — Research and design
Muse collects actual property records and permitted imagery; review evidence and gaps. Higgsfield generates actual-property mockups; user approves signature style. Claude then prepares technical design: rendering, geometry workflow, data schema, privacy/authentication, hosting, import validation, testing and cost. No production coding before approval. No unnecessary paid services.
*Status 2026-11-27: initial research package delivered; signature style and four interface mockups approved; documentation reconciled. Technical design approved: docs/TECHNICAL_ARCHITECTURE.md v1.0 (decisions D1–D8 approved 2026-11-27). Phase 0.1 Foundation built by Claude (brief: docs/PHASE_0.1_BRIEF.md, written for Codex, still binding; report: docs/PHASE_0.1_REPORT.md) and awaiting gate review. Owner photos and the parcel polygon are still outstanding. Mockup 03 (Time Machine) previews the 0.4 experience; it does not move Time Machine into the MVP.*
*Status 2026-11-27 (later): Phase 0.1 committed; parcel now drawn from the official DOF tax-lot polygon (Muse verification delta integrated). Phase 0.2 Signature style built by Claude (report: docs/PHASE_0.2_REPORT.md) and awaiting gate review.*

## 0.1 — Foundation
Claude builds actual exterior and parcel, driveway, fences, trees and exterior structures; free camera and presets; major object selection. Acceptance: recognizable geometry, stable navigation, no interior or neighbors, known approximations documented. Avoid disposable visual polish.

## 0.2 — Signature style
Implement the approved signature style (docs/CREATIVE_DIRECTION.md; geometry from research/VISUAL_REFERENCE_BRIEF.md): stylized materials, parcel platform, beautiful vegetation, lighting, and glass/digital-augmentation accents (CREATIVE_DIRECTION §3: the property itself uses physical materials). Acceptance: recognizable property, coherent approved aesthetic, readable UI and desktop usability. Alternate functional and visual work as appropriate.

## 0.3 — Living database (MVP completion)
Integrate available property characteristics, market estimates, sales, assessments and taxes; simple chronological Chronicle; toggleable photo sidebar and enlargement; data views, source details, structured imports and separate test fixtures. Acceptance: traceable values, explicit unknowns, no fictional data in real view, approved updates only, private access tested. Local development then private Vercel deployment. Phone viewing supported; desktop showcase prioritized.

## 0.4 — Time Machine
Dated exterior changes, collapsible timeline, synchronized photos, manual navigation and automatic playback with speeds and event-aware pauses. Start with smooth transitions and highlighted events; later cinematic construction. Acceptance: dates drive model/data consistently, uncertain dates labeled, no unsupported reconstruction, return to present works. Eventually compare dates. Seek Sharice feedback once historical experience works or preferably after visual polish.

## 1.0 — Masterpiece
Refine materials, lighting, animation, interface, camera choreography and silent cinematic historical showcase. Incorporate Sharice feedback. Acceptance: user approves visual quality against reference and mockups; core functionality remains intact. No numerical performance targets selected yet.

## Later backlog
Optional live atmosphere and useful data sources; periodic Muse monitoring; approved routine updates and review interface; richer archives and filters; personal memories; illustrative risk simulations; additional themes; interior and neighborhood expansion only after explicit approval. No current implementation commitment.

## Operating rules
ChatGPT owns product planning/review; Muse research; Higgsfield mockups; Claude architecture and implementation/testing/deployment (moved from Codex at Vic's direction, 2026-11-27). Claude works autonomously within approved phases; review at each gate. Start a fresh coding session for a new phase when context becomes unwieldy; continue existing session for tightly related fixes. No public exposure of private records, no paid services without approval, no major scope changes without approval. Technical design is intentionally deferred until research and mockups.
