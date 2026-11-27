'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { ft } from '@/data/frame'
import { surfaceProps, type SurfaceKey } from '../style/surfaces'

export type Bounds = {
  sMin: number
  sMax: number
  tMin: number
  tMax: number
  hMin: number
  hMax: number
}

/** Box whose UVs are in metres on every face, so textures keep one real-world scale. */
export function metricBox(w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.getAttribute('uv')
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z; four vertices each.
  const dims: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ]
  for (let f = 0; f < 6; f++) {
    const [a, b] = dims[f]!
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i
      uv.setXY(k, uv.getX(k) * a, uv.getY(k) * b)
    }
  }
  return g
}

/** Axis-aligned box given in lot-frame feet (x = t, z = s, y = height). */
export function LotBox({
  b,
  color,
  opacity,
  castShadow = true,
  receiveShadow = true,
  name,
  surface,
  emissive,
}: {
  b: Bounds
  color: string
  opacity?: number
  castShadow?: boolean
  receiveShadow?: boolean
  name?: string
  surface?: SurfaceKey
  /** Self-lit stylistic accent (digital augmentation); never a property fact. */
  emissive?: { color: string; intensity: number }
}) {
  const size: [number, number, number] = [
    ft(b.tMax - b.tMin),
    ft(b.hMax - b.hMin),
    ft(b.sMax - b.sMin),
  ]
  const pos: [number, number, number] = [
    ft((b.tMin + b.tMax) / 2),
    ft((b.hMin + b.hMax) / 2),
    ft((b.sMin + b.sMax) / 2),
  ]
  const [w, h, d] = size
  const geometry = useMemo(() => metricBox(w, h, d), [w, h, d])
  const tex = surface ? surfaceProps(surface, color) : null
  return (
    <mesh
      name={name}
      geometry={geometry}
      position={pos}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <meshStandardMaterial
        {...(tex ?? { color, roughness: 0.85 })}
        {...(emissive ? { emissive: emissive.color, emissiveIntensity: emissive.intensity } : {})}
        transparent={opacity !== undefined || tex?.transparent}
        opacity={opacity ?? 1}
      />
    </mesh>
  )
}

/**
 * Solid triangular prism (gable infill). Triangle in the cross-section plane, extruded along
 * the ridge. `ridgeAlong = 's'`: triangle in the t/height plane, extruded along s.
 */
export function GablePrism({
  ridgeAlong,
  from,
  to,
  center,
  halfWidth,
  eave,
  ridge,
  color,
  surface,
}: {
  ridgeAlong: 's' | 't'
  from: number
  to: number
  center: number
  halfWidth: number
  eave: number
  ridge: number
  color: string
  surface?: SurfaceKey
}) {
  const mat = surface ? surfaceProps(surface, color) : { color, roughness: 0.9 }
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(ft(-halfWidth), ft(eave))
    shape.lineTo(ft(halfWidth), ft(eave))
    shape.lineTo(0, ft(ridge))
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: ft(to - from), bevelEnabled: false })
    return g
  }, [from, to, halfWidth, eave, ridge])

  // Default extrusion: shape in XY, depth along +Z. For ridge along s: X = t offset, Z = s. ✔
  // For ridge along t: rotate so the shape lies in the s/height plane and extrudes along +X (t).
  if (ridgeAlong === 's') {
    return (
      <mesh geometry={geometry} position={[ft(center), 0, ft(from)]} castShadow receiveShadow>
        <meshStandardMaterial {...mat} />
      </mesh>
    )
  }
  return (
    <mesh
      geometry={geometry}
      position={[ft(from), 0, ft(center)]}
      rotation={[0, Math.PI / 2, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial {...mat} />
    </mesh>
  )
}

/**
 * The two sloped roof planes of a gable roof, as thin slabs with overhang.
 * Coordinates: cross-section axis `c` (t for ridgeAlong s) and ridge axis `r`.
 */
export function GableSlopes({
  ridgeAlong,
  from,
  to,
  center,
  halfWidth,
  eave,
  ridge,
  overhang,
  color,
  thickness = 0.35,
  surface,
}: {
  ridgeAlong: 's' | 't'
  from: number
  to: number
  center: number
  halfWidth: number
  eave: number
  ridge: number
  overhang: number
  color: string
  thickness?: number
  surface?: SurfaceKey
}) {
  const mat = surface ? surfaceProps(surface, color) : { color, roughness: 0.9 }
  const rise = ridge - eave
  const pitch = Math.atan2(rise, halfWidth)
  const run = halfWidth + overhang
  const slopeLen = run / Math.cos(pitch)
  const length = to - from
  const mid = (from + to) / 2
  const geoS = useMemo(
    () => metricBox(ft(slopeLen), ft(thickness), ft(length)),
    [slopeLen, thickness, length],
  )
  const geoT = useMemo(
    () => metricBox(ft(length), ft(thickness), ft(slopeLen)),
    [slopeLen, thickness, length],
  )

  const slabs = [-1, 1].map((side) => {
    // Centre of the slope line, from ridge (0, ridge) to eave edge (side*run, ridge - run*tan).
    const cOff = (side * run) / 2
    const h = ridge - (run * Math.tan(pitch)) / 2
    // Push outward along the slope normal by half the thickness.
    const nx = side * Math.sin(pitch)
    const ny = Math.cos(pitch)
    const c = center + cOff + (nx * thickness) / 2
    const y = h + (ny * thickness) / 2
    return { side, c, y }
  })

  return (
    <group>
      {slabs.map(({ side, c, y }) =>
        ridgeAlong === 's' ? (
          <mesh
            key={side}
            position={[ft(c), ft(y), ft(mid)]}
            rotation={[0, 0, -side * pitch]}
            castShadow
            receiveShadow
          >
            <primitive object={geoS} attach="geometry" />
            <meshStandardMaterial {...mat} />
          </mesh>
        ) : (
          <mesh
            key={side}
            position={[ft(mid), ft(y), ft(c)]}
            rotation={[side * pitch, 0, 0]}
            castShadow
            receiveShadow
          >
            <primitive object={geoT} attach="geometry" />
            <meshStandardMaterial {...mat} />
          </mesh>
        ),
      )}
    </group>
  )
}
