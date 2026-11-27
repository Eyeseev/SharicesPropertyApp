/**
 * Stylized vegetation (CREATIVE_DIRECTION §3.6): lumpy leaf clusters merged into one mesh with
 * per-vertex colour, no individual leaves. Deterministic per seed so renders are repeatable.
 */
import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export const hashSeed = (id: string) =>
  [...id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)

/** Shared wind clock for the sway shader, advanced once per frame. */
export const windTime = { value: 0 }

type ClusterOpts = {
  seed: number
  /** Overall radius (m) of the canopy envelope. */
  radius: number
  blobs: number
  /** Vertical squash of the whole envelope. */
  squash: number
  /** Light-to-dark colour ramp, top first. */
  tones: [string, string, string]
}

/** One merged canopy geometry centred at the origin, y up. */
export function leafCluster({ seed, radius, blobs, squash, tones }: ClusterOpts) {
  const rand = rng(seed)
  const top = new THREE.Color(tones[0])
  const mid = new THREE.Color(tones[1])
  const low = new THREE.Color(tones[2])
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < blobs; i++) {
    const a = rand() * Math.PI * 2
    const spread = i === 0 ? 0 : 0.35 + rand() * 0.45
    const r = radius * (i === 0 ? 0.62 : 0.3 + rand() * 0.22)
    const cx = Math.cos(a) * radius * spread
    const cz = Math.sin(a) * radius * spread
    const cy = (rand() - 0.35) * radius * 0.5 * squash
    let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(r, 2)
    g.deleteAttribute('normal')
    g.deleteAttribute('uv')
    g = mergeVertices(g, 1e-4)
    const pos = g.getAttribute('position')
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    const v = new THREE.Vector3()
    for (let k = 0; k < pos.count; k++) {
      v.fromBufferAttribute(pos, k)
      // Lumpy surface: a smooth function of position so shared vertices stay joined.
      const n =
        1 +
        0.13 * Math.sin(v.x * 7.1 + seed) * Math.cos(v.y * 6.3 - seed) +
        0.1 * Math.sin(v.z * 9.7 + v.x * 3.3)
      v.multiplyScalar(n)
      const wy = v.y * squash + cy
      pos.setXYZ(k, v.x + cx, wy, v.z + cz)
      const h = THREE.MathUtils.clamp((wy / radius + 0.6) / 1.4, 0, 1)
      c.copy(low)
        .lerp(mid, Math.min(1, h * 1.6))
        .lerp(top, Math.max(0, h * 1.6 - 0.8))
      const jitter = 0.9 + 0.2 * Math.sin(v.x * 13 + v.z * 11 + i * 2.1)
      colors[k * 3] = c.r * jitter
      colors[k * 3 + 1] = c.g * jitter
      colors[k * 3 + 2] = c.b * jitter
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    parts.push(g)
  }
  const merged = mergeGeometries(parts, false)!
  parts.forEach((p) => p.dispose())
  merged.computeBoundingSphere()
  return merged
}

/** Adds a soft wind sway to a standard material; stronger higher up the canopy. */
export function addWindSway(mat: THREE.MeshStandardMaterial, strength: number) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = windTime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float sway = ${strength.toFixed(3)} * (0.4 + max(position.y, 0.0));
        transformed.x += sin(uWind * 0.9 + position.z * 1.7 + position.y * 0.8) * sway;
        transformed.z += cos(uWind * 0.7 + position.x * 1.5) * sway * 0.7;`,
      )
  }
  mat.customProgramCacheKey = () => `sway-${strength}`
}
