'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { SelectableId } from '@/data/schema'
import { objectRegistry } from './registry'

const HERO: SelectableId[] = ['house', 'roof', 'front-door', 'extension', 'chimney']
const box = new THREE.Box3()
const tmp = new THREE.Box3()
const corner = new THREE.Vector3()
const center = new THREE.Vector3()
const edge = new THREE.Vector3()
const camRight = new THREE.Vector3()

/**
 * Keeps the property the main attraction: any tree canopy that is nearer to the camera than the
 * house and overlaps the house on screen fades to a ghost, and returns when the view clears.
 */
export function CanopyFader() {
  const { scene, camera } = useThree()
  useFrame((_, dt) => {
    box.makeEmpty()
    for (const id of HERO) {
      const g = objectRegistry.get(id)
      if (g) box.union(tmp.setFromObject(g))
    }
    if (box.isEmpty()) return

    // Screen-space rectangle and nearest distance of the house.
    let x0 = Infinity,
      x1 = -Infinity,
      y0 = Infinity,
      y1 = -Infinity
    let houseNear = Infinity
    for (let i = 0; i < 8; i++) {
      corner.set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z,
      )
      houseNear = Math.min(houseNear, corner.distanceTo(camera.position))
      corner.project(camera)
      x0 = Math.min(x0, corner.x)
      x1 = Math.max(x1, corner.x)
      y0 = Math.min(y0, corner.y)
      y1 = Math.max(y1, corner.y)
    }
    camRight.setFromMatrixColumn(camera.matrixWorld, 0)

    scene.traverse((o) => {
      const radius = o.userData?.fadeRadius as number | undefined
      if (!radius) return
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      mesh.getWorldPosition(center)
      const nearer = center.distanceTo(camera.position) - radius < houseNear + radius
      edge.copy(center).addScaledVector(camRight, radius).project(camera)
      center.project(camera)
      const r = Math.abs(edge.x - center.x) * 1.1
      const overlaps =
        center.z < 1 &&
        center.x + r > x0 &&
        center.x - r < x1 &&
        center.y + r > y0 &&
        center.y - r < y1
      const goal = nearer && overlaps ? 0.15 : 1
      mat.opacity += (goal - mat.opacity) * Math.min(1, dt * 6)
      mat.depthWrite = mat.opacity > 0.95
      mesh.castShadow = mat.opacity > 0.5
    })
  })
  return null
}
