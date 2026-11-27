/** Projects the official NYC building footprints into the local and lot-aligned frames. */
import { readFileSync } from 'node:fs'
import { FootprintRecord, Footprints } from '../../src/data/schema'
import { LONG_AXIS_BEARING_DEG, PLUTO_ORIGIN, lonLatToLot } from '../../src/data/frame'

type Feature = {
  properties: { bin: string; role: string; height_roof_ft: number; ground_elevation_ft: number }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][][] }
}

export function buildFootprints(geojsonPath: string): Footprints {
  const fc = JSON.parse(readFileSync(geojsonPath, 'utf8')) as { features: Feature[] }
  const footprints = fc.features.map((f): FootprintRecord => {
    const ring = f.geometry.coordinates[0]?.[0]
    if (!ring) throw new Error(`Footprint ${f.properties.bin} has no ring`)
    const open = ring.slice(0, -1)
    const corners = open.map(([lon, lat]) => {
      const p = lonLatToLot(lon as number, lat as number)
      return [round(p.s), round(p.t)] as [number, number]
    })
    const ss = corners.map((c) => c[0])
    const ts = corners.map((c) => c[1])
    const sides = corners.map((c, i) => {
      const n = corners[(i + 1) % corners.length] as [number, number]
      return round(Math.hypot(n[0] - c[0], n[1] - c[1]))
    })
    return {
      id: f.properties.role === 'main house' ? 'footprint-house' : 'footprint-garage',
      bin: f.properties.bin,
      role: f.properties.role,
      heightRoofFt: f.properties.height_roof_ft,
      groundElevationFt: f.properties.ground_elevation_ft,
      cornersLot: corners,
      extents: {
        sMin: Math.min(...ss),
        sMax: Math.max(...ss),
        tMin: Math.min(...ts),
        tMax: Math.max(...ts),
      },
      sidesFt: sides,
      evidence: 'verified',
      sourceIds: ['S16'],
    }
  })
  return Footprints.parse({
    generatedFrom: 'data/building_footprints.geojson',
    frame: {
      originLat: PLUTO_ORIGIN.lat,
      originLon: PLUTO_ORIGIN.lon,
      longAxisBearingDeg: LONG_AXIS_BEARING_DEG,
    },
    footprints,
  })
}

const round = (v: number) => Math.round(v * 100) / 100
