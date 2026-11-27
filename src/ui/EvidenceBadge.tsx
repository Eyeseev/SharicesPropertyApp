import type { Evidence } from '@/data/schema'

export const EVIDENCE_LABEL: Record<Evidence, string> = {
  verified: 'Verified',
  observed: 'Observed',
  owner_provided: 'Owner-provided',
  estimated: 'Estimated',
  derived_approximate: 'Derived (approximate)',
  historical_approximation: 'Historical approximation',
  unknown: 'Unknown',
}

const HELP: Record<Evidence, string> = {
  verified: 'From an official record',
  observed: 'Seen in dated imagery',
  owner_provided: 'Provided by the owner',
  estimated: 'Estimate, not a measurement',
  derived_approximate: 'Calculated from records; position or value approximate',
  historical_approximation: 'Date range or reconstructed state',
  unknown: 'Not known',
}

export function EvidenceBadge({
  status,
  compact = false,
}: {
  status: Evidence
  compact?: boolean
}) {
  return (
    <span
      className={`badge badge-${status}${compact ? ' badge-compact' : ''}`}
      title={HELP[status]}
      data-evidence={status}
    >
      {EVIDENCE_LABEL[status]}
    </span>
  )
}
