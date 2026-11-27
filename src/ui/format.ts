import type { DateSpec } from '@/data/schema'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

function part(s: string): string {
  const [y, m, d] = s.split('-')
  if (!m) return y!
  const month = MONTHS[Number(m) - 1]!
  return d ? `${month} ${Number(d)}, ${y}` : `${month} ${y}`
}

/** Human date text. Ranges and approximate dates are always visibly marked. */
export function dateLabel(d: DateSpec): string {
  if (d.label) return d.label
  if (d.exact) return `${d.approximate ? 'c. ' : ''}${part(d.exact)}`
  if (d.from && d.to) return `${part(d.from)} to ${part(d.to)}`
  if (d.to) return `Before ${part(d.to)}`
  return `From ${part(d.from!)}`
}

/** A single sortable day for a DateSpec (start of range). */
export const sortKey = (d: DateSpec) => d.exact ?? d.from ?? d.to ?? ''

export const VIEWPOINT_LABEL: Record<string, string> = {
  front: 'Front (NW gable, 250th St)',
  side_139th: 'Side, 139th Ave',
  side_250th: 'Side, 250th St',
  rear: 'Rear',
  aerial: 'Aerial',
  other: 'Other',
}

export const CHRONICLE_TYPE_LABEL: Record<string, string> = {
  construction: 'Construction',
  transfer: 'Transfer',
  finance_record: 'Finance record',
  imagery: 'Imagery',
  exterior_change: 'Exterior change',
  addition: 'Addition',
  permit: 'Permit',
  damage: 'Damage',
  news: 'News',
  weather: 'Weather',
  context: 'Context',
}
