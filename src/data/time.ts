/**
 * Time model (TECHNICAL_ARCHITECTURE §7.3). Phase 0.3 uses `present` only; Phase 0.4 adds the
 * timeline UI on top without changing this function.
 *
 * A date range on `validFrom` / `validTo` means "it began (or ended) at some point inside the
 * range", so inside the bracket an element is `uncertain`, never silently on or off.
 */
import type { DateSpec, GeometryElement, GeometrySpec } from './schema'

export type Presence = 'active' | 'uncertain'
export type ResolvedElement = { element: GeometryElement; presence: Presence }
export type ResolvedState = {
  when: 'present' | string
  elements: ResolvedElement[]
  /** True before the earliest verified exterior imagery (Aug 2012): massing is present-day. */
  unverified: boolean
}

export const EARLIEST_VERIFIED_IMAGERY = '2012-08-01'

const low = (s: string) => (s.length === 4 ? `${s}-01-01` : s.length === 7 ? `${s}-01` : s)
const high = (s: string) => (s.length === 4 ? `${s}-12-31` : s.length === 7 ? `${s}-31` : s)

/** [earliest, latest] day a DateSpec can mean, as YYYY-MM-DD. */
export function bounds(d: DateSpec): [string, string] {
  if (d.exact) return [low(d.exact), high(d.exact)]
  return [low(d.from ?? d.to!), high(d.to ?? d.from!)]
}

function presenceAt(el: GeometryElement, day: string): Presence | null {
  if (el.validFrom) {
    const [f0, f1] = bounds(el.validFrom)
    if (day < f0) return null
    if (day <= f1) return 'uncertain'
  }
  if (el.validTo) {
    const [t0, t1] = bounds(el.validTo)
    if (day > t1) return null
    if (day >= t0) return 'uncertain'
  }
  return 'active'
}

export function resolveStateAt(spec: GeometrySpec, when: 'present' | string): ResolvedState {
  if (when === 'present') {
    return {
      when,
      elements: spec.elements.filter((e) => e.render).map((element) => ({ element, presence: 'active' })),
      unverified: false,
    }
  }
  const day = low(when)
  const elements: ResolvedElement[] = []
  for (const element of spec.elements) {
    const presence = presenceAt(element, day)
    if (presence) elements.push({ element, presence })
  }
  return { when, elements, unverified: day < EARLIEST_VERIFIED_IMAGERY }
}
