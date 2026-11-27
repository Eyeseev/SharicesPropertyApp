'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { GeometrySpec } from '@/data/schema'
import { ft } from '@/data/frame'
import { byId, num } from '../params'

/** HDR gold: values above 1 cross the bloom threshold, so only these lines glow. */
const GOLD = new THREE.Color('#ffc85a').multiplyScalar(2.4)
const GOLD_SOFT = new THREE.Color('#ffc85a').multiplyScalar(1.5)

type P = [number, number] // [s, t] in lot feet

function Segment({ a, b, y, w, color }: { a: P; b: P; y: number; w: number; color: THREE.Color }) {
  // All glow lines run along the lot axes, so each segment is an axis-aligned thin box.
  const s0 = Math.min(a[0], b[0])
  const s1 = Math.max(a[0], b[0])
  const t0 = Math.min(a[1], b[1])
  const t1 = Math.max(a[1], b[1])
  const lenS = Math.max(s1 - s0, w)
  const lenT = Math.max(t1 - t0, w)
  return (
    <mesh position={[ft((t0 + t1) / 2), ft(y), ft((s0 + s1) / 2)]} raycast={() => null}>
      <boxGeometry args={[ft(lenT), ft(w * 0.6), ft(lenS)]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function Polyline({ pts, y, w, color }: { pts: P[]; y: number; w: number; color: THREE.Color }) {
  return (
    <>
      {pts.slice(1).map((p, i) => (
        <Segment key={i} a={pts[i]!} b={p} y={y} w={w} color={color} />
      ))}
    </>
  )
}

/** A slim glowing marker post with a ring on top (digital augmentation, not a property fixture). */
function MarkerPost({ s, t, h = 7 }: { s: number; t: number; h?: number }) {
  return (
    <group position={[ft(t), 0, ft(s)]} raycast={() => null}>
      <mesh position={[0, ft(h / 2), 0]} raycast={() => null}>
        <cylinderGeometry args={[ft(0.09), ft(0.09), ft(h), 8]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <mesh position={[0, ft(h), 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <torusGeometry args={[ft(0.5), ft(0.1), 8, 24]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * The glowing parcel boundary and sidewalk curb (CREATIVE_DIRECTION §3.1), derived from the
 * verified lot extents and the generic sidewalk strips. Pure styling: not a property record.
 */
export function GlowLines({ spec }: { spec: GeometrySpec }) {
  const g = useMemo(() => {
    const parcel = byId(spec.elements, 'parcel')
    const a = byId(spec.elements, 'context-sidewalk-250th')
    const b = byId(spec.elements, 'context-sidewalk-139th')
    const plat = num(parcel, 'platformThickness')
    const lot = {
      s0: num(parcel, 'sMin'),
      s1: num(parcel, 'sMax'),
      t0: num(parcel, 'tMin'),
      t1: num(parcel, 'tMax'),
    }
    const curbY = -plat + 0.27
    const outer: P[] = [
      [num(b, 'sMax'), num(b, 'tMin')],
      [num(a, 'sMin'), num(a, 'tMin')],
      [num(a, 'sMin'), num(a, 'tMax')],
      [num(a, 'sMax'), num(a, 'tMax')],
    ]
    const rect: P[] = [
      [lot.s0, lot.t0],
      [lot.s0, lot.t1],
      [lot.s1, lot.t1],
      [lot.s1, lot.t0],
      [lot.s0, lot.t0],
    ]
    return { curbY, outer, rect }
  }, [spec])
  const o = g.outer
  return (
    <group>
      <Polyline pts={g.outer} y={g.curbY} w={0.55} color={GOLD} />
      <Polyline pts={g.rect} y={0.05} w={0.22} color={GOLD_SOFT} />
      <MarkerPost s={o[0]![0]} t={o[0]![1]} />
      <MarkerPost s={o[1]![0]} t={o[1]![1]} h={8} />
      <MarkerPost s={o[3]![0]} t={o[3]![1]} />
    </group>
  )
}
