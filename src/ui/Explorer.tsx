'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { PropertyData } from '@/data/loader'
import { useApp, type PresetId } from '@/state/store'
import { TopBar } from './TopBar'
import { CameraRail } from './CameraRail'
import { SelectionPopup } from './SelectionPopup'

const Scene = dynamic(() => import('@/scene/Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => <div className="scene-loading">Loading the property…</div>,
})

const KEY_PRESETS: Record<string, PresetId> = {
  '1': 'front',
  '2': 'side',
  '3': 'rear',
  '4': 'top',
  '5': 'default',
}

export function Explorer() {
  const [data, setData] = useState<PropertyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const goTo = useApp((s) => s.goTo)
  const select = useApp((s) => s.select)

  useEffect(() => {
    let alive = true
    fetch('/api/data', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load property data (${r.status})`)
        return r.json() as Promise<PropertyData>
      })
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') select(null)
      const preset = KEY_PRESETS[e.key]
      if (preset) goTo(preset)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, select])

  return (
    <div className="app">
      <div className="scene-layer">
        {data && <Scene spec={data.geometry} cameras={data.cameras} />}
        {error && (
          <div className="scene-loading" role="alert">
            {error}
          </div>
        )}
      </div>
      <TopBar />
      {data && <CameraRail cameras={data.cameras} />}
      {data && <SelectionPopup spec={data.geometry} sources={data.sources} />}
    </div>
  )
}
