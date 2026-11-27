/**
 * The orbit target is confined to this box at the house centre (lot frame, ft), so the property
 * can never be lost. Presets' targets lie inside it.
 */
export const TARGET_BOX_FT = { sMin: -14, sMax: -2, tMin: 3, tMax: 11, hMin: 0, hMax: 12 }
/**
 * Worst-case distance from any point of TARGET_BOX_FT to the far corner of the house + porch +
 * extension box (s -36.5..16.9, t -5.1..19.1, h 0..21.7) is 43.8 ft, so with a 45 ft minimum
 * distance the camera can never be inside the house. Checked by a unit test.
 */
export const MIN_DISTANCE_FT = 45
