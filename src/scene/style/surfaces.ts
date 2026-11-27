/**
 * Procedural surface textures (no photos, no third-party imagery: IMAGERY_MANIFEST).
 * All textures use metric UVs: geometry supplies metres, `repeat` converts to tiles.
 * Greyscale textures are tinted by the palette colour; brick carries its own colour.
 */
import * as THREE from 'three'
import { ft } from '@/data/frame'

export type SurfaceKey =
  'brick' | 'siding' | 'shingle' | 'shingleT' | 'concrete' | 'lawn' | 'windowWarm' | 'chain'

type Def = {
  tileFt: number
  size: number
  roughness: number
  /** When set, the material colour is this instead of the palette tint. */
  ownColor?: boolean
  rotate?: boolean
  draw: (g: CanvasRenderingContext2D, n: number, rand: () => number) => void
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const grey = (v: number) => {
  const c = Math.max(0, Math.min(255, Math.round(v * 255)))
  return `rgb(${c},${c},${c})`
}

const DEFS: Record<SurfaceKey, Def> = {
  brick: {
    tileFt: 2,
    size: 256,
    roughness: 0.92,
    ownColor: true,
    draw: (g, n, rand) => {
      g.fillStyle = '#b3a592'
      g.fillRect(0, 0, n, n)
      const rows = 9
      const perRow = 3
      const rh = n / rows
      const bw = n / perRow
      for (let r = 0; r < rows; r++) {
        const off = r % 2 ? bw / 2 : 0
        for (let c = -1; c < perRow + 1; c++) {
          const l = 0.82 + rand() * 0.3
          const hue = 8 + rand() * 6
          g.fillStyle = `hsl(${hue}, ${42 + rand() * 10}%, ${34 * l}%)`
          g.fillRect(c * bw + off + 2, r * rh + 2, bw - 4, rh - 4)
        }
      }
    },
  },
  siding: {
    tileFt: 1.5,
    size: 256,
    roughness: 0.8,
    draw: (g, n, rand) => {
      const boards = 6
      const bh = n / boards
      for (let b = 0; b < boards; b++) {
        const grad = g.createLinearGradient(0, b * bh, 0, (b + 1) * bh)
        const base = 0.94 + rand() * 0.04
        grad.addColorStop(0, grey(base))
        grad.addColorStop(0.82, grey(base - 0.03))
        grad.addColorStop(0.93, grey(0.62))
        grad.addColorStop(1, grey(0.5))
        g.fillStyle = grad
        g.fillRect(0, b * bh, n, bh)
      }
    },
  },
  shingle: {
    tileFt: 3,
    size: 256,
    roughness: 0.95,
    rotate: true,
    draw: (g, n, rand) => shingles(g, n, rand),
  },
  shingleT: {
    tileFt: 3,
    size: 256,
    roughness: 0.95,
    draw: (g, n, rand) => shingles(g, n, rand),
  },
  concrete: {
    tileFt: 4,
    size: 256,
    roughness: 0.9,
    draw: (g, n, rand) => {
      g.fillStyle = grey(0.9)
      g.fillRect(0, 0, n, n)
      for (let i = 0; i < 1800; i++) {
        g.fillStyle = grey(0.78 + rand() * 0.2)
        g.fillRect(rand() * n, rand() * n, 1 + rand() * 2, 1 + rand() * 2)
      }
      g.fillStyle = grey(0.62)
      g.fillRect(0, 0, n, 3)
      g.fillRect(0, 0, 3, n)
    },
  },
  lawn: {
    tileFt: 5,
    size: 256,
    roughness: 1,
    draw: (g, n, rand) => {
      g.fillStyle = grey(0.9)
      g.fillRect(0, 0, n, n)
      for (let i = 0; i < 70; i++) {
        const x = rand() * n
        const y = rand() * n
        const r = 14 + rand() * 34
        const grad = g.createRadialGradient(x, y, 0, x, y, r)
        const v = 0.7 + rand() * 0.3
        grad.addColorStop(0, `${grey(v)}`.replace('rgb', 'rgba').replace(')', ',0.22)'))
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        g.fillStyle = grad
        g.fillRect(x - r, y - r, r * 2, r * 2)
      }
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = grey(0.74 + rand() * 0.26)
        g.fillRect(rand() * n, rand() * n, 1, 2 + rand() * 2)
      }
    },
  },
  windowWarm: {
    tileFt: 1,
    size: 128,
    roughness: 0.35,
    draw: (g, n) => {
      const grad = g.createLinearGradient(0, 0, 0, n)
      grad.addColorStop(0, '#ffd98a')
      grad.addColorStop(1, '#ff9c3a')
      g.fillStyle = grad
      g.fillRect(0, 0, n, n)
      g.fillStyle = 'rgba(70,35,10,0.85)'
      g.fillRect(0, 0, n, 7)
      g.fillRect(0, 0, 7, n)
    },
  },
  chain: {
    tileFt: 0.45,
    size: 128,
    roughness: 0.6,
    draw: (g, n) => {
      g.clearRect(0, 0, n, n)
      g.strokeStyle = '#ffffff'
      g.lineWidth = 7
      g.beginPath()
      g.moveTo(0, 0)
      g.lineTo(n, n)
      g.moveTo(0, n)
      g.lineTo(n, 0)
      g.stroke()
    },
  },
}

function shingles(g: CanvasRenderingContext2D, n: number, rand: () => number) {
  g.fillStyle = grey(0.55)
  g.fillRect(0, 0, n, n)
  const rows = 8
  const tabs = 4
  const rh = n / rows
  const tw = n / tabs
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? tw / 2 : 0
    for (let c = -1; c <= tabs; c++) {
      g.fillStyle = grey(0.78 + rand() * 0.22)
      g.fillRect(c * tw + off + 1.5, r * rh, tw - 3, rh - 1.5)
    }
    g.fillStyle = grey(0.4)
    g.fillRect(0, (r + 1) * rh - 3, n, 3)
  }
}

const textures = new Map<SurfaceKey, THREE.CanvasTexture>()

function texture(key: SurfaceKey): THREE.CanvasTexture {
  const hit = textures.get(key)
  if (hit) return hit
  const def = DEFS[key]
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = def.size
  const g = canvas.getContext('2d')!
  def.draw(g, def.size, rng(key.length * 7919 + def.size))
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1 / ft(def.tileFt), 1 / ft(def.tileFt))
  if (def.rotate) {
    t.center.set(0.5, 0.5)
    t.rotation = Math.PI / 2
  }
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  textures.set(key, t)
  return t
}

type MaterialProps = {
  color: string
  map?: THREE.Texture
  emissive?: string
  emissiveMap?: THREE.Texture
  emissiveIntensity?: number
  roughness: number
  transparent?: boolean
  alphaTest?: number
  side?: THREE.Side
}

/** Props for a `meshStandardMaterial`. `tint` is the palette colour for greyscale textures. */
export function surfaceProps(key: SurfaceKey, tint: string): MaterialProps {
  const def = DEFS[key]
  const map = texture(key)
  if (key === 'windowWarm') {
    return {
      color: '#14141a',
      emissive: '#ffffff',
      emissiveMap: map,
      emissiveIntensity: 1.7,
      roughness: def.roughness,
    }
  }
  if (key === 'chain') {
    return {
      color: tint,
      map,
      roughness: def.roughness,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
    }
  }
  return { color: def.ownColor ? '#ffffff' : tint, map, roughness: def.roughness }
}
