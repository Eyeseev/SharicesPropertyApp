/**
 * Server-only loader for normalised real data. Only called after a session check.
 * Never imports app-data/fixtures (enforced by tests and the build check).
 */
import geometryJson from '@app-data/real/geometry.json'
import camerasJson from '@app-data/real/cameras.json'
import sourcesJson from '@app-data/real/sources.json'
import footprintsJson from '@app-data/real/footprints.json'
import { CameraSet, Footprints, GeometrySpec, Source } from './schema'
import { z } from 'zod'

export type PropertyData = {
  geometry: GeometrySpec
  cameras: CameraSet
  sources: Source[]
  footprints: Footprints
}

export function loadPropertyData(): PropertyData {
  return {
    geometry: GeometrySpec.parse(geometryJson),
    cameras: CameraSet.parse(camerasJson),
    sources: z.array(Source).parse(sourcesJson),
    footprints: Footprints.parse(footprintsJson),
  }
}
