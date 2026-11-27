'use client'

import type { Fact } from '@/data/schema'
import { useApp } from '@/state/store'
import { useData } from './DataContext'
import { EvidenceBadge } from './EvidenceBadge'
import { InfoPopover } from './Provenance'

const GROUPS: { id: Fact['category']; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'parcel', label: 'Parcel' },
  { id: 'building', label: 'Building' },
  { id: 'environment', label: 'Environment' },
  { id: 'context', label: 'Local context' },
]

/** Left "i" tab: property characteristics, with every unknown and open conflict visible. */
export function InfoDrawer() {
  const { facts, conflicts } = useData()
  const open = useApp((s) => s.infoOpen)
  const setOpen = useApp((s) => s.setInfoOpen)
  const openConflicts = conflicts.filter((c) => c.status === 'unresolved')
  return (
    <>
      <button
        className="info-tab"
        aria-expanded={open}
        aria-controls="info-drawer"
        aria-label={open ? 'Close property information' : 'Open property information'}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden>ⓘ</span> <span aria-hidden>{open ? '‹' : '›'}</span>
      </button>
      {open && (
        <aside className="drawer" id="info-drawer" aria-label="Property information">
          <header className="drawer-head">
            <h2>Property information</h2>
            <button className="popup-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </header>
          <div className="drawer-body">
            {GROUPS.map((g) => (
              <section key={g.id}>
                <h3>{g.label}</h3>
                <dl className="drawer-facts">
                  {facts
                    .filter((f) => f.category === g.id)
                    .map((f) => (
                      <div key={f.id} className="drawer-fact" data-fact={f.id}>
                        <dt>{f.field}</dt>
                        <dd>
                          {f.value ?? <span className="fin-unknown">Unknown</span>}{' '}
                          <EvidenceBadge status={f.evidence} compact />{' '}
                          <InfoPopover p={f} label={f.field} />
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            ))}
            {openConflicts.length > 0 && (
              <section>
                <h3>Open questions</h3>
                <ul className="drawer-conflicts">
                  {openConflicts.map((c) => (
                    <li key={c.id}>
                      <strong>{c.topic}</strong>
                      <br />
                      <span className="info-meta">{c.notes}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>
      )}
    </>
  )
}
