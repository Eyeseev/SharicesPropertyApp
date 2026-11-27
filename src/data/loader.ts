/**
 * Server-only loader for normalised real data. Only called after a session check.
 * Never imports app-data/fixtures (enforced by tests and the build check).
 */
import geometryJson from '@app-data/real/geometry.json'
import camerasJson from '@app-data/real/cameras.json'
import sourcesJson from '@app-data/real/sources.json'
import footprintsJson from '@app-data/real/footprints.json'
import factsJson from '@app-data/real/facts.json'
import financialsJson from '@app-data/real/financials.json'
import chronicleJson from '@app-data/real/chronicle.json'
import photosJson from '@app-data/real/photos.json'
import conflictsJson from '@app-data/real/conflicts.json'
import {
  CameraSet,
  ChronicleEvent,
  Conflict,
  Fact,
  FinancialEntry,
  Footprints,
  GeometrySpec,
  Photo,
  Source,
} from './schema'
import { z } from 'zod'

export type PropertyData = {
  geometry: GeometrySpec
  cameras: CameraSet
  sources: Source[]
  footprints: Footprints
  facts: Fact[]
  financials: FinancialEntry[]
  chronicle: ChronicleEvent[]
  /** Photo records. Stored files are fetched separately from /api/photos/[id]. */
  photos: Photo[]
  conflicts: Conflict[]
}

export function loadPropertyData(): PropertyData {
  return {
    geometry: GeometrySpec.parse(geometryJson),
    cameras: CameraSet.parse(camerasJson),
    sources: z.array(Source).parse(sourcesJson),
    footprints: Footprints.parse(footprintsJson),
    facts: z.array(Fact).parse(factsJson),
    financials: z.array(FinancialEntry).parse(financialsJson),
    chronicle: z.array(ChronicleEvent).parse(chronicleJson),
    photos: z.array(Photo).parse(photosJson),
    conflicts: z.array(Conflict).parse(conflictsJson),
  }
}

/** Repo-relative file for a stored photo, looked up by id only (no caller-supplied paths). */
export function storedPhotoFile(id: string): { file: string; title: string } | null {
  const p = z.array(Photo).parse(photosJson).find((x) => x.id === id)
  return p && p.storage === 'stored' && p.file ? { file: p.file, title: p.title } : null
}
