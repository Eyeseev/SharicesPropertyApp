/** Cross-record validation for the Phase 0.3 living database (TECHNICAL_ARCHITECTURE §8.3). */
import type {
  ChronicleEvent,
  Conflict,
  Fact,
  FinancialEntry,
  Photo,
  Source,
} from '../../src/data/schema'

export type Records = {
  facts: Fact[]
  financials: FinancialEntry[]
  chronicle: ChronicleEvent[]
  photos: Photo[]
  conflicts: Conflict[]
}

/** Text that appeared only in the invented mockup photo cards (CREATIVE_DIRECTION §7). */
const MOCKUP_PLACEHOLDERS = /county recorder|county historical archive|local historical society/i

export function validateRecords(r: Records, sources: Source[]): string[] {
  const errors: string[] = []
  const byId = new Map(sources.map((s) => [s.id, s]))
  const official = (ids: string[]) => ids.some((id) => byId.get(id)?.type === 'official')

  const unique = (label: string, ids: string[]) => {
    const seen = new Set<string>()
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label}: duplicate id ${id}`)
      seen.add(id)
    }
  }
  unique(
    'fact',
    r.facts.map((x) => x.id),
  )
  unique(
    'financial',
    r.financials.map((x) => x.id),
  )
  unique(
    'chronicle',
    r.chronicle.map((x) => x.id),
  )
  unique(
    'photo',
    r.photos.map((x) => x.id),
  )
  unique(
    'conflict',
    r.conflicts.map((x) => x.id),
  )

  const conflictIds = new Set(r.conflicts.map((c) => c.id))
  const photoIds = new Set(r.photos.map((p) => p.id))

  const checkSources = (label: string, ids: string[], evidence: string) => {
    for (const id of ids) if (!byId.has(id)) errors.push(`${label}: unknown source ${id}`)
    if (evidence === 'verified' && !official(ids))
      errors.push(`${label}: 'verified' without an official source`)
  }
  for (const f of r.facts) {
    checkSources(`fact ${f.id}`, f.sourceIds, f.evidence)
    if (f.value === null && f.evidence !== 'unknown')
      errors.push(`fact ${f.id}: unknown value must carry 'unknown' evidence`)
    if (f.conflictId && !conflictIds.has(f.conflictId))
      errors.push(`fact ${f.id}: unknown conflict ${f.conflictId}`)
  }
  for (const e of r.financials) {
    checkSources(`financial ${e.id}`, e.sourceIds, e.evidence)
    if (e.kind === 'avm_estimate' && e.evidence !== 'estimated')
      errors.push(
        `financial ${e.id}: an estimate must not be stored under a verified or reported label`,
      )
    if (e.kind !== 'avm_estimate' && e.evidence === 'estimated')
      errors.push(`financial ${e.id}: only third-party estimates may be 'estimated'`)
    if (e.kind === 'recorded_sale' && !e.sourceIds.includes('S3'))
      errors.push(`financial ${e.id}: a recorded sale needs the ACRIS source (S3)`)
    if (e.amountUsd === null && e.kind !== 'recorded_sale')
      errors.push(`financial ${e.id}: only a recorded sale may have an unknown amount`)
    if (e.conflictId && !conflictIds.has(e.conflictId))
      errors.push(`financial ${e.id}: unknown conflict ${e.conflictId}`)
  }
  const seriesKey = new Set<string>()
  for (const e of r.financials.filter((x) => x.taxYear)) {
    const k = `${e.kind}:${e.taxYear}`
    if (seriesKey.has(k)) errors.push(`financial: two ${e.kind} entries for ${e.taxYear}`)
    seriesKey.add(k)
  }
  for (const c of r.chronicle) {
    checkSources(`chronicle ${c.id}`, c.sourceIds, c.evidence)
    if (c.conflictId && !conflictIds.has(c.conflictId))
      errors.push(`chronicle ${c.id}: unknown conflict ${c.conflictId}`)
    for (const p of c.photoIds)
      if (!photoIds.has(p)) errors.push(`chronicle ${c.id}: unknown photo ${p}`)
  }
  for (const p of r.photos) {
    if (!byId.has(p.sourceId)) errors.push(`photo ${p.id}: unknown source ${p.sourceId}`)
    if (p.storage === 'stored' && byId.get(p.sourceId)?.rights === 'link_only')
      errors.push(`photo ${p.id}: stored file from a link-only source`)
    if (MOCKUP_PLACEHOLDERS.test(`${p.title} ${p.caption ?? ''} ${p.credit ?? ''}`))
      errors.push(`photo ${p.id}: looks like an invented mockup placeholder`)
  }
  for (const c of r.conflicts)
    for (const s of c.statements)
      if (!byId.has(s.sourceId)) errors.push(`conflict ${c.id}: unknown source ${s.sourceId}`)
  return errors
}
