/**
 * Colours matching the observed materials. Since Phase 0.2 these tint the procedural surface
 * textures in `style/surfaces.ts` (brick carries its own colour); glow and bloom live in `style/`.
 */
export const PALETTE: Record<string, string> = {
  'brick-red-brown': '#9a5240',
  cream: '#efe3c4',
  white: '#f2f1ec',
  'shingle-dark': '#3d3a3b',
  'shingle-pale': '#a7a9ab',
  'reddish-brown': '#7d4535',
  'concrete-light': '#cfcac0',
  'concrete-red-brown': '#8d5444',
  stone: '#b9b2a3',
  glass: '#2b3440',
  lawn: '#7da35a',
  'platform-side': '#2c3442',
  ground: '#3a4352',
  sidewalk: '#8f9196',
  'chain-link-black': '#151515',
  'chain-link-silver': '#b8bcc0',
  'metal-black': '#151515',
  'vinyl-white': '#efefea',
  'japanese-maple-red': '#9e2a2b',
  'mature-deciduous': '#4c6b3c',
  trunk: '#4a3a2c',
  shrub: '#45633a',
  brick: '#8a4a3a',
}

export const color = (key: unknown, fallback = '#ff00ff') => PALETTE[String(key)] ?? fallback
