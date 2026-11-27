/**
 * Local coordinate frames (TECHNICAL_ARCHITECTURE §4.1, PHASE_0.1_BRIEF §7.1).
 *
 * - Local east/north frame: equirectangular projection around the PLUTO point, in feet.
 * - Lot frame: s = distance toward SE along the long axis, t = distance toward NE across the lot.
 * - Scene frame (three.js): x = t, z = s, y = up, in metres. Viewed from above with -z up on
 *   screen this is the real, non-mirrored layout.
 */

export const PLUTO_ORIGIN = { lat: 40.6628678, lon: -73.7305241 } as const
/** Bearing of the long axis toward SE, derived from the official footprints. */
export const LONG_AXIS_BEARING_DEG = 145.8
export const FT_TO_M = 0.3048
const EARTH_RADIUS_M = 6378137

export type EN = { east: number; north: number }
export type LotPoint = { s: number; t: number }

export function lonLatToEN(lon: number, lat: number, origin = PLUTO_ORIGIN): EN {
  const rad = Math.PI / 180
  const eastM = (lon - origin.lon) * rad * EARTH_RADIUS_M * Math.cos(origin.lat * rad)
  const northM = (lat - origin.lat) * rad * EARTH_RADIUS_M
  return { east: eastM / FT_TO_M, north: northM / FT_TO_M }
}

function axes(bearingDeg: number) {
  const b = (bearingDeg * Math.PI) / 180
  const tb = ((bearingDeg - 90) * Math.PI) / 180
  return {
    s: { e: Math.sin(b), n: Math.cos(b) },
    t: { e: Math.sin(tb), n: Math.cos(tb) },
  }
}

export function enToLot(p: EN, bearingDeg = LONG_AXIS_BEARING_DEG): LotPoint {
  const a = axes(bearingDeg)
  return {
    s: p.east * a.s.e + p.north * a.s.n,
    t: p.east * a.t.e + p.north * a.t.n,
  }
}

export function lonLatToLot(lon: number, lat: number): LotPoint {
  return enToLot(lonLatToEN(lon, lat))
}

/** Lot frame (feet) to scene (metres): x = t, y = height, z = s. */
export function lotToScene(s: number, t: number, h = 0): [number, number, number] {
  return [t * FT_TO_M, h * FT_TO_M, s * FT_TO_M]
}

export const ft = (v: number) => v * FT_TO_M
