'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Confidence, Evidence } from '@/data/schema'
import { EvidenceBadge } from './EvidenceBadge'
import { useData } from './DataContext'

export type Provenance = {
  evidence: Evidence
  confidence: Confidence
  sourceIds: string[]
  notes?: string
  conflictId?: string
}

/**
 * The ⓘ control next to every value: source, retrieval date, rights, confidence, notes and any
 * conflict (TECHNICAL_ARCHITECTURE §6). A value is never shown without its evidence badge.
 */
export function InfoPopover({ p, label }: { p: Provenance; label: string }) {
  const { sources, conflicts } = useData()
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])
  const conflict = p.conflictId ? conflicts.find((c) => c.id === p.conflictId) : undefined
  return (
    <span className="info-wrap" ref={ref}>
      <button
        type="button"
        className="info-btn"
        aria-label={`Source details for ${label}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        i
      </button>
      {open && (
        <div className="info-pop" id={id} role="dialog" aria-label={`Source details for ${label}`}>
          <p className="info-row">
            <EvidenceBadge status={p.evidence} />{' '}
            <span className="info-conf">{p.confidence} confidence</span>
          </p>
          <ul className="info-sources">
            {p.sourceIds.map((sid) => {
              const s = sources.find((x) => x.id === sid)
              return (
                <li key={sid}>
                  <span className="source-id">{sid}</span> {s ? s.name : 'Unknown source'}
                  {s && <span className="info-meta"> · retrieved {s.retrieved}</span>}
                  {s?.url && (
                    <>
                      {' '}
                      <a href={s.url} target="_blank" rel="noreferrer noopener">
                        link
                      </a>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
          {p.notes && <p className="info-notes">{p.notes}</p>}
          {conflict && (
            <div className="info-conflict">
              <strong>
                {conflict.status === 'resolved' ? 'Resolved conflict' : 'Open conflict'}:{' '}
                {conflict.topic}
              </strong>
              <ul>
                {conflict.statements.map((st, i) => (
                  <li key={i}>
                    {st.value} <span className="info-meta">({st.sourceId})</span>
                  </li>
                ))}
              </ul>
              <p>{conflict.notes}</p>
            </div>
          )}
        </div>
      )}
    </span>
  )
}

/** Evidence badge plus the ⓘ source popover. */
export function Provenanced({
  p,
  label,
  compact = true,
}: {
  p: Provenance
  label: string
  compact?: boolean
}) {
  return (
    <span className="prov">
      <EvidenceBadge status={p.evidence} compact={compact} />
      <InfoPopover p={p} label={label} />
    </span>
  )
}
