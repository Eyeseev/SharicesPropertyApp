'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import type { CameraSet, GeometrySpec } from '@/data/schema'
import { ft } from '@/data/frame'
import { useApp } from '@/state/store'
import { PropertyModel } from './PropertyModel'
import { CameraRig } from './CameraRig'
import { objectRegistry } from './registry'
import { installProbe } from './probe'
import { CanopyFader } from './CanopyFader'

const DPR: Record<string, [number, number]> = {
  showcase: [1, 2],
  balanced: [1, 1.5],
  simple: [1, 1],
}

/** Bounding-box outline for the hovered (white) and selected (gold) objects. */
function Highlight() {
  const selectedId = useApp((s) => s.selectedId)
  const hoveredId = useApp((s) => s.hoveredId)
  const boxes = useMemo(() => {
    const out: { key: string; helper: THREE.Box3Helper }[] = []
    const add = (id: string | null, color: string) => {
      if (!id) return
      const g = objectRegistry.get(id as never)
      if (!g) return
      const box = new THREE.Box3().setFromObject(g)
      box.expandByScalar(0.08)
      out.push({ key: `${id}-${color}`, helper: new THREE.Box3Helper(box, new THREE.Color(color)) })
    }
    add(selectedId, '#e7c66b')
    if (hoveredId !== selectedId) add(hoveredId, '#ffffff')
    return out
  }, [selectedId, hoveredId])
  return (
    <>
      {boxes.map(({ key, helper }) => (
        <primitive key={key} object={helper} raycast={() => null} />
      ))}
    </>
  )
}

function Probe() {
  const { camera, scene, gl } = useThree()
  useEffect(() => installProbe({ camera, scene, canvas: gl.domElement }), [camera, scene, gl])
  return null
}

export function Scene({ spec, cameras }: { spec: GeometrySpec; cameras: CameraSet }) {
  const quality = useApp((s) => s.quality)
  const select = useApp((s) => s.select)
  const shadows = quality !== 'simple'
  return (
    <Canvas
      className="scene-canvas"
      shadows={shadows}
      dpr={DPR[quality]}
      camera={{ fov: 35, near: 0.1, far: 600, position: [-20, 20, -30] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#1d2533']} />
      <fog attach="fog" args={['#1d2533', 90, 220]} />
      <hemisphereLight args={['#dfe6f2', '#3a3f48', 0.9]} />
      <directionalLight
        position={[-25, 40, -18]}
        intensity={1.6}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0004}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -ft(0.62), 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#3a4352" roughness={1} />
      </mesh>
      <PropertyModel spec={spec} />
      <Highlight />
      <CameraRig cameras={cameras} spec={spec} />
      <CanopyFader />
      <Probe />
    </Canvas>
  )
}
