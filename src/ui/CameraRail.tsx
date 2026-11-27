'use client'

import type { CameraSet } from '@/data/schema'
import { useApp, type PresetId } from '@/state/store'

const ORDER: { id: PresetId; key: string }[] = [
  { id: 'front', key: '1' },
  { id: 'side', key: '2' },
  { id: 'rear', key: '3' },
  { id: 'top', key: '4' },
  { id: 'default', key: '5' },
]

export function CameraRail({ cameras }: { cameras: CameraSet }) {
  const goTo = useApp((s) => s.goTo)
  return (
    <nav className="camera-rail" aria-label="Camera presets">
      {ORDER.map(({ id, key }) => {
        const p = cameras.presets.find((c) => c.id === id)
        if (!p) return null
        return (
          <button
            key={id}
            className={`rail-btn${id === 'default' ? ' rail-reset' : ''}`}
            onClick={() => goTo(id)}
            title={`${p.note} (key ${key})`}
            data-preset={id}
          >
            {p.label}
            <kbd>{key}</kbd>
          </button>
        )
      })}
    </nav>
  )
}
