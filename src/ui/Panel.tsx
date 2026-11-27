'use client'

import type { ReactNode } from 'react'
import { useApp } from '@/state/store'

/** Floating, collapsible right-hand panel shell (mockups 02–04). */
export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const open = useApp((s) => s.panelOpen)
  const setOpen = useApp((s) => s.setPanelOpen)
  return (
    <aside className={`panel${open ? '' : ' panel-collapsed'}`} aria-label={title}>
      <header className="panel-head">
        <div>
          <h2>{title}</h2>
          {open && subtitle && <p className="panel-sub">{subtitle}</p>}
        </div>
        <button
          className="panel-toggle"
          aria-expanded={open}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          onClick={() => setOpen(!open)}
        >
          {open ? '⌃' : '⌄'}
        </button>
      </header>
      {open && <div className="panel-body">{children}</div>}
    </aside>
  )
}
