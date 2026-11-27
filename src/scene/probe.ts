/**
 * Development/test probe. Exposes read-only scene facts on `window.__propertyScene` so Playwright
 * can find a real on-screen pixel for each object and click it through the normal raycast path.
 * Never installed in production builds.
 */
import * as THREE from 'three'
import type { CameraControls } from '@react-three/drei'
import type { SelectableId } from '@/data/schema'
import { isGhost, objectRegistry } from './registry'
import { useApp } from '@/state/store'

export const cameraProbe: { controls: CameraControls | null } = { controls: null }

type Ctx = { camera: THREE.Camera; scene: THREE.Scene; canvas: HTMLCanvasElement }

function selectIdOf(obj: THREE.Object3D | null): string | null {
  let o: THREE.Object3D | null = obj
  while (o) {
    if (o.userData?.selectId) return o.userData.selectId as string
    o = o.parent
  }
  return null
}

export function installProbe(ctx: Ctx) {
  if (process.env.NODE_ENV === 'production') return () => {}
  const raycaster = new THREE.Raycaster()
  const api = {
    ready: true,
    ids: () => [...objectRegistry.keys()],
    state: () => {
      const s = useApp.getState()
      return { selectedId: s.selectedId, hoveredId: s.hoveredId, cameraMoving: s.cameraMoving }
    },
    camera: () => {
      const c = cameraProbe.controls
      const p = new THREE.Vector3()
      const t = new THREE.Vector3()
      c?.getPosition(p)
      c?.getTarget(t)
      return { position: p.toArray(), target: t.toArray() }
    },
    /** A canvas-relative CSS pixel where a ray hits `id` first, or null if it is not visible. */
    findClickablePoint: (id: SelectableId) => {
      const group = objectRegistry.get(id)
      if (!group) return null
      ctx.scene.updateMatrixWorld()
      const candidates: THREE.Vector3[] = []
      group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        const box = new THREE.Box3().setFromObject(mesh)
        const c = box.getCenter(new THREE.Vector3())
        candidates.push(c)
        const pos = mesh.geometry.getAttribute('position')
        const step = Math.max(1, Math.floor(pos.count / 24))
        for (let i = 0; i < pos.count; i += step) {
          const v = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
          candidates.push(v.lerp(c, 0.2))
        }
      })
      const rect = ctx.canvas.getBoundingClientRect()
      const firstHitId = (x: number, y: number) => {
        raycaster.setFromCamera(new THREE.Vector2(x, y), ctx.camera)
        const hit = raycaster
          .intersectObjects(ctx.scene.children, true)
          .find((h) => (h.object as THREE.Mesh).isMesh && !isGhost(h.object))
        return hit ? selectIdOf(hit.object) : null
      }
      // Require a 4 px margin so sub-pixel rounding of the real click cannot land on a neighbour.
      const dx = (4 / rect.width) * 2
      const dy = (4 / rect.height) * 2
      for (const world of candidates) {
        const ndc = world.clone().project(ctx.camera)
        if (Math.abs(ndc.x) > 0.95 || Math.abs(ndc.y) > 0.95 || ndc.z > 1) continue
        const around = [
          [0, 0],
          [dx, 0],
          [-dx, 0],
          [0, dy],
          [0, -dy],
        ]
        if (around.every(([ox, oy]) => firstHitId(ndc.x + ox!, ndc.y + oy!) === id)) {
          return {
            x: rect.left + ((ndc.x + 1) / 2) * rect.width,
            y: rect.top + ((1 - ndc.y) / 2) * rect.height,
          }
        }
      }
      return null
    },
  }
  ;(window as unknown as { __propertyScene?: typeof api }).__propertyScene = api
  return () => {
    delete (window as unknown as { __propertyScene?: typeof api }).__propertyScene
  }
}
