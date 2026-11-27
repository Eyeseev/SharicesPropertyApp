'use client'

import { signOut } from 'next-auth/react'
import { useApp, type Mode, type QualityTier } from '@/state/store'

const TABS: { id: Mode; label: string }[] = [
  { id: 'explorer', label: 'Property Explorer' },
  { id: 'financials', label: 'Financials' },
  { id: 'chronicle', label: 'Chronicle' },
  { id: 'photos', label: 'Photos' },
]

const TIERS: { id: QualityTier; label: string }[] = [
  { id: 'showcase', label: 'Showcase' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'simple', label: 'Simple' },
]

export function TopBar() {
  const quality = useApp((s) => s.quality)
  const setQuality = useApp((s) => s.setQuality)
  const mode = useApp((s) => s.mode)
  const setMode = useApp((s) => s.setMode)
  return (
    <header className="topbar">
      {/* Placeholder title: the final product name is still open. */}
      <div className="brand">Private Property Explorer</div>
      <nav className="tabs" aria-label="Modes">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${mode === t.id ? ' tab-active' : ''}`}
            aria-current={mode === t.id ? 'page' : undefined}
            onClick={() => setMode(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="topbar-right">
        <label className="quality">
          <span>Quality</span>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as QualityTier)}
            aria-label="Quality tier"
          >
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button className="link-btn" onClick={() => signOut({ callbackUrl: '/signin' })}>
          Sign out
        </button>
      </div>
    </header>
  )
}
