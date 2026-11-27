'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Photo } from '@/data/schema'
import { useApp } from '@/state/store'
import { VIEWPOINT_LABEL, dateLabel, sortKey } from './format'
import { useData } from './DataContext'
import { Panel } from './Panel'

const ERAS: { id: string; label: string; test: (year: number) => boolean }[] = [
  { id: 'all', label: 'All dates', test: () => true },
  { id: 'pre1960', label: 'Before 1960', test: (y) => y < 1960 },
  { id: '1960-2009', label: '1960 – 2009', test: (y) => y >= 1960 && y < 2010 },
  { id: '2010+', label: '2010 and later', test: (y) => y >= 2010 },
]

const year = (p: Photo) => Number(sortKey(p.date).slice(0, 4))
export const photoSrc = (p: Photo) => (p.storage === 'stored' ? `/api/photos/${p.id}` : null)

function Thumb({ p, onOpen }: { p: Photo; onOpen: () => void }) {
  const src = photoSrc(p)
  if (!src) {
    return (
      <div className="photo-thumb photo-thumb-link" aria-label={`${p.title}: link only`}>
        <span>Link only</span>
        <small>Opens at the source. Not stored or embedded.</small>
      </div>
    )
  }
  return (
    <button className="photo-thumb" onClick={onOpen} aria-label={`Enlarge ${p.title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${p.title}: ${p.caption ?? ''}`} loading="lazy" />
      <span className="photo-expand" aria-hidden>
        ⤢
      </span>
    </button>
  )
}

function Lightbox({ photos }: { photos: Photo[] }) {
  const id = useApp((s) => s.lightboxId)
  const setLightbox = useApp((s) => s.setLightbox)
  const stored = photos.filter((p) => p.storage === 'stored')
  const index = stored.findIndex((p) => p.id === id)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (index < 0) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setLightbox(null)
      } else if (e.key === 'ArrowRight')
        setLightbox(stored[Math.min(stored.length - 1, index + 1)]!.id)
      else if (e.key === 'ArrowLeft') setLightbox(stored[Math.max(0, index - 1)]!.id)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [index, stored, setLightbox])
  if (index < 0) return null
  const p = stored[index]!
  // Portal: the panel's backdrop-filter would otherwise trap position:fixed inside the panel.
  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
      onClick={() => setLightbox(null)}
    >
      <figure onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoSrc(p)!} alt={`${p.title}: ${p.caption ?? ''}`} />
        <figcaption>
          <strong>{p.title}</strong> · {dateLabel(p.date)} · {VIEWPOINT_LABEL[p.viewpoint]}
          <br />
          {p.caption}
          <br />
          <small>{p.credit}</small>
        </figcaption>
      </figure>
      <button
        ref={closeRef}
        className="lightbox-close"
        aria-label="Close enlarged photo"
        onClick={(e) => {
          e.stopPropagation()
          setLightbox(null)
        }}
      >
        ×
      </button>
      <div className="lightbox-nav" onClick={(e) => e.stopPropagation()}>
        <button
          disabled={index === 0}
          onClick={() => setLightbox(stored[index - 1]!.id)}
          aria-label="Previous photo"
        >
          ‹
        </button>
        <span>
          {index + 1} of {stored.length}
        </span>
        <button
          disabled={index === stored.length - 1}
          onClick={() => setLightbox(stored[index + 1]!.id)}
          aria-label="Next photo"
        >
          ›
        </button>
      </div>
    </div>,
    document.body,
  )
}

/** Toggleable photo sidebar: filters, nearest-date indicator, cards, enlargement (mockup 04). */
export function PhotosPanel() {
  const { photos, sources } = useData()
  const setLightbox = useApp((s) => s.setLightbox)
  const [era, setEra] = useState('all')
  const [viewpoint, setViewpoint] = useState('all')

  const sorted = useMemo(
    () => [...photos].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date))),
    [photos],
  )
  const eraDef = ERAS.find((e) => e.id === era)!
  const shown = sorted.filter(
    (p) => eraDef.test(year(p)) && (viewpoint === 'all' || p.viewpoint === viewpoint),
  )
  const viewpoints = [...new Set(photos.map((p) => p.viewpoint))]
  // The model shows the present day, so the nearest available photo is the most recent one.
  const nearest = sorted[0]
  const sourceName = (id: string) => sources.find((s) => s.id === id)?.name ?? id

  return (
    <Panel title="Photo Archive" subtitle="Property photographs by date and viewpoint">
      <div className="photo-filters">
        <label>
          <span className="sr-only">Date</span>
          <select value={era} onChange={(e) => setEra(e.target.value)} aria-label="Filter by date">
            {ERAS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Viewpoint</span>
          <select
            value={viewpoint}
            onChange={(e) => setViewpoint(e.target.value)}
            aria-label="Filter by viewpoint"
          >
            <option value="all">All viewpoints</option>
            {viewpoints.map((v) => (
              <option key={v} value={v}>
                {VIEWPOINT_LABEL[v]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {nearest && (
        <p className="photo-nearest">
          Nearest to today: <strong>{dateLabel(nearest.date)}</strong>
        </p>
      )}

      {shown.length === 0 ? (
        <div className="photo-empty" data-testid="photo-empty">
          Photo not yet available for this selection.
        </div>
      ) : (
        <ul className="photo-list">
          {shown.map((p) => (
            <li key={p.id} className="photo-card" data-photo={p.id}>
              <Thumb p={p} onOpen={() => setLightbox(p.id)} />
              <div className="photo-info">
                <h3>{dateLabel(p.date)}</h3>
                <p>{p.title}</p>
                <p className="photo-meta">Viewpoint: {VIEWPOINT_LABEL[p.viewpoint]}</p>
                <p className="photo-meta">Source: {sourceName(p.sourceId)}</p>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer noopener">
                    Reference link ↗
                  </a>
                ) : (
                  <button className="photo-open" onClick={() => setLightbox(p.id)}>
                    Expand photo
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="photo-foot">
        Photographs come from public and historical records. Owner photos are not added yet. Street
        View and the 1940s photo open at their sources.
      </p>
      <Lightbox photos={photos} />
    </Panel>
  )
}
