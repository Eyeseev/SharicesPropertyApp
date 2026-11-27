'use client'

import { useEffect } from 'react'
import { useApp } from '@/state/store'
import { CHRONICLE_TYPE_LABEL, dateLabel } from './format'
import { useData } from './DataContext'
import { Panel } from './Panel'
import { EvidenceBadge } from './EvidenceBadge'
import { InfoPopover } from './Provenance'

/** Simple chronological Chronicle: a dated list and the selected event with prev/next (mockup 03). */
export function ChroniclePanel() {
  const { chronicle, photos, conflicts } = useData()
  const chronicleId = useApp((s) => s.chronicleId)
  const setId = useApp((s) => s.setChronicleId)
  const setMode = useApp((s) => s.setMode)
  const setLightbox = useApp((s) => s.setLightbox)

  const index = Math.max(
    0,
    chronicle.findIndex((e) => e.id === chronicleId),
  )
  const event = chronicle[index]!
  useEffect(() => {
    if (!chronicleId) setId(chronicle.at(-1)?.id ?? null)
  }, [chronicleId, chronicle, setId])

  const go = (d: number) =>
    setId(chronicle[Math.min(chronicle.length - 1, Math.max(0, index + d))]!.id)
  const conflict = event.conflictId ? conflicts.find((c) => c.id === event.conflictId) : undefined
  const linked = photos.filter((p) => event.photoIds.includes(p.id))

  return (
    <Panel title="Chronicle" subtitle="What happened at this property, in date order">
      <section className="chron-detail" aria-live="polite" data-event={event.id}>
        <div className="chron-nav">
          <button
            className="chron-step"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous event"
          >
            ‹
          </button>
          <span className="chron-count">
            {index + 1} of {chronicle.length}
          </span>
          <button
            className="chron-step"
            onClick={() => go(1)}
            disabled={index === chronicle.length - 1}
            aria-label="Next event"
          >
            ›
          </button>
        </div>
        <h3>{event.title}</h3>
        <p className="chron-date">
          {dateLabel(event.date)}
          {event.date.approximate && !event.date.label && ' (approximate)'}
        </p>
        <p className="chron-meta">
          <span className="chron-type">{CHRONICLE_TYPE_LABEL[event.type]}</span>
          <EvidenceBadge status={event.evidence} compact />
          <InfoPopover p={event} label={event.title} />
        </p>
        <p className="chron-text">{event.detail}</p>
        {conflict && (
          <p className="chron-conflict">
            {conflict.status === 'resolved' ? 'Resolved conflict' : 'Open conflict'}:{' '}
            {conflict.topic}. See the ⓘ for both claims.
          </p>
        )}
        {linked.map((p) => (
          <button
            key={p.id}
            className="chron-photo"
            onClick={() => {
              setMode('photos')
              setLightbox(p.id)
            }}
          >
            View photo: {p.title}
          </button>
        ))}
      </section>

      <ol className="chron-list" aria-label="All events">
        {chronicle.map((e, i) => (
          <li key={e.id}>
            <button
              className={`chron-item${i === index ? ' chron-item-active' : ''}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setId(e.id)}
            >
              <span className="chron-item-date">{dateLabel(e.date)}</span>
              <span className="chron-item-title">{e.title}</span>
              <span
                className={`chron-imp chron-imp-${e.importance}`}
                title={`Importance ${e.importance} of 3`}
              />
            </button>
          </li>
        ))}
      </ol>
      <p className="chron-foot">
        Events before Aug 2012 are recorded facts with no verified appearance. Approximate dates are
        marked. Local neighbourhood events are not mixed in yet.
      </p>
    </Panel>
  )
}
