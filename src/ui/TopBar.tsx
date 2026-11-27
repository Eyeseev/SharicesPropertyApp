'use client'

import { signOut } from 'next-auth/react'
import { useApp, type QualityTier } from '@/state/store'

const TABS = [
  { id: 'explorer', label: 'Property Explorer', active: true },
  { id: 'financials', label: 'Financials', active: false },
  { id: 'chronicle', label: 'Chronicle', active: false },
  { id: 'photos', label: 'Photos', active: false },
]

const TIERS: { id: QualityTier; label: string }[] = [
  { id: 'showcase', label: 'Showcase' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'simple', label: 'Simple' },
]

export function TopBar() {
  const quality = useApp((s) => s.quality)
  const setQuality = useApp((s) => s.setQuality)
  return (
    <header className="topbar">
      {/* Placeholder title: the final product name is still open. */}
      <div className="brand">Private Property Explorer</div>
      <nav className="tabs" aria-label="Modes">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${t.active ? ' tab-active' : ''}`}
            aria-current={t.active ? 'page' : undefined}
            aria-disabled={!t.active || undefined}
            title={t.active ? undefined : 'Coming in a later phase'}
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
