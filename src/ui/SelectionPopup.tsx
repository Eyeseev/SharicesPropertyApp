'use client'

import type { GeometrySpec, Source } from '@/data/schema'
import { useApp } from '@/state/store'
import { EvidenceBadge } from './EvidenceBadge'

export function SelectionPopup({ spec, sources }: { spec: GeometrySpec; sources: Source[] }) {
  const selectedId = useApp((s) => s.selectedId)
  const select = useApp((s) => s.select)
  const obj = spec.objects.find((o) => o.id === selectedId)
  if (!obj) return null
  const srcName = (id: string) => sources.find((s) => s.id === id)?.name ?? id
  return (
    <section className="popup" role="dialog" aria-label={obj.label} data-object={obj.id}>
      <header className="popup-head">
        <h2>{obj.label}</h2>
        <EvidenceBadge status={obj.evidence} />
        <button className="popup-close" onClick={() => select(null)} aria-label="Close">
          ×
        </button>
      </header>
      <dl className="popup-facts">
        {obj.facts.map((f) => (
          <div key={f.label} className="fact">
            <dt>{f.label}</dt>
            <dd>
              {f.value} <EvidenceBadge status={f.evidence} compact />
            </dd>
          </div>
        ))}
      </dl>
      {obj.note && <p className="popup-note">{obj.note}</p>}
      <p className="popup-sources">
        Sources:{' '}
        {obj.sourceIds.map((id, i) => (
          <span key={id} title={srcName(id)} className="source-id">
            {id}
            {i < obj.sourceIds.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
    </section>
  )
}
