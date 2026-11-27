import type * as THREE from 'three'
import type { SelectableId } from '@/data/schema'

/** Live map of selectable object groups (used for highlight and the dev/test probe). */
export const objectRegistry = new Map<SelectableId, THREE.Group>()

/** A faded tree canopy: transparent to clicks so it never blocks selecting the property. */
export function isGhost(o: THREE.Object3D): boolean {
  if (!o.userData?.fadeRadius) return false
  const m = (o as THREE.Mesh).material as THREE.Material | undefined
  return (m?.opacity ?? 1) < 0.6
}
