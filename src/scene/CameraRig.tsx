'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CameraControls } from '@react-three/drei'
import type { CameraSet, GeometrySpec } from '@/data/schema'
import { ft, lotToScene } from '@/data/frame'
import { useApp, type PresetId } from '@/state/store'
import { num } from './params'
import { cameraProbe } from './probe'
import { MIN_DISTANCE_FT, TARGET_BOX_FT } from './limits'

/**
 * Damped orbit/pan/zoom with limits: never below ground (polar limit), never inside the house
 * (target box + minimum distance) or the garage (collider), and never losing the property.
 */
export function CameraRig({ cameras, spec }: { cameras: CameraSet; spec: GeometrySpec }) {
  const ref = useRef<CameraControls>(null)
  const presetRequest = useApp((s) => s.presetRequest)
  const setMoving = useApp((s) => s.setCameraMoving)

  const presets = useMemo(() => {
    const m = new Map<PresetId, { pos: THREE.Vector3; target: THREE.Vector3 }>()
    for (const p of cameras.presets) {
      // Top view: nudge toward SE so "up" on screen is NW (long axis vertical).
      const [ps, pt, ph] =
        p.id === 'top' ? [p.position[0] + 0.5, p.position[1], p.position[2]] : p.position
      m.set(p.id, {
        pos: new THREE.Vector3(...lotToScene(ps, pt, ph)),
        target: new THREE.Vector3(...lotToScene(...p.target)),
      })
    }
    return m
  }, [cameras])

  // Only the garage is a collider: the target can never be inside it, so ray tests are reliable.
  // The house, porch and extension are kept out of reach by MIN_DISTANCE_FT instead.
  const colliders = useMemo(() => {
    const garage = spec.elements.find((e) => e.id === 'garage')
    if (!garage) return []
    const [sMin, sMax, tMin, tMax] = [
      num(garage, 'sMin') - 1,
      num(garage, 'sMax') + 1,
      num(garage, 'tMin') - 1,
      num(garage, 'tMax') + 1,
    ]
    const m = new THREE.Mesh(new THREE.BoxGeometry(ft(tMax - tMin), ft(13), ft(sMax - sMin)))
    m.position.set(ft((tMin + tMax) / 2), ft(6.5), ft((sMin + sMax) / 2))
    m.updateMatrixWorld()
    return [m]
  }, [spec])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.colliderMeshes = colliders
    c.setBoundary(
      new THREE.Box3(
        new THREE.Vector3(
          ...lotToScene(TARGET_BOX_FT.sMin, TARGET_BOX_FT.tMin, TARGET_BOX_FT.hMin),
        ),
        new THREE.Vector3(
          ...lotToScene(TARGET_BOX_FT.sMax, TARGET_BOX_FT.tMax, TARGET_BOX_FT.hMax),
        ),
      ),
    )
    c.boundaryFriction = 0.2
    const onStart = () => setMoving(true)
    const onRest = () => setMoving(false)
    c.addEventListener('controlstart', onStart)
    c.addEventListener('transitionstart', onStart)
    c.addEventListener('rest', onRest)
    cameraProbe.controls = c
    return () => {
      c.removeEventListener('controlstart', onStart)
      c.removeEventListener('transitionstart', onStart)
      c.removeEventListener('rest', onRest)
      cameraProbe.controls = null
    }
  }, [colliders, setMoving])

  useEffect(() => {
    const c = ref.current
    const p = presets.get(presetRequest.id)
    if (!c || !p) return
    const animate = presetRequest.n > 0
    setMoving(true)
    void c
      .setLookAt(p.pos.x, p.pos.y, p.pos.z, p.target.x, p.target.y, p.target.z, animate)
      .then(() => setMoving(false))
  }, [presetRequest, presets, setMoving])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.35}
      draggingSmoothTime={0.15}
      minDistance={ft(MIN_DISTANCE_FT)}
      maxDistance={ft(330)}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2 - 0.12}
    />
  )
}
