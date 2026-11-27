import type { QualityTier } from '@/state/store'

/** Rendering budget per tier (TECHNICAL_ARCHITECTURE §5). No numeric FPS targets are set. */
export type QualitySettings = {
  dpr: [number, number]
  shadows: boolean
  shadowMap: number
  /** Blurred ground reflections (drei MeshReflectorMaterial). */
  reflector: boolean
  /** Post-processing chain: bloom, tone mapping, vignette (and SMAA when `smaa`). */
  composer: boolean
  bloom: number
  smaa: boolean
  particles: number
  pointLights: boolean
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  showcase: {
    dpr: [1, 2],
    shadows: true,
    shadowMap: 2048,
    reflector: true,
    composer: true,
    bloom: 0.9,
    smaa: true,
    particles: 260,
    pointLights: true,
  },
  balanced: {
    dpr: [1, 1.5],
    shadows: true,
    shadowMap: 1024,
    reflector: false,
    composer: true,
    bloom: 0.7,
    smaa: false,
    particles: 70,
    pointLights: true,
  },
  simple: {
    dpr: [1, 1],
    shadows: false,
    shadowMap: 512,
    reflector: false,
    composer: false,
    bloom: 0,
    smaa: false,
    particles: 24,
    pointLights: false,
  },
}
