'use client'

import * as THREE from 'three'
import type { GeometrySpec } from '@/data/schema'
import { ft } from '@/data/frame'
import { byId, num } from '../params'
import type { QualitySettings } from './quality'

/**
 * Stylistic night lighting: porch lanterns, path lights and light pools.
 * CREATIVE_DIRECTION §3.4: these are NOT documented fixtures of the property. They live here, not
 * in the geometry spec, and must never reach data, popups or the Chronicle.
 * Nothing here is raycast, so it can never block selecting the real objects.
 */
const BULB = new THREE.Color('#ffc46b').multiplyScalar(3)
const WARM = '#ffb45a'

let poolTexture: THREE.CanvasTexture | null = null
function pool() {
  if (poolTexture) return poolTexture
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,190,100,0.55)')
  grad.addColorStop(0.45, 'rgba(255,170,80,0.18)')
  grad.addColorStop(1, 'rgba(255,160,70,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  poolTexture = new THREE.CanvasTexture(c)
  poolTexture.colorSpace = THREE.SRGBColorSpace
  return poolTexture
}

function PathLight({
  s,
  t,
  h = 1.5,
  radius = 3.4,
}: {
  s: number
  t: number
  h?: number
  radius?: number
}) {
  return (
    <group position={[ft(t), 0, ft(s)]}>
      <mesh position={[0, ft(h / 2), 0]} raycast={() => null}>
        <cylinderGeometry args={[ft(0.07), ft(0.09), ft(h), 6]} />
        <meshStandardMaterial color="#1a1a1d" roughness={0.5} />
      </mesh>
      <mesh position={[0, ft(h + 0.12), 0]} raycast={() => null}>
        <sphereGeometry args={[ft(0.17), 12, 8]} />
        <meshBasicMaterial color={BULB} toneMapped={false} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ft(0.075), 0]}
        renderOrder={2}
        raycast={() => null}
      >
        <circleGeometry args={[ft(radius), 24]} />
        <meshBasicMaterial
          map={pool()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Lantern({ s, t, h }: { s: number; t: number; h: number }) {
  return (
    <group position={[ft(t), ft(h), ft(s)]}>
      <mesh raycast={() => null}>
        <boxGeometry args={[ft(0.5), ft(0.9), ft(0.5)]} />
        <meshBasicMaterial color={BULB} toneMapped={false} />
      </mesh>
      <mesh position={[0, ft(0.55), 0]} raycast={() => null}>
        <coneGeometry args={[ft(0.42), ft(0.35), 4]} />
        <meshStandardMaterial color="#17171a" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Ambience({ spec, q }: { spec: GeometrySpec; q: QualitySettings }) {
  const door = byId(spec.elements, 'front-door')
  const house = byId(spec.elements, 'house-walls')
  const along = num(door, 'along')
  const wallS = num(house, 'sMin')
  const lanternH = 6.9
  const path: [number, number][] = [
    [-45, 4.3],
    [-45, 9.9],
    [-39.5, 4.3],
    [-39.5, 9.9],
    [-46, -15],
    [-46, 23],
    [-18, -12],
    [0, -12],
    [14, -12],
    [-8, 23.2],
    [10, 23.2],
    [36, 5.6],
  ]
  return (
    <group>
      <Lantern s={wallS - 0.35} t={along - 2.9} h={lanternH} />
      <Lantern s={wallS - 0.35} t={along + 2.9} h={lanternH} />
      {path.map(([s, t]) => (
        <PathLight key={`${s},${t}`} s={s} t={t} />
      ))}
      {q.pointLights && (
        <>
          <pointLight
            position={[ft(along - 2.9), ft(lanternH - 0.6), ft(wallS - 1.6)]}
            color={WARM}
            intensity={5}
            distance={ft(22)}
            decay={2}
          />
          <pointLight
            position={[ft(along + 2.9), ft(lanternH - 0.6), ft(wallS - 1.6)]}
            color={WARM}
            intensity={5}
            distance={ft(22)}
            decay={2}
          />
        </>
      )}
    </group>
  )
}
