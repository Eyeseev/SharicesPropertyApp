/**
 * Validates app-data/real/geometry.json (PHASE_0.1_BRIEF §8).
 * Fails on: schema errors (incl. missing evidence), unknown source IDs, `verified` values without an
 * official source, anything on the "never add" list, and layout sanity (mirrored lot).
 */
import { GeometrySpec, type Source } from '../../src/data/schema'

/** Words that must never appear as element ids/kinds/styles (CREATIVE_DIRECTION §5, brief §7.4). */
export const NEVER_ADD = [
  'pool',
  'deck',
  'shed',
  'dormer',
  'shutter',
  'boulder',
  'antenna',
] as const

export type ValidationResult = { ok: boolean; errors: string[]; spec?: GeometrySpec }

export function validateGeometry(raw: unknown, sources: Source[]): ValidationResult {
  const parsed = GeometrySpec.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `schema: ${i.path.join('.')}: ${i.message}`),
    }
  }
  const spec = parsed.data
  const errors: string[] = []
  const byId = new Map(sources.map((s) => [s.id, s]))
  const official = (ids: string[]) => ids.some((id) => byId.get(id)?.type === 'official')

  const seen = new Set<string>()
  for (const el of spec.elements) {
    if (seen.has(el.id)) errors.push(`duplicate element id: ${el.id}`)
    seen.add(el.id)

    for (const sid of el.sourceIds) {
      if (!byId.has(sid)) errors.push(`${el.id}: unknown source id ${sid}`)
    }
    const verifiedParams = Object.entries(el.params).filter(([, p]) => p.evidence === 'verified')
    if ((el.evidence === 'verified' || verifiedParams.length > 0) && !official(el.sourceIds)) {
      errors.push(
        `${el.id}: 'verified' evidence (${verifiedParams.map(([k]) => k).join(', ') || 'element'}) without an official source`,
      )
    }
    if (el.kind !== 'context' && el.sourceIds.length === 0) {
      errors.push(`${el.id}: property element without sources`)
    }

    const haystack = [el.id, el.kind, ...Object.values(el.params).map((p) => String(p.value))]
      .join(' ')
      .toLowerCase()
    for (const word of NEVER_ADD) {
      if (el.render && haystack.includes(word)) errors.push(`${el.id}: never-add item "${word}"`)
    }
    if (el.kind === 'garage') {
      const attached = el.params.attached?.value === true
      const brick = String(el.params.wallColor?.value ?? '').includes('brick')
      if (attached) errors.push(`${el.id}: garage must be detached`)
      if (brick) errors.push(`${el.id}: garage must not be brick`)
    }
  }

  for (const obj of spec.objects) {
    for (const sid of obj.sourceIds) {
      if (!byId.has(sid)) errors.push(`object ${obj.id}: unknown source id ${sid}`)
    }
    const verifiedFacts = obj.facts.filter((f) => f.evidence === 'verified')
    if (verifiedFacts.length > 0 && !official(obj.sourceIds)) {
      errors.push(`object ${obj.id}: verified facts without an official source`)
    }
    if (!spec.elements.some((e) => e.objectId === obj.id && e.render)) {
      errors.push(`object ${obj.id}: no rendered element`)
    }
  }

  const rendered = spec.elements.filter((e) => e.render)
  const chimneys = rendered.filter((e) => e.kind === 'chimney')
  if (chimneys.length !== 1) errors.push(`expected exactly one chimney, found ${chimneys.length}`)

  // Layout sanity: not mirrored. Door at the NW end, driveway from 139th Ave (SW) at the SE end.
  const door = rendered.find((e) => e.kind === 'door')
  if (!door || door.params.wall?.value !== 'nw')
    errors.push('front door must be on the NW gable end')
  const drive = rendered.find((e) => e.id === 'driveway')
  const parcel = spec.elements.find((e) => e.id === 'parcel')
  const num = (v: unknown) => (typeof v === 'number' ? v : NaN)
  const swLine = num(parcel?.params.tMin?.value)
  if (
    !drive ||
    num(drive.params.tMin?.value) !== swLine ||
    !(swLine < 0) ||
    !(num(drive.params.sMin?.value) > 0)
  ) {
    errors.push(
      'driveway must enter from 139th Ave (the parcel SW line, t < 0) at the SE end (s > 0)',
    )
  }
  const garage = rendered.find((e) => e.kind === 'garage')
  if (!garage || !(num(garage.params.sMin?.value) > 0)) errors.push('garage must be at the SE end')

  return { ok: errors.length === 0, errors, spec }
}
