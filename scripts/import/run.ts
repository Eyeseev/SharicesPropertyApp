/**
 * `pnpm import`: normalise and validate inputs into app-data/real/.
 * Raw research/ and data/ files are read only, never modified.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { CameraSet } from '../../src/data/schema'
import { buildSources } from './sources'
import { buildFootprints } from './footprints'
import { validateGeometry } from './geometry'
import { buildParcel } from './parcel'

export const ROOT = path.resolve(import.meta.dirname, '../..')
const out = (f: string) => path.join(ROOT, 'app-data/real', f)
const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n'

export function runImport({ write }: { write: boolean }) {
  const sources = buildSources()
  const footprints = buildFootprints(path.join(ROOT, 'data/building_footprints.geojson'))
  const geometry = validateGeometry(JSON.parse(readFileSync(out('geometry.json'), 'utf8')), sources)
  const cameras = CameraSet.safeParse(JSON.parse(readFileSync(out('cameras.json'), 'utf8')))

  const errors = [...geometry.errors]
  errors.push(...checkParcel(geometry.spec))
  if (!cameras.success) errors.push(...cameras.error.issues.map((i) => `cameras: ${i.message}`))

  const outputs = { 'sources.json': json(sources), 'footprints.json': json(footprints) }
  if (write && errors.length === 0) {
    for (const [f, content] of Object.entries(outputs)) writeFileSync(out(f), content)
  }
  return { errors, outputs }
}

/** The rendered parcel must stay within 0.3 ft of the official DOF tax-lot polygon. */
function checkParcel(spec: ReturnType<typeof validateGeometry>['spec']): string[] {
  const el = spec?.elements.find((e) => e.id === 'parcel')
  if (!el) return spec ? ['parcel element missing'] : []
  const fit = buildParcel(path.join(ROOT, 'data/tax_lot_polygon.geojson'))
  return (['sMin', 'sMax', 'tMin', 'tMax'] as const).flatMap((k) => {
    const v = el.params[k]?.value
    return typeof v === 'number' && Math.abs(v - fit[k]) <= 0.3
      ? []
      : [`parcel.${k} = ${String(v)} is not within 0.3 ft of the tax-lot polygon (${fit[k]})`]
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const { errors } = runImport({ write: true })
  if (errors.length) {
    console.error('Import FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'))
    process.exit(1)
  }
  console.log(
    'Import OK: app-data/real/sources.json, footprints.json written; geometry and cameras valid.',
  )
}
