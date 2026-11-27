'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { GeometryElement, GeometrySpec } from '@/data/schema'
import { ft } from '@/data/frame'
import { color } from '../palette'
import { bool, byId, list, num, str } from '../params'
import { GablePrism, GableSlopes, LotBox, metricBox } from './primitives'
import { surfaceProps } from '../style/surfaces'
import { addWindSway, hashSeed, leafCluster } from '../style/vegetation'

type HouseFrame = {
  sMin: number
  sMax: number
  tMin: number
  tMax: number
  tCenter: number
  eave: number
  band: number
}

function houseFrame(elements: GeometryElement[]): HouseFrame {
  const h = byId(elements, 'house-walls')
  const width = num(h, 'width')
  const tCenter = num(h, 'tCenter')
  const sMin = num(h, 'sMin')
  return {
    sMin,
    sMax: sMin + num(h, 'length'),
    tMin: tCenter - width / 2,
    tMax: tCenter + width / 2,
    tCenter,
    eave: num(h, 'eaveHeight'),
    band: num(h, 'basementBandHeight'),
  }
}

export function HouseWalls({ el, f }: { el: GeometryElement; f: HouseFrame }) {
  return (
    <LotBox
      name="house-walls"
      b={{ sMin: f.sMin, sMax: f.sMax, tMin: f.tMin, tMax: f.tMax, hMin: 0, hMax: f.eave }}
      color={color(str(el, 'wallMaterial'))}
      surface="brick"
    />
  )
}

export function RoofSection({ el, f }: { el: GeometryElement; f: HouseFrame }) {
  const from = num(el, 'sMin')
  const to = num(el, 'sMax')
  const ridge = num(el, 'ridgeHeight')
  const overhang = num(el, 'overhang')
  const half = (f.tMax - f.tMin) / 2
  const isNW = from <= f.sMin
  const isSE = to >= f.sMax
  // Overhang the outer gable ends only.
  const slopeFrom = isNW ? from - overhang : from
  const slopeTo = isSE ? to + 0.5 : to
  const band = el.params.bandColor ? str(el, 'bandColor') : null
  return (
    <group>
      <GablePrism
        ridgeAlong="s"
        from={from}
        to={to}
        center={f.tCenter}
        halfWidth={half}
        eave={f.eave}
        ridge={ridge - 0.3}
        color={color(str(el, 'gableSiding'))}
        surface="siding"
      />
      <GableSlopes
        ridgeAlong="s"
        from={slopeFrom}
        to={slopeTo}
        center={f.tCenter}
        halfWidth={half}
        eave={f.eave}
        ridge={ridge - 0.35}
        overhang={overhang}
        color={color(str(el, 'color'))}
        surface="shingle"
      />
      {band && (
        <GableSlopes
          ridgeAlong="s"
          from={slopeTo - 0.9}
          to={slopeTo + 0.02}
          center={f.tCenter}
          halfWidth={half}
          eave={f.eave}
          ridge={ridge - 0.33}
          overhang={overhang + 0.02}
          thickness={0.38}
          color={color(band)}
        />
      )}
    </group>
  )
}

export function Chimney({ el }: { el: GeometryElement }) {
  const s = num(el, 's')
  const t = num(el, 't')
  const w = num(el, 'width')
  const d = num(el, 'depth')
  const top = num(el, 'topHeight')
  return (
    <group>
      <LotBox
        b={{
          sMin: s - d / 2,
          sMax: s + d / 2,
          tMin: t - w / 2,
          tMax: t + w / 2,
          hMin: 8,
          hMax: top,
        }}
        color={color('brick')}
        surface="brick"
      />
      <LotBox
        b={{
          sMin: s - d / 2 - 0.15,
          sMax: s + d / 2 + 0.15,
          tMin: t - w / 2 - 0.15,
          tMax: t + w / 2 + 0.15,
          hMin: top,
          hMax: top + 0.3,
        }}
        color={color('stone')}
      />
    </group>
  )
}

/** A rectangle on one house wall. `along` is s for sw/ne walls and t for the nw wall. */
function wallRect(
  f: HouseFrame,
  wall: string,
  along: number,
  width: number,
  h0: number,
  h1: number,
  inset: number,
) {
  switch (wall) {
    case 'sw':
      return {
        sMin: along - width / 2,
        sMax: along + width / 2,
        tMin: f.tMin - inset,
        tMax: f.tMin + 0.05,
        hMin: h0,
        hMax: h1,
      }
    case 'ne':
      return {
        sMin: along - width / 2,
        sMax: along + width / 2,
        tMin: f.tMax - 0.05,
        tMax: f.tMax + inset,
        hMin: h0,
        hMax: h1,
      }
    case 'nw':
      return {
        sMin: f.sMin - inset,
        sMax: f.sMin + 0.05,
        tMin: along - width / 2,
        tMax: along + width / 2,
        hMin: h0,
        hMax: h1,
      }
    default:
      throw new Error(`unsupported wall ${wall}`)
  }
}

export function Window({ el, f }: { el: GeometryElement; f: HouseFrame }) {
  const wall = str(el, 'wall')
  const along = num(el, 'along')
  const w = num(el, 'width')
  const h = num(el, 'height')
  const sill = num(el, 'sillHeight')
  const barred = bool(el, 'barred')
  const frame = wallRect(f, wall, along, w + 0.5, sill - 0.25, sill + h + 0.25, 0.12)
  const glass = wallRect(f, wall, along, w, sill, sill + h, 0.16)
  const bars = barred
    ? [-1, 0, 1].map((k) => wallRect(f, wall, along + (k * w) / 3.2, 0.1, sill, sill + h, 0.22))
    : []
  const muntin = !barred
    ? wallRect(f, wall, along, w, sill + h / 2 - 0.06, sill + h / 2 + 0.06, 0.2)
    : null
  return (
    <group>
      <LotBox b={frame} color={color('white')} castShadow={false} />
      <LotBox
        b={glass}
        color={color('glass')}
        castShadow={false}
        surface={barred ? undefined : 'windowWarm'}
      />
      {muntin && <LotBox b={muntin} color={color('white')} castShadow={false} />}
      {bars.map((b, i) => (
        <LotBox key={i} b={b} color={color('metal-black')} castShadow={false} />
      ))}
    </group>
  )
}

export function FrontDoor({
  door,
  porch,
  steps,
  f,
}: {
  door: GeometryElement
  porch: GeometryElement
  steps: GeometryElement
  f: HouseFrame
}) {
  const along = num(door, 'along')
  const w = num(door, 'width')
  const h = num(door, 'height')
  const sill = num(door, 'sillHeight')
  const arched = bool(door, 'arched')
  const r = w / 2
  const rectTop = arched ? sill + h - r : sill + h
  const surround = wallRect(f, 'nw', along, w + 1.2, sill, rectTop + 0.6, 0.15)
  const leaf = wallRect(f, 'nw', along, w, sill, rectTop, 0.22)

  const pw = num(porch, 'width')
  const pd = num(porch, 'depth')
  const pe = num(porch, 'eaveHeight')
  const pp = num(porch, 'peakHeight')

  const count = num(steps, 'count')
  const sw = num(steps, 'width')
  const run = num(steps, 'run')
  const rise = num(steps, 'rise')
  const treads = Array.from({ length: count }, (_, i) => {
    const depth = (run / count) * (count - i)
    return {
      sMin: f.sMin - depth,
      sMax: f.sMin,
      tMin: along - sw / 2,
      tMax: along + sw / 2,
      hMin: 0,
      hMax: (rise / count) * (i + 1),
    }
  })
  const railH = 3
  return (
    <group>
      <LotBox b={surround} color={color(str(door, 'surround'))} castShadow={false} />
      <LotBox b={leaf} color={color(str(door, 'color'))} castShadow={false} />
      {arched && (
        <mesh position={[ft(along), ft(rectTop), ft(f.sMin - 0.22)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[ft(r), ft(r), ft(0.3), 24, 1, false, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={color(str(door, 'color'))} roughness={0.6} />
        </mesh>
      )}
      {arched && (
        <mesh position={[ft(along), ft(rectTop - 0.6), ft(f.sMin - 0.4)]} scale={[1, 1.4, 0.2]}>
          <sphereGeometry args={[ft(0.5), 16, 12]} />
          <meshStandardMaterial
            color={color('glass')}
            roughness={0.2}
            emissive="#ffb347"
            emissiveIntensity={1.8}
          />
        </mesh>
      )}
      {/* Small projecting gable porch roof over the door */}
      <group position={[0, 0, 0]}>
        <GableSlopesAcross f={f} along={along} width={pw} depth={pd} eave={pe} peak={pp} />
      </group>
      {treads.map((b, i) => (
        <LotBox key={i} b={b} color={color(str(steps, 'color'))} surface="concrete" />
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <LotBox
            b={{
              sMin: f.sMin - run - 0.1,
              sMax: f.sMin - run + 0.1,
              tMin: along + side * (sw / 2) - 0.08,
              tMax: along + side * (sw / 2) + 0.08,
              hMin: 0,
              hMax: railH,
            }}
            color={color('metal-black')}
            castShadow={false}
          />
          <mesh
            position={[ft(along + side * (sw / 2)), ft(railH + rise / 2), ft(f.sMin - run / 2)]}
            rotation={[-Math.atan2(rise, run), 0, 0]}
          >
            <boxGeometry args={[ft(0.12), ft(0.12), ft(Math.hypot(run, rise))]} />
            <meshStandardMaterial color={color('metal-black')} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Porch gable: ridge perpendicular to the NW wall (along s), projecting NW from the wall. */
function GableSlopesAcross({
  f,
  along,
  width,
  depth,
  eave,
  peak,
}: {
  f: HouseFrame
  along: number
  width: number
  depth: number
  eave: number
  peak: number
}) {
  return (
    <group>
      <GablePrism
        ridgeAlong="s"
        from={f.sMin - depth}
        to={f.sMin}
        center={along}
        halfWidth={width / 2}
        eave={eave}
        ridge={peak - 0.2}
        color={color('white')}
      />
      <GableSlopes
        ridgeAlong="s"
        from={f.sMin - depth - 0.3}
        to={f.sMin}
        center={along}
        halfWidth={width / 2}
        eave={eave}
        ridge={peak - 0.25}
        overhang={0.5}
        color={color('shingle-dark')}
        thickness={0.25}
      />
    </group>
  )
}

export function Extension({ el }: { el: GeometryElement }) {
  const sMin = num(el, 'sMin')
  const sMax = num(el, 'sMax')
  const tMin = num(el, 'tMin')
  const tMax = num(el, 'tMax')
  const h = num(el, 'height')
  const pitch = (num(el, 'roofPitchDeg') * Math.PI) / 180
  const len = sMax - sMin + 0.6
  const drop = Math.tan(pitch) * len
  const tc = (tMin + tMax) / 2
  return (
    <group>
      <LotBox
        b={{ sMin, sMax, tMin, tMax, hMin: 0, hMax: h }}
        color={color(str(el, 'color'))}
        surface="siding"
      />
      {/* Low, light, single-slope roof falling toward the SE */}
      <mesh
        position={[ft(tc), ft(h + 0.2 - drop / 2 + 0.3), ft((sMin + sMax + 0.6) / 2)]}
        rotation={[pitch, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[ft(tMax - tMin + 1), ft(0.3), ft(len)]} />
        <meshStandardMaterial color={color('shingle-pale')} roughness={0.9} />
      </mesh>
      {/* One small window on the SE face (face estimated) */}
      <LotBox
        b={{
          sMin: sMax - 0.05,
          sMax: sMax + 0.15,
          tMin: tc - 1.2,
          tMax: tc + 1.2,
          hMin: 4.2,
          hMax: 6.4,
        }}
        color={color('glass')}
        castShadow={false}
        surface="windowWarm"
      />
      <LotBox
        b={{
          sMin: sMax - 0.05,
          sMax: sMax + 0.1,
          tMin: tc - 1.5,
          tMax: tc + 1.5,
          hMin: 3.9,
          hMax: 6.7,
        }}
        color={color('white')}
        castShadow={false}
      />
    </group>
  )
}

export function Garage({ el }: { el: GeometryElement }) {
  const sMin = num(el, 'sMin')
  const sMax = num(el, 'sMax')
  const tMin = num(el, 'tMin')
  const tMax = num(el, 'tMax')
  const ridge = num(el, 'ridgeHeight')
  const eave = num(el, 'eaveHeight')
  const dw = num(el, 'doorWidth')
  const dh = num(el, 'doorHeight')
  const sc = (sMin + sMax) / 2
  const half = (sMax - sMin) / 2
  const wall = color(str(el, 'wallColor'))
  return (
    <group>
      <LotBox b={{ sMin, sMax, tMin, tMax, hMin: 0, hMax: eave }} color={wall} surface="siding" />
      <GablePrism
        ridgeAlong="t"
        from={tMin}
        to={tMax}
        center={sc}
        halfWidth={half}
        eave={eave}
        ridge={ridge - 0.3}
        color={wall}
        surface="siding"
      />
      <GableSlopes
        ridgeAlong="t"
        from={tMin - 0.6}
        to={tMax + 0.6}
        center={sc}
        halfWidth={half}
        eave={eave}
        ridge={ridge - 0.3}
        overhang={0.6}
        color={color(str(el, 'roofColor'))}
        surface="shingleT"
      />
      {/* Single-car door on the SW end (door side derived, not confirmed) */}
      <LotBox
        b={{
          sMin: sc - dw / 2,
          sMax: sc + dw / 2,
          tMin: tMin - 0.12,
          tMax: tMin + 0.05,
          hMin: 0,
          hMax: dh,
        }}
        color="#e2e1dc"
        castShadow={false}
      />
      {[1, 2, 3].map((k) => (
        <LotBox
          key={k}
          b={{
            sMin: sc - dw / 2,
            sMax: sc + dw / 2,
            tMin: tMin - 0.16,
            tMax: tMin - 0.1,
            hMin: (dh / 4) * k - 0.04,
            hMax: (dh / 4) * k + 0.04,
          }}
          color="#c9c8c2"
          castShadow={false}
        />
      ))}
    </group>
  )
}

export function Slab({ el, h = 0.12 }: { el: GeometryElement; h?: number }) {
  return (
    <LotBox
      b={{
        sMin: num(el, 'sMin'),
        sMax: num(el, 'sMax'),
        tMin: num(el, 'tMin'),
        tMax: num(el, 'tMax'),
        hMin: 0,
        hMax: h,
      }}
      color={color(str(el, 'material'))}
      castShadow={false}
      surface="concrete"
    />
  )
}

function FencePanel({
  len,
  height,
  c,
  solid,
  pos,
  yaw,
}: {
  len: number
  height: number
  c: string
  solid: boolean
  pos: [number, number]
  yaw: number
}) {
  const geo = useMemo(
    () => metricBox(ft(len), ft(height * 0.95), ft(solid ? 0.12 : 0.03)),
    [len, height, solid],
  )
  // Chain-link: a wire-diamond alpha texture, so the lawn shows through the mesh.
  const mat = solid ? { color: c, roughness: 0.6 } : surfaceProps('chain', c)
  return (
    <mesh geometry={geo} position={[ft(pos[0]), ft(height / 2), ft(pos[1])]} rotation={[0, yaw, 0]}>
      <meshStandardMaterial {...mat} />
    </mesh>
  )
}

export function Fence({ el }: { el: GeometryElement }) {
  const pts = list(el, 'points')
  const height = num(el, 'height')
  const style = str(el, 'style')
  const c = color(style)
  const solid = style.startsWith('vinyl')
  const segments: { a: [number, number]; b: [number, number] }[] = []
  for (let i = 0; i + 3 < pts.length; i += 2) {
    segments.push({ a: [pts[i]!, pts[i + 1]!], b: [pts[i + 2]!, pts[i + 3]!] })
  }
  return (
    <group>
      {segments.map(({ a, b }, i) => {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1])
        const posts = Math.max(2, Math.ceil(len / 8) + 1)
        // Rotation about Y that maps local X onto the segment direction (scene x = t, z = s).
        const yaw = Math.atan2(-(b[0] - a[0]), b[1] - a[1])
        const ms = (a[0] + b[0]) / 2
        const mt = (a[1] + b[1]) / 2
        return (
          <group key={i}>
            {Array.from({ length: posts }, (_, k) => {
              const u = k / (posts - 1)
              const s = a[0] + (b[0] - a[0]) * u
              const t = a[1] + (b[1] - a[1]) * u
              return (
                <mesh key={k} position={[ft(t), ft(height / 2), ft(s)]} castShadow>
                  <cylinderGeometry args={[ft(0.12), ft(0.12), ft(height), 8]} />
                  <meshStandardMaterial color={c} roughness={0.5} />
                </mesh>
              )
            })}
            <FencePanel len={len} height={height} c={c} solid={solid} pos={[mt, ms]} yaw={yaw} />
            <mesh position={[ft(mt), ft(height), ft(ms)]} rotation={[0, yaw, 0]}>
              <boxGeometry args={[ft(len), ft(0.12), ft(0.12)]} />
              <meshStandardMaterial color={c} roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Gate({ el }: { el: GeometryElement }) {
  const s = num(el, 's')
  const t = num(el, 't')
  const w = num(el, 'width')
  const h = num(el, 'height')
  const c = color(str(el, 'style'))
  return (
    <group>
      <LotBox
        b={{ sMin: s - 0.08, sMax: s + 0.08, tMin: t - w / 2, tMax: t + w / 2, hMin: 0.2, hMax: h }}
        color={c}
        opacity={0.55}
        castShadow={false}
      />
      {[-1, 1].map((k) => (
        <LotBox
          key={k}
          b={{
            sMin: s - 0.15,
            sMax: s + 0.15,
            tMin: t + (k * w) / 2 - 0.15,
            tMax: t + (k * w) / 2 + 0.15,
            hMin: 0,
            hMax: h + 0.3,
          }}
          color={c}
        />
      ))}
    </group>
  )
}

const TONES: Record<string, [string, string, string]> = {
  maple: ['#d9473f', '#a52a2e', '#5c1522'],
  deciduous: ['#8fb15a', '#4f7a3c', '#233f2a'],
  shrub: ['#86b259', '#47733a', '#213d28'],
}

export function Tree({ el }: { el: GeometryElement }) {
  const s = num(el, 's')
  const t = num(el, 't')
  const h = num(el, 'height')
  const r = num(el, 'canopyRadius')
  const species = str(el, 'species')
  const isMaple = species.includes('maple')
  const trunkH = h - r * (isMaple ? 1.1 : 1.3)
  const canopy = useMemo(
    () =>
      leafCluster({
        seed: hashSeed(el.id),
        radius: ft(r),
        blobs: isMaple ? 9 : 8,
        squash: isMaple ? 0.7 : 0.85,
        tones: isMaple ? TONES.maple! : TONES.deciduous!,
      }),
    [el.id, r, isMaple],
  )
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      transparent: !isMaple,
      opacity: 1,
    })
    if (isMaple) {
      m.emissive = new THREE.Color('#4a0d10')
      m.emissiveIntensity = 0.55
    }
    addWindSway(m, isMaple ? 0.012 : 0.008)
    return m
  }, [isMaple])
  useEffect(() => () => material.dispose(), [material])
  // Large trees fade out while they stand between the camera and the house (CanopyFader).
  return (
    <group>
      <mesh position={[ft(t), ft(trunkH / 2), ft(s)]} castShadow>
        <cylinderGeometry
          args={[ft(isMaple ? 0.25 : 0.6), ft(isMaple ? 0.4 : 0.9), ft(trunkH), 8]}
        />
        <meshStandardMaterial color={color('trunk')} roughness={0.9} />
      </mesh>
      {[0, 1, 2].map((k) => {
        const a = (k / 3) * Math.PI * 2 + 0.6
        const spread = isMaple ? 1.2 : r * 0.12
        const limb = isMaple ? 3.2 : r * 0.55
        return (
          <mesh
            key={k}
            position={[
              ft(t + Math.cos(a) * spread),
              ft(trunkH + limb * 0.28),
              ft(s + Math.sin(a) * spread),
            ]}
            rotation={[Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55]}
            castShadow
          >
            <cylinderGeometry
              args={[ft(isMaple ? 0.08 : 0.22), ft(isMaple ? 0.16 : 0.4), ft(limb), 6]}
            />
            <meshStandardMaterial color={color('trunk')} roughness={0.9} />
          </mesh>
        )
      })}
      <mesh
        position={[ft(t), ft(h - r), ft(s)]}
        geometry={canopy}
        material={material}
        castShadow
        userData={isMaple ? undefined : { fadeRadius: ft(r) }}
      />
    </group>
  )
}

export function ShrubRow({ el }: { el: GeometryElement }) {
  const from = list(el, 'from')
  const to = list(el, 'to')
  const h = num(el, 'height')
  const len = Math.hypot(to[0]! - from[0]!, to[1]! - from[1]!)
  const n = Math.max(2, Math.round(len / 2.2))
  const geo = useMemo(
    () =>
      leafCluster({
        seed: hashSeed(el.id),
        radius: ft(h * 0.6),
        blobs: 4,
        squash: 0.85,
        tones: TONES.shrub!,
      }),
    [el.id, h],
  )
  return (
    <group>
      {Array.from({ length: n }, (_, k) => {
        const u = k / (n - 1)
        const s = from[0]! + (to[0]! - from[0]!) * u
        const t = from[1]! + (to[1]! - from[1]!) * u
        return (
          <mesh
            key={k}
            geometry={geo}
            position={[ft(t), ft(h / 2), ft(s)]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial vertexColors roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Parcel({ el }: { el: GeometryElement }) {
  const sMin = num(el, 'sMin')
  const sMax = num(el, 'sMax')
  const tMin = num(el, 'tMin')
  const tMax = num(el, 'tMax')
  const th = num(el, 'platformThickness')
  return (
    <group>
      <LotBox
        b={{ sMin, sMax, tMin, tMax, hMin: -th, hMax: -0.02 }}
        color={color('platform-side')}
        castShadow={false}
      />
      <LotBox
        b={{ sMin, sMax, tMin, tMax, hMin: -0.03, hMax: 0 }}
        color={color('lawn')}
        castShadow={false}
        surface="lawn"
      />
    </group>
  )
}

export function ContextStrip({ el, platform }: { el: GeometryElement; platform: number }) {
  return (
    <LotBox
      b={{
        sMin: num(el, 'sMin'),
        sMax: num(el, 'sMax'),
        tMin: num(el, 'tMin'),
        tMax: num(el, 'tMax'),
        hMin: -platform,
        hMax: -platform + 0.25,
      }}
      color={color(str(el, 'material'))}
      castShadow={false}
      surface="concrete"
    />
  )
}

export function useHouseFrame(spec: GeometrySpec) {
  return useMemo(() => houseFrame(spec.elements), [spec])
}
