import { afterEach, describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { isAllowed, isTestAuthEnabled, parseAllowlist } from '../../src/auth/config'
import { buildProviders, TEST_PROVIDER_ID } from '../../src/auth/options'
import { MIN_DISTANCE_FT, TARGET_BOX_FT } from '../../src/scene/limits'
import { GeometrySpec } from '../../src/data/schema'

const ROOT = path.resolve(__dirname, '../..')
// next-auth v4 keeps a custom provider id in `options` until runtime merging.
const providerIds = () =>
  buildProviders().map((p) => (p as { options?: { id?: string } }).options?.id ?? p.id)

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

describe('fixture isolation', () => {
  it('no production source imports app-data/fixtures', () => {
    const files = [
      ...walk(path.join(ROOT, 'src')),
      ...walk(path.join(ROOT, 'app')),
      path.join(ROOT, 'proxy.ts'),
    ]
    const importsFixture =
      /(from\s+['"][^'"]*fixtures|import\(\s*['"][^'"]*fixtures|require\(\s*['"][^'"]*fixtures)/
    const offenders = files.filter((f) => importsFixture.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('the fixture is clearly fictional', () => {
    const fx = JSON.parse(
      readFileSync(path.join(ROOT, 'app-data/fixtures/fictional-property.json'), 'utf8'),
    )
    expect(fx.FICTIONAL_FIXTURE_MARKER).toBeTruthy()
  })

  it('nothing private in public/', () => {
    let files: string[] = []
    try {
      files = walk(path.join(ROOT, 'public'))
    } catch {
      files = []
    }
    expect(files.filter((f) => !/favicon/.test(f))).toEqual([])
  })
})

describe('auth configuration', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('allowlist is case-insensitive and trims', () => {
    expect(parseAllowlist(' A@x.test , b@Y.test ')).toEqual(['a@x.test', 'b@y.test'])
    expect(isAllowed('B@y.TEST', 'a@x.test,b@y.test')).toBe(true)
    expect(isAllowed('c@z.test', 'a@x.test,b@y.test')).toBe(false)
    expect(isAllowed(null, 'a@x.test')).toBe(false)
    expect(isAllowed('a@x.test', '')).toBe(false)
  })

  it('test provider is absent in production even with AUTH_TEST_MODE=1', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('AUTH_TEST_MODE', '1')
    expect(isTestAuthEnabled()).toBe(false)
    expect(providerIds()).not.toContain(TEST_PROVIDER_ID)
  })

  it('test provider is absent without AUTH_TEST_MODE', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('AUTH_TEST_MODE', '')
    expect(providerIds()).not.toContain(TEST_PROVIDER_ID)
  })

  it('test provider is present only when enabled outside production', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('AUTH_TEST_MODE', '1')
    expect(providerIds()).toContain(TEST_PROVIDER_ID)
  })
})

describe('camera limits keep the camera out of the house', () => {
  it('minimum distance exceeds the worst-case target-to-house distance', () => {
    const spec = GeometrySpec.parse(
      JSON.parse(readFileSync(path.join(ROOT, 'app-data/real/geometry.json'), 'utf8')),
    )
    const n = (id: string, k: string) =>
      spec.elements.find((e) => e.id === id)!.params[k]!.value as number
    // House + porch/steps + extension box, plus the roof outline overhang.
    const house = {
      sMin: n('house-walls', 'sMin') - n('front-steps', 'run'),
      sMax: n('extension', 'sMax') + 0.5,
      tMin: n('house-walls', 'tCenter') - n('house-walls', 'width') / 2 - 1.1,
      tMax: n('house-walls', 'tCenter') + n('house-walls', 'width') / 2 + 1.1,
      hMax: n('roof-nw', 'ridgeHeight'),
    }
    const far = (a0: number, a1: number, b0: number, b1: number) =>
      Math.max(Math.abs(b1 - a0), Math.abs(b0 - a1), Math.abs(b1 - a1), Math.abs(b0 - a0))
    const worst = Math.hypot(
      far(TARGET_BOX_FT.sMin, TARGET_BOX_FT.sMax, house.sMin, house.sMax),
      far(TARGET_BOX_FT.tMin, TARGET_BOX_FT.tMax, house.tMin, house.tMax),
      far(TARGET_BOX_FT.hMin, TARGET_BOX_FT.hMax, 0, house.hMax),
    )
    expect(MIN_DISTANCE_FT).toBeGreaterThan(worst)
  })

  it('every preset target lies inside the target box and respects the minimum distance', () => {
    const cams = JSON.parse(readFileSync(path.join(ROOT, 'app-data/real/cameras.json'), 'utf8'))
    for (const p of cams.presets) {
      const [s, t, h] = p.target
      expect(s).toBeGreaterThanOrEqual(TARGET_BOX_FT.sMin)
      expect(s).toBeLessThanOrEqual(TARGET_BOX_FT.sMax)
      expect(t).toBeGreaterThanOrEqual(TARGET_BOX_FT.tMin)
      expect(t).toBeLessThanOrEqual(TARGET_BOX_FT.tMax)
      expect(h).toBeGreaterThanOrEqual(TARGET_BOX_FT.hMin)
      expect(h).toBeLessThanOrEqual(TARGET_BOX_FT.hMax)
      const d = Math.hypot(p.position[0] - s, p.position[1] - t, p.position[2] - h)
      expect(d).toBeGreaterThan(MIN_DISTANCE_FT)
    }
  })
})
