/**
 * Conflicts are preserved as data, never resolved in code (TECHNICAL_ARCHITECTURE §7.1).
 * `property.json` `conflicts_preserved` is the raw list; each entry must be mapped here by index,
 * so a new conflict from research fails the import until a human maps it (approved updates only).
 */
import { Conflict } from '../../src/data/schema'

/** Order matches data/property.json `conflicts_preserved`. `null` = reviewed, not an app record. */
export const CONFLICT_BY_INDEX: (Conflict | null)[] = [
  null, // Rhode Island vs New York: the owner-confirmed New York address is used everywhere.
  {
    id: 'dof-year-label',
    topic: 'DOF market value year labelling in the aggregator table',
    statements: [
      { value: '2023/24 = $646,000, assessed $38,760 (PropertyShark table)', sourceId: 'S8' },
      { value: 'PLUTO assessed total $38,760 matches that year', sourceId: 'S1' },
    ],
    status: 'unresolved',
    notes: 'The aggregator’s year labels may lag the PLUTO release. Amounts are shown as reported.',
  },
  {
    id: 'tax-6669-label',
    topic: 'Which year the $6,669 tax figure belongs to',
    statements: [
      { value: '$6,669 labelled 2026-2027 in the page header', sourceId: 'S8' },
      { value: '$6,669 labelled 2025-2026 in the FAQ boilerplate', sourceId: 'S8' },
      {
        value: '2025/26 table row: $6,337 (assessed $39,540, taxable $31,937, rate 19.843%)',
        sourceId: 'S8',
      },
    ],
    status: 'resolved',
    notes:
      'Resolved by reasoning, medium-high confidence (GEOMETRY_VERIFICATION §6): $6,669 is the 2026/27 figure; the FAQ label sits in stale boilerplate and no 2025/26 input yields $6,669. Still relayed by PropertyShark until DOF publishes the year.',
  },
  {
    id: 'floor-area',
    topic: 'Building area: 1,052 or 1,050 sq ft',
    statements: [
      { value: '1,052 sq ft', sourceId: 'S1' },
      { value: '1,050 sq ft (FAR area)', sourceId: 'S8' },
    ],
    status: 'unresolved',
    notes: 'A 2 sq ft difference. PLUTO’s 1,052 is shown as the official figure.',
  },
  {
    id: 'gable-siding-colour',
    topic: 'Upper gable siding: pale yellow or cream/white',
    statements: [
      { value: 'Pale yellow (2012, 2015 Street View)', sourceId: 'S9' },
      { value: 'Cream/white (2022–2026 Street View)', sourceId: 'S9' },
    ],
    status: 'unresolved',
    notes: 'Could be lighting or a repaint. A repaint is not asserted.',
  },
  null, // Stories: 1.5 agreed by PLUTO/SKYDB/Street View; garbled aggregator fields ignored.
  {
    id: 'build-year',
    topic: 'Year the house was built',
    statements: [
      { value: '1945 (PLUTO, PropertyShark, SKYDB)', sourceId: 'S1' },
      {
        value:
          'A finished matching house appears in the 1939–41 tax photo; the 1924 aerial shows none',
        sourceId: 'S23',
      },
    ],
    status: 'unresolved',
    notes:
      'If the photo is this house it was built between 1925 and about 1940, and 1945 would be an error or a rebuild. Neither date is asserted. Routes to settle it: Municipal Archives metadata, the c. 1950 Sanborn sheet, DOB Queens microfilm.',
  },
]

/** Conflicts from sources other than `conflicts_preserved` (later research). */
export const EXTRA_CONFLICTS: Conflict[] = [
  {
    id: 'street-frontage',
    topic: 'Which lot side faces 250th Street',
    statements: [
      { value: 'The NE long side faces 250th Street (earlier brief wording)', sourceId: 'S9' },
      {
        value:
          'Frontages are the NW 50 ft end (250th St) and the SW 100 ft side (139th Ave); the NE side is an interior line',
        sourceId: 'S17',
      },
    ],
    status: 'resolved',
    notes: 'Resolved by the DOF Digital Tax Map block-face flags (GEOMETRY_VERIFICATION §2).',
  },
  {
    id: 'gable-ground-floor-material',
    topic: 'Ground floor of the NW gable: stone texture or brick',
    statements: [
      { value: 'Grey, stone-textured in the 1980s tax photo', sourceId: 'S22' },
      { value: 'Red-brown brick in 2012–2026 Street View', sourceId: 'S9' },
      { value: 'Stone texture at the entry projection in the 1940s photo too', sourceId: 'S23' },
    ],
    status: 'unresolved',
    notes:
      'Narrowed: stone at the entry projection looks original, brick elsewhere. How far the stone extended is open.',
  },
]
