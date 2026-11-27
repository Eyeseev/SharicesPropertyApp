import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { buildFootprints } from '../../scripts/import/footprints'
import { buildSources } from '../../scripts/import/sources'
import { validateGeometry } from '../../scripts/import/geometry'
import { runImport } from '../../scripts/import/run'
import { CameraSet, GeometrySpec } from '../../src/data/schema'

const ROOT = path.resolve(__dirname, '../..')
const readJson = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'))
const geometryRaw = () => readJson('app-data/real/geometry.json')
const sources = buildSources()

describe('schema validation', () => {
  it('geometry.json and cameras.json parse', () => {
    expect(() => GeometrySpec.parse(geometryRaw())).not.toThrow()
    expect(() => CameraSet.parse(readJson('app-data/real/cameras.json'))).not.toThrow()
  })

  it('rejects an element without evidence', () => {
    const raw = geometryRaw()
    delete raw.elements[0].evidence
    const r = validateGeometry(raw, sources)
    expect(r.ok).toBe(false)
    expect(r.errors.join()).toMatch(/evidence/)
  })

  it('rejects a date range with from > to', () => {
    const raw = geometryRaw()
    raw.elements[0].validFrom = { from: '2024-10', to: '2022-11', approximate: true }
    expect(validateGeometry(raw, sources).ok).toBe(false)
  })
})

describe('footprint extents (brief §7.1, ±0.3 ft)', () => {
  const fp = buildFootprints(path.join(ROOT, 'data/building_footprints.geojson'))
  const house = fp.footprints.find((f) => f.id === 'footprint-house')!
  const garage = fp.footprints.find((f) => f.id === 'footprint-garage')!
  const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(0.3)

  it('house roof outline', () => {
    close(house.extents.sMin, -33.5)
    close(house.extents.sMax, 16.9)
    close(house.extents.tMin, -5.1)
    close(house.extents.tMax, 19.1)
    expect(house.heightRoofFt).toBeCloseTo(21.68, 1)
  })

  it('garage outline', () => {
    close(garage.extents.sMin, 34.0)
    close(garage.extents.sMax, 44.3)
    close(garage.extents.tMin, -7.0)
    close(garage.extents.tMax, 12.4)
    expect(garage.heightRoofFt).toBeCloseTo(11.49, 1)
  })

  it('geometry spec garage matches the footprint (±0.3 ft)', () => {
    const g = GeometrySpec.parse(geometryRaw()).elements.find((e) => e.id === 'garage')!
    close(g.params.sMin!.value as number, garage.extents.sMin)
    close(g.params.sMax!.value as number, garage.extents.sMax)
    close(g.params.tMin!.value as number, garage.extents.tMin)
    close(g.params.tMax!.value as number, garage.extents.tMax)
  })
})

describe('parcel sanity margins (brief §7.2, ±1 ft)', () => {
  const spec = GeometrySpec.parse(geometryRaw())
  const parcel = spec.elements.find((e) => e.id === 'parcel')!
  const fp = buildFootprints(path.join(ROOT, 'data/building_footprints.geojson'))
  const house = fp.footprints.find((f) => f.id === 'footprint-house')!.extents
  const garage = fp.footprints.find((f) => f.id === 'footprint-garage')!.extents
  const p = (k: string) => parcel.params[k]!.value as number
  const within = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(1)

  it('is 50 × 100 ft centred on the PLUTO point', () => {
    expect(p('sMax') - p('sMin')).toBe(100)
    expect(p('tMax') - p('tMin')).toBe(50)
    expect(p('sMin') + p('sMax')).toBe(0)
    expect(p('tMin') + p('tMax')).toBe(0)
    expect(parcel.evidence).toBe('derived_approximate')
  })

  it('leaves the observed yard margins', () => {
    within(house.sMin - p('sMin'), 16.5) // front yard
    within(house.tMin - p('tMin'), 20) // SW side lawn along 139th Ave
    within(p('tMax') - house.tMax, 6) // NE strip
    within(p('sMax') - garage.sMax, 6) // rear margin behind the garage
  })
})

describe('never-add rejection and layout', () => {
  const withElement = (el: Record<string, unknown>) => {
    const raw = geometryRaw()
    raw.elements.push(el)
    return validateGeometry(raw, sources)
  }
  const base = { params: {}, evidence: 'observed', sourceIds: ['S9'], notes: 'test' }

  it.each(['pool', 'deck', 'shed', 'dormer', 'shutters', 'boulder'])('rejects a %s', (word) => {
    const r = withElement({ ...base, id: `${word}-1`, kind: 'context' })
    expect(r.ok).toBe(false)
    expect(r.errors.join()).toMatch(/never-add/)
  })

  it('rejects a second chimney', () => {
    const raw = geometryRaw()
    const chimney = raw.elements.find((e: { id: string }) => e.id === 'chimney')
    raw.elements.push({ ...chimney, id: 'chimney-2' })
    expect(validateGeometry(raw, sources).errors.join()).toMatch(/exactly one chimney/)
  })

  it('rejects an attached or brick garage', () => {
    const raw = geometryRaw()
    const g = raw.elements.find((e: { id: string }) => e.id === 'garage')
    g.params.attached = { value: true, evidence: 'observed' }
    g.params.wallColor = { value: 'brick', evidence: 'observed' }
    const errs = validateGeometry(raw, sources).errors.join()
    expect(errs).toMatch(/detached/)
    expect(errs).toMatch(/brick/)
  })

  it('rejects a mirrored layout (door not on the NW end, driveway on 250th St)', () => {
    const raw = geometryRaw()
    raw.elements.find((e: { id: string }) => e.id === 'front-door').params.wall.value = 'sw'
    raw.elements.find((e: { id: string }) => e.id === 'driveway').params.tMin.value = 25
    const errs = validateGeometry(raw, sources).errors.join()
    expect(errs).toMatch(/NW gable end/)
    expect(errs).toMatch(/139th Ave/)
  })

  it('a dated variant with render:false may describe history without failing', () => {
    const spec = GeometrySpec.parse(geometryRaw())
    expect(spec.elements.find((e) => e.id === 'fence-2012-silver')?.render).toBe(false)
  })
})

describe('evidence and sources', () => {
  it('the real geometry validates with no errors', () => {
    const r = validateGeometry(geometryRaw(), sources)
    expect(r.errors).toEqual([])
  })

  it('every element has evidence, notes and known source ids', () => {
    const ids = new Set(sources.map((s) => s.id))
    for (const el of GeometrySpec.parse(geometryRaw()).elements) {
      expect(el.evidence).toBeTruthy()
      expect(el.notes.length).toBeGreaterThan(0)
      for (const s of el.sourceIds) expect(ids.has(s)).toBe(true)
      for (const p of Object.values(el.params)) expect(p.evidence).toBeTruthy()
    }
  })

  it("rejects 'verified' evidence without an official source", () => {
    const raw = geometryRaw()
    const maple = raw.elements.find((e: { id: string }) => e.id === 'maple')
    maple.params.height.evidence = 'verified'
    expect(validateGeometry(raw, sources).errors.join()).toMatch(/without an official source/)
  })

  it('rejects unknown source ids', () => {
    const raw = geometryRaw()
    raw.elements[0].sourceIds = ['S99']
    expect(validateGeometry(raw, sources).errors.join()).toMatch(/unknown source id S99/)
  })

  it('Google and Bing imagery are link-only', () => {
    for (const id of ['S9', 'S10'])
      expect(sources.find((s) => s.id === id)?.rights).toBe('link_only')
  })

  it('committed import output is current', () => {
    const { errors, outputs } = runImport({ write: false })
    expect(errors).toEqual([])
    for (const [file, content] of Object.entries(outputs)) {
      expect(readFileSync(path.join(ROOT, 'app-data/real', file), 'utf8')).toBe(content)
    }
  })
})
