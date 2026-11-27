/**
 * Projects the official DOF tax-lot polygon (data/tax_lot_polygon.geojson) into the lot frame.
 * The polygon sits ≈1° off the house axis, so the rendered axis-aligned rectangle uses the
 * mid-points of each edge (the rectangle that best fits the rotated lot).
 */
import { readFileSync } from 'node:fs'
import { lonLatToLot } from '../../src/data/frame'

export type ParcelFit = {
  cornersLot: [number, number][]
  sMin: number
  sMax: number
  tMin: number
  tMax: number
}

export function buildParcel(geojsonPath: string): ParcelFit {
  const fc = JSON.parse(readFileSync(geojsonPath, 'utf8')) as {
    features: { geometry: { type: 'Polygon'; coordinates: number[][][] } }[]
  }
  const ring = fc.features[0]?.geometry.coordinates[0]
  if (!ring || ring.length < 5) throw new Error('Tax-lot polygon has no ring')
  const corners = ring.slice(0, 4).map(([lon, lat]) => {
    const p = lonLatToLot(lon as number, lat as number)
    return [round(p.s), round(p.t)] as [number, number]
  })
  // Sort corners by s to find the NW pair (small s) and SE pair (large s), then by t.
  const bySide = (pick: (c: [number, number]) => number, low: boolean) => {
    const sorted = [...corners].sort((a, b) => pick(a) - pick(b))
    const pair = low ? sorted.slice(0, 2) : sorted.slice(2)
    return round((pick(pair[0]!) + pick(pair[1]!)) / 2)
  }
  return {
    cornersLot: corners,
    sMin: bySide((c) => c[0], true),
    sMax: bySide((c) => c[0], false),
    tMin: bySide((c) => c[1], true),
    tMax: bySide((c) => c[1], false),
  }
}

const round = (v: number) => Math.round(v * 100) / 100
