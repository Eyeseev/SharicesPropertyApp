'use client'

import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { GeometryElement, GeometrySpec, SelectableId } from '@/data/schema'
import { useApp } from '@/state/store'
import { num } from './params'
import { isGhost, objectRegistry } from './registry'
import {
  Chimney,
  ContextStrip,
  Extension,
  Fence,
  FrontDoor,
  Garage,
  Gate,
  HouseWalls,
  Parcel,
  RoofSection,
  ShrubRow,
  Slab,
  Tree,
  Window,
  useHouseFrame,
} from './builders/Property'

/** Find the selectable object a hit mesh belongs to by walking up the scene graph. */
function selectIdOf(obj: THREE.Object3D | null): SelectableId | null {
  let o: THREE.Object3D | null = obj
  while (o) {
    const id = o.userData?.selectId as SelectableId | undefined
    if (id) return id
    o = o.parent
  }
  return null
}

function Selectable({ id, children }: { id: SelectableId; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useEffect(() => {
    const g = ref.current
    if (!g) return
    objectRegistry.set(id, g)
    return () => {
      objectRegistry.delete(id)
    }
  }, [id])
  return (
    <group ref={ref} name={`object:${id}`} userData={{ selectId: id }}>
      {children}
    </group>
  )
}

export function PropertyModel({ spec }: { spec: GeometrySpec }) {
  const f = useHouseFrame(spec)
  const select = useApp((s) => s.select)
  const hover = useApp((s) => s.hover)

  const rendered = useMemo(() => spec.elements.filter((e) => e.render), [spec])
  const of = (pred: (e: GeometryElement) => boolean) => rendered.filter(pred)
  const inObject = (id: SelectableId) => of((e) => e.objectId === id)
  const el = (id: string) => {
    const e = rendered.find((x) => x.id === id)
    if (!e) throw new Error(`missing element ${id}`)
    return e
  }
  const platform = num(el('parcel'), 'platformThickness')

  // Nearest hit that is not a faded canopy decides what is under the pointer.
  const firstSolid = (e: ThreeEvent<MouseEvent | PointerEvent>) =>
    e.intersections.find((h) => !isGhost(h.object))?.object ?? null
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(selectIdOf(firstSolid(e)))
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hover(selectIdOf(firstSolid(e)))
  }

  return (
    <group onClick={onClick} onPointerMove={onMove} onPointerOut={() => hover(null)}>
      <Selectable id="parcel">
        <Parcel el={el('parcel')} />
      </Selectable>

      <Selectable id="house">
        <HouseWalls el={el('house-walls')} f={f} />
        {of((e) => e.kind === 'window').map((w) => (
          <Window key={w.id} el={w} f={f} />
        ))}
      </Selectable>

      <Selectable id="roof">
        {inObject('roof').map((r) => (
          <RoofSection key={r.id} el={r} f={f} />
        ))}
      </Selectable>

      <Selectable id="chimney">
        <Chimney el={el('chimney')} />
      </Selectable>

      <Selectable id="front-door">
        <FrontDoor
          door={el('front-door')}
          porch={el('front-porch')}
          steps={el('front-steps')}
          f={f}
        />
      </Selectable>

      <Selectable id="extension">
        <Extension el={el('extension')} />
      </Selectable>

      <Selectable id="garage">
        <Garage el={el('garage')} />
      </Selectable>

      <Selectable id="driveway">
        {inObject('driveway').map((d) => (
          <Slab key={d.id} el={d} />
        ))}
      </Selectable>

      <Selectable id="fence-front">
        {inObject('fence-front').map((fe) =>
          fe.kind === 'gate' ? <Gate key={fe.id} el={fe} /> : <Fence key={fe.id} el={fe} />,
        )}
      </Selectable>

      <Selectable id="fence-rear">
        <Fence el={el('fence-rear')} />
      </Selectable>

      <Selectable id="maple">
        <Tree el={el('maple')} />
      </Selectable>

      {/* Non-selectable: walkway, other trees, shrubs, context */}
      <Slab el={el('walkway')} />
      {of((e) => e.kind === 'tree' && e.objectId === undefined).map((t) => (
        <Tree key={t.id} el={t} />
      ))}
      {of((e) => e.kind === 'shrub-row').map((s) => (
        <ShrubRow key={s.id} el={s} />
      ))}
      {of((e) => e.kind === 'context').map((c) => (
        <ContextStrip key={c.id} el={c} platform={platform} />
      ))}
    </group>
  )
}
