/**
 * Chronicle events from data/chronicle.csv plus events from the 2026-11-27 verification and photo
 * research. The CSV is matched row by row to hand-written titles and metadata: if its rows change,
 * the import fails until a human reviews them (approved updates only).
 */
import { readFileSync } from 'node:fs'
import { ChronicleEvent } from '../../src/data/schema'
import { parseCsv } from './csv'

type Meta = Omit<ChronicleEvent, 'detail' | 'photoIds' | 'scope'> & { photoIds?: string[] }

/** One entry per CSV row, in file order. `key` must equal the CSV's date_or_range text. */
const ROWS: { key: string; meta: Meta }[] = [
  {
    key: '1945',
    meta: {
      id: 'built-1945',
      date: { exact: '1945', approximate: false },
      type: 'construction',
      importance: 3,
      title: 'House built (city record)',
      evidence: 'verified',
      confidence: 'medium',
      sourceIds: ['S1', 'S8', 'S11'],
      conflictId: 'build-year',
    },
  },
  {
    key: '1975-01-07',
    meta: {
      id: 'deed-1975',
      date: { exact: '1975-01-07', approximate: false },
      type: 'transfer',
      importance: 2,
      title: 'Deed recorded, price not public',
      evidence: 'verified',
      confidence: 'high',
      sourceIds: ['S3'],
    },
  },
  {
    key: '1994-03-24',
    meta: {
      id: 'satisfaction-1994',
      date: { exact: '1994-03-24', approximate: false },
      type: 'finance_record',
      importance: 1,
      title: 'Mortgage satisfaction recorded',
      evidence: 'verified',
      confidence: 'high',
      sourceIds: ['S3'],
    },
  },
  {
    key: '2012-08',
    meta: {
      id: 'sv-2012-08',
      date: { exact: '2012-08', approximate: false },
      type: 'imagery',
      importance: 1,
      title: 'Street View: silver chain-link fence',
      evidence: 'observed',
      confidence: 'high',
      sourceIds: ['S9'],
    },
  },
  {
    key: '2015-09',
    meta: {
      id: 'sv-2015-09',
      date: { exact: '2015-09', approximate: false },
      type: 'imagery',
      importance: 1,
      title: 'Street View: no front fence',
      evidence: 'observed',
      confidence: 'high',
      sourceIds: ['S9'],
    },
  },
  {
    key: '2017-11 to 2018-07',
    meta: {
      id: 'sv-2017-2018',
      date: { from: '2017-11', to: '2018-07', approximate: false },
      type: 'imagery',
      importance: 1,
      title: 'Street View: small red maple in front yard',
      evidence: 'observed',
      confidence: 'high',
      sourceIds: ['S9'],
    },
  },
  {
    key: '2021-03-08',
    meta: {
      id: 'sale-2021',
      date: { exact: '2021-03-08', approximate: false },
      type: 'transfer',
      importance: 3,
      title: 'Recorded sale, $569,000',
      evidence: 'verified',
      confidence: 'high',
      sourceIds: ['S3', 'S8'],
    },
  },
  {
    key: '2022-11',
    meta: {
      id: 'sv-2022-11',
      date: { exact: '2022-11', approximate: false },
      type: 'imagery',
      importance: 1,
      title: 'Street View: still no front fence',
      evidence: 'observed',
      confidence: 'high',
      sourceIds: ['S9'],
    },
  },
  {
    key: '2022-11 to 2024-10',
    meta: {
      id: 'black-fence',
      date: {
        from: '2022-11',
        to: '2024-10',
        approximate: true,
        label: 'Between Nov 2022 and Oct 2024',
      },
      type: 'exterior_change',
      importance: 2,
      title: 'Black chain-link fence installed',
      evidence: 'historical_approximation',
      confidence: 'medium',
      sourceIds: ['S9'],
    },
  },
  {
    key: '2024-10',
    meta: {
      id: 'sv-2024-10',
      date: { exact: '2024-10', approximate: false },
      type: 'imagery',
      importance: 1,
      title: 'Street View: black fence present',
      evidence: 'observed',
      confidence: 'high',
      sourceIds: ['S9'],
      photoIds: ['sv-2024-10'],
    },
  },
  {
    key: '2026-05',
    meta: {
      id: 'sv-2026-05',
      date: { exact: '2026-05', approximate: false },
      type: 'imagery',
      importance: 1,
      title: 'Street View: white vinyl rear fence',
      evidence: 'observed',
      confidence: 'high',
      sourceIds: ['S9'],
      photoIds: ['sv-2026-05'],
    },
  },
  {
    key: 'Unknown (pre-2012)',
    meta: {
      id: 'extension',
      date: { to: '2012-08', approximate: true, label: 'Before Aug 2012; exact date unknown' },
      type: 'addition',
      importance: 2,
      title: 'Single-storey SE extension',
      evidence: 'historical_approximation',
      confidence: 'medium',
      sourceIds: ['S1', 'S9'],
    },
  },
]

/** Events found after the CSV was written (verification and photo research, 2026-11-27). */
const EXTRA: ChronicleEvent[] = [
  {
    id: 'aerial-1924',
    date: { exact: '1924', approximate: false },
    type: 'imagery',
    importance: 2,
    scope: 'property',
    title: 'Aerial: no house on the lot',
    detail:
      'The 1924 aerial shows an unpaved road junction and open farmland character; no building on the lot.',
    evidence: 'observed',
    confidence: 'high',
    sourceIds: ['S21'],
    photoIds: ['aerial-1924'],
  },
  {
    id: 'tax-photo-1940s',
    date: { from: '1939', to: '1941', approximate: true, label: 'Survey bulk 1939–41' },
    type: 'imagery',
    importance: 3,
    scope: 'property',
    title: '1940s tax photo shows a finished house',
    detail:
      'A Municipal Archives tax photo (sign “4931 - 5 Q”) shows a finished brick house matching this one: arched door in a projecting gable, stone-textured surround, brick chimney toward the SE. This conflicts with the 1945 build year. The mirror’s automated placement may be wrong, so both claims are kept.',
    evidence: 'observed',
    confidence: 'medium',
    sourceIds: ['S23'],
    photoIds: ['tax-1940s'],
    conflictId: 'build-year',
  },
  {
    id: 'aerial-1951',
    date: { exact: '1951', approximate: false },
    type: 'imagery',
    importance: 2,
    scope: 'property',
    title: 'Earliest aerial with the house',
    detail:
      'Black and white, low resolution: the roof mass and street pattern are legible, fine detail is not.',
    evidence: 'observed',
    confidence: 'high',
    sourceIds: ['S21'],
    photoIds: ['aerial-1951'],
  },
  {
    id: 'tax-photo-1980s',
    date: { from: '1982', to: '1988', approximate: true, label: 'Survey c. 1982–88' },
    type: 'imagery',
    importance: 2,
    scope: 'property',
    title: '1980s tax photo of the NW gable end',
    detail:
      'Yellow gable siding, white arched door with stone surround, silver chain-link fence around the front yard. The ground floor of the front gable reads grey and stone-textured, unlike today’s brick (unresolved).',
    evidence: 'observed',
    confidence: 'high',
    sourceIds: ['S22'],
    photoIds: ['tax-1980s'],
    conflictId: 'gable-ground-floor-material',
  },
  {
    id: 'aerial-2004',
    date: { exact: '2004', approximate: false },
    type: 'imagery',
    importance: 2,
    scope: 'property',
    title: 'Extension visible by 2004',
    detail:
      'A pale segment at the SE end of the house matches the extension; a small dark roof at the SE rear is consistent with the garage (partly tree-covered). Both are certain by Aug 2012.',
    evidence: 'observed',
    confidence: 'medium',
    sourceIds: ['S21'],
    photoIds: ['aerial-2004'],
  },
]

export function buildChronicle(csvPath: string): { events: ChronicleEvent[]; errors: string[] } {
  const errors: string[] = []
  const events: ChronicleEvent[] = []
  const rows = parseCsv(readFileSync(csvPath, 'utf8'))
  if (rows.length !== ROWS.length)
    errors.push(
      `chronicle: data/chronicle.csv has ${rows.length} rows, importer expects ${ROWS.length}; review and map new rows`,
    )
  rows.forEach((row, i) => {
    const m = ROWS[i]
    if (!m || m.key !== row.date_or_range) {
      errors.push(`chronicle: row ${i + 2} is "${row.date_or_range}", importer expects "${m?.key}"`)
      return
    }
    const p = ChronicleEvent.safeParse({
      ...m.meta,
      scope: 'property',
      detail: row.event,
      photoIds: m.meta.photoIds ?? [],
    })
    if (p.success) events.push(p.data)
    else errors.push(`chronicle ${m.meta.id}: ${p.error.issues.map((x) => x.message).join('; ')}`)
  })
  for (const e of EXTRA) {
    const p = ChronicleEvent.safeParse(e)
    if (p.success) events.push(p.data)
    else errors.push(`chronicle ${e.id}: ${p.error.issues.map((x) => x.message).join('; ')}`)
  }
  const sortKey = (e: ChronicleEvent) => e.date.exact ?? e.date.from ?? e.date.to ?? ''
  events.sort((a, b) => sortKey(a).localeCompare(sortKey(b)) || a.id.localeCompare(b.id))
  return { events, errors }
}
