'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import type { CameraSet, GeometrySpec } from '@/data/schema'
import { useApp } from '@/state/store'
import { PropertyModel } from './PropertyModel'
import { CameraRig } from './CameraRig'
import { objectRegistry } from './registry'
import { installProbe } from './probe'
import { CanopyFader } from './CanopyFader'
import { QUALITY } from './style/quality'
import { HORIZON, Lights, Sky } from './style/Atmosphere'
import { GridGround } from './style/GridGround'
import { GlowLines } from './style/GlowLines'
import { Ambience } from './style/Ambience'
import { Particles } from './style/Particles'
import { Effects } from './style/Effects'

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
  const tier = useApp((s) => s.quality)
  const select = useApp((s) => s.select)
  const q = QUALITY[tier]
  return (
    <Canvas
      className="scene-canvas"
      shadows={q.shadows}
      dpr={q.dpr}
      camera={{ fov: 35, near: 0.1, far: 700, position: [-20, 20, -30] }}
      gl={{ antialias: !q.composer, preserveDrawingBuffer: true }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={[HORIZON]} />
      <fog attach="fog" args={[HORIZON, 90, 260]} />
      <Sky />
      <Lights q={q} />
      <GridGround q={q} />
      <Particles count={q.particles} />
      <PropertyModel spec={spec} />
      <GlowLines spec={spec} />
      <Ambience spec={spec} q={q} />
      <Highlight />
      <CameraRig cameras={cameras} spec={spec} />
      <CanopyFader />
      <Probe />
      <Effects q={q} />
    </Canvas>
  )
}
