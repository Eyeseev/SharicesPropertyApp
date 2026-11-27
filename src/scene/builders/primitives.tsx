'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { ft } from '@/data/frame'

export type Bounds = {
  sMin: number
  sMax: number
  tMin: number
  tMax: number
  hMin: number
  hMax: number
}

/** Axis-aligned box given in lot-frame feet (x = t, z = s, y = height). */
export function LotBox({
  b,
  color,
  opacity,
  castShadow = true,
  receiveShadow = true,
  name,
}: {
  b: Bounds
  color: string
  opacity?: number
  castShadow?: boolean
  receiveShadow?: boolean
  name?: string
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
  return (
    <mesh name={name} position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        transparent={opacity !== undefined}
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
}: {
  ridgeAlong: 's' | 't'
  from: number
  to: number
  center: number
  halfWidth: number
  eave: number
  ridge: number
  color: string
}) {
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
        <meshStandardMaterial color={color} roughness={0.9} />
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
      <meshStandardMaterial color={color} roughness={0.9} />
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
}) {
  const rise = ridge - eave
  const pitch = Math.atan2(rise, halfWidth)
  const run = halfWidth + overhang
  const slopeLen = run / Math.cos(pitch)
  const length = to - from
  const mid = (from + to) / 2

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
            <boxGeometry args={[ft(slopeLen), ft(thickness), ft(length)]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        ) : (
          <mesh
            key={side}
            position={[ft(mid), ft(y), ft(c)]}
            rotation={[side * pitch, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[ft(length), ft(thickness), ft(slopeLen)]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        ),
      )}
    </group>
  )
}
