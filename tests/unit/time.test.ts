import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { GeometrySpec } from '../../src/data/schema'
import { bounds, resolveStateAt } from '../../src/data/time'

const spec = GeometrySpec.parse(
  JSON.parse(readFileSync(path.resolve(__dirname, '../../app-data/real/geometry.json'), 'utf8')),
)
const ids = (r: ReturnType<typeof resolveStateAt>, presence?: string) =>
  r.elements.filter((e) => !presence || e.presence === presence).map((e) => e.element.id)

describe('resolveStateAt', () => {
  it('present: every rendered element, black fence not the 2012 silver variant', () => {
    const r = resolveStateAt(spec, 'present')
    expect(r.unverified).toBe(false)
    expect(ids(r)).toContain('fence-front-250th')
    expect(ids(r)).not.toContain('fence-2012-silver')
    expect(r.elements.every((e) => e.presence === 'active')).toBe(true)
  })

  it('2012: silver fence (removal date unknown), no black fence yet', () => {
    const r = resolveStateAt(spec, '2012-09')
    expect(ids(r)).toContain('fence-2012-silver')
    expect(ids(r)).not.toContain('fence-front-250th')
    expect(r.unverified).toBe(false)
  })

  it('2016: neither fence', () => {
    const r = resolveStateAt(spec, '2016')
    expect(ids(r)).not.toContain('fence-2012-silver')
    expect(ids(r)).not.toContain('fence-front-250th')
  })

  it('2023: the black fence is uncertain inside its install bracket', () => {
    const r = resolveStateAt(spec, '2023-06')
    expect(ids(r, 'uncertain')).toContain('fence-front-250th')
  })

  it('2025: black fence active; rear fence not yet seen', () => {
    const r = resolveStateAt(spec, '2025-01')
    expect(ids(r, 'active')).toContain('fence-front-250th')
    expect(ids(r)).not.toContain('fence-rear')
  })

  it('before Aug 2012 is flagged as unverified', () => {
    expect(resolveStateAt(spec, '1980').unverified).toBe(true)
  })

  it('bounds pad partial dates', () => {
    expect(bounds({ exact: '2012-08', approximate: false })).toEqual(['2012-08-01', '2012-08-31'])
    expect(bounds({ from: '2017-11', to: '2018-07', approximate: false })).toEqual([
      '2017-11-01',
      '2018-07-31',
    ])
  })
})
