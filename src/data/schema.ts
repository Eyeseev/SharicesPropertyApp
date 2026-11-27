import { z } from 'zod'

/**
 * How we know a value. Shown to the user as a badge on every value.
 * `reported` = a government figure relayed by a secondary source (not yet checked at the source).
 */
export const Evidence = z.enum([
  'verified',
  'observed',
  'owner_provided',
  'reported',
  'estimated',
  'derived_approximate',
  'historical_approximation',
  'unknown',
])
export type Evidence = z.infer<typeof Evidence>

export const SourceType = z.enum(['official', 'secondary', 'imagery', 'avm', 'context', 'owner'])
export const Rights = z.enum(['usable_data', 'link_only', 'owner_permitted', 'unknown'])

export const Source = z.object({
  id: z.string().regex(/^S\d+$/),
  name: z.string().min(1),
  type: SourceType,
  url: z.string().optional(),
  retrieved: z.string(),
  rights: Rights,
  established: z.string().min(1),
})
export type Source = z.infer<typeof Source>

const DatePart = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/)

export const DateSpec = z
  .object({
    exact: DatePart.optional(),
    from: DatePart.optional(),
    to: DatePart.optional(),
    label: z.string().optional(),
    approximate: z.boolean(),
  })
  .refine((d) => d.exact !== undefined || d.from !== undefined || d.to !== undefined, {
    message: 'DateSpec needs exact, from or to',
  })
  .refine((d) => !(d.from && d.to) || d.from <= d.to, { message: 'DateSpec from > to' })
export type DateSpec = z.infer<typeof DateSpec>

/** One numeric/text parameter of a geometry element, with its own evidence. */
export const Param = z.object({
  value: z.union([z.number(), z.string(), z.boolean(), z.array(z.number())]),
  unit: z.string().optional(),
  evidence: Evidence,
  note: z.string().optional(),
})
export type Param = z.infer<typeof Param>

export const GeometryKind = z.enum([
  'parcel',
  'house',
  'roof-section',
  'chimney',
  'door',
  'porch',
  'steps',
  'window',
  'extension',
  'garage',
  'slab',
  'fence',
  'gate',
  'tree',
  'shrub-row',
  'context',
])
export type GeometryKind = z.infer<typeof GeometryKind>

export const SELECTABLE_IDS = [
  'house',
  'roof',
  'chimney',
  'front-door',
  'extension',
  'garage',
  'driveway',
  'fence-front',
  'fence-rear',
  'maple',
  'parcel',
] as const
export const SelectableId = z.enum(SELECTABLE_IDS)
export type SelectableId = z.infer<typeof SelectableId>

export const GeometryElement = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: GeometryKind,
  /** Selectable object this element belongs to (several elements can share one). */
  objectId: SelectableId.optional(),
  params: z.record(z.string(), Param),
  evidence: Evidence,
  sourceIds: z.array(z.string()),
  notes: z.string().min(1),
  validFrom: DateSpec.optional(),
  validTo: DateSpec.optional(),
  variantOf: z.string().optional(),
  /** false = kept in the spec (e.g. a dated variant) but not drawn. */
  render: z.boolean().default(true),
})
export type GeometryElement = z.infer<typeof GeometryElement>

export const ObjectFact = z.object({
  label: z.string(),
  value: z.string(),
  evidence: Evidence,
})

export const SelectableObject = z.object({
  id: SelectableId,
  label: z.string(),
  evidence: Evidence,
  sourceIds: z.array(z.string()),
  facts: z.array(ObjectFact),
  note: z.string().optional(),
})
export type SelectableObject = z.infer<typeof SelectableObject>

export const GeometrySpec = z.object({
  version: z.number(),
  units: z.literal('ft'),
  frame: z.object({
    originLat: z.number(),
    originLon: z.number(),
    longAxisBearingDeg: z.number(),
    note: z.string(),
  }),
  objects: z.array(SelectableObject),
  elements: z.array(GeometryElement),
})
export type GeometrySpec = z.infer<typeof GeometrySpec>

const Vec3 = z.tuple([z.number(), z.number(), z.number()])

/** Camera preset in the lot frame: [s, t, height] in feet. */
export const CameraPreset = z.object({
  id: z.enum(['default', 'front', 'side', 'rear', 'top']),
  label: z.string(),
  position: Vec3,
  target: Vec3,
  note: z.string(),
})
export type CameraPreset = z.infer<typeof CameraPreset>

export const CameraSet = z.object({
  units: z.literal('ft'),
  frame: z.literal('lot: [s toward SE, t toward NE, height]'),
  presets: z.array(CameraPreset),
})
export type CameraSet = z.infer<typeof CameraSet>

export const FootprintRecord = z.object({
  id: z.string(),
  bin: z.string(),
  role: z.string(),
  heightRoofFt: z.number(),
  groundElevationFt: z.number(),
  /** Corners in the lot frame, feet: [s, t]. */
  cornersLot: z.array(z.tuple([z.number(), z.number()])),
  extents: z.object({ sMin: z.number(), sMax: z.number(), tMin: z.number(), tMax: z.number() }),
  sidesFt: z.array(z.number()),
  evidence: Evidence,
  sourceIds: z.array(z.string()),
})
export type FootprintRecord = z.infer<typeof FootprintRecord>

export const Footprints = z.object({
  generatedFrom: z.string(),
  frame: z.object({ originLat: z.number(), originLon: z.number(), longAxisBearingDeg: z.number() }),
  footprints: z.array(FootprintRecord),
})
export type Footprints = z.infer<typeof Footprints>

// ---------------------------------------------------------------------------------------------
// Phase 0.3: living database (TECHNICAL_ARCHITECTURE §7.2)
// ---------------------------------------------------------------------------------------------

export const Confidence = z.enum(['high', 'medium', 'low'])
export type Confidence = z.infer<typeof Confidence>

const Id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/)
const SourceIds = z.array(z.string().regex(/^S\d+$/)).min(1)

export const Fact = z.object({
  id: Id,
  category: z.enum(['identity', 'parcel', 'building', 'environment', 'context']),
  field: z.string().min(1),
  /** Text shown to the user. `null` means the value is unknown (shown as "Unknown"). */
  value: z.string().nullable(),
  unit: z.string().optional(),
  effective: DateSpec.optional(),
  evidence: Evidence,
  confidence: Confidence,
  sourceIds: SourceIds,
  notes: z.string().optional(),
  conflictId: Id.optional(),
})
export type Fact = z.infer<typeof Fact>

export const FINANCIAL_KINDS = [
  'recorded_sale',
  'dof_market_value',
  'assessed_value',
  'taxable_value',
  'property_tax',
  'avm_estimate',
] as const
export const FinancialKind = z.enum(FINANCIAL_KINDS)
export type FinancialKind = z.infer<typeof FinancialKind>

export const FinancialEntry = z.object({
  id: Id,
  kind: FinancialKind,
  /** Tax years look like "2025/26". Sales and estimates use `date`. */
  taxYear: z.string().regex(/^\d{4}\/\d{2}$/).optional(),
  date: DateSpec.optional(),
  /** `null` = amount not known (for example the 1975 deed price). */
  amountUsd: z.number().nullable(),
  evidence: Evidence,
  confidence: Confidence,
  sourceIds: SourceIds,
  notes: z.string().optional(),
  conflictId: Id.optional(),
})
export type FinancialEntry = z.infer<typeof FinancialEntry>

export const CHRONICLE_TYPES = [
  'construction',
  'transfer',
  'finance_record',
  'imagery',
  'exterior_change',
  'addition',
  'permit',
  'damage',
  'news',
  'weather',
  'context',
] as const
export const ChronicleType = z.enum(CHRONICLE_TYPES)
export type ChronicleType = z.infer<typeof ChronicleType>

export const ChronicleEvent = z.object({
  id: Id,
  date: DateSpec,
  type: ChronicleType,
  importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  scope: z.enum(['property', 'neighbourhood']),
  title: z.string().min(1),
  detail: z.string().min(1),
  evidence: Evidence,
  confidence: Confidence,
  sourceIds: SourceIds,
  photoIds: z.array(Id).default([]),
  conflictId: Id.optional(),
})
export type ChronicleEvent = z.infer<typeof ChronicleEvent>

export const Viewpoint = z.enum(['front', 'side_139th', 'side_250th', 'rear', 'aerial', 'other'])
export type Viewpoint = z.infer<typeof Viewpoint>

export const Photo = z
  .object({
    id: Id,
    date: DateSpec,
    viewpoint: Viewpoint,
    title: z.string().min(1),
    caption: z.string().optional(),
    credit: z.string().optional(),
    sourceId: z.string().regex(/^S\d+$/),
    rights: Rights,
    storage: z.enum(['stored', 'link_only']),
    /** Repo-relative path of a stored file. Served only by /api/photos/[id] after the session check. */
    file: z.string().optional(),
    /** Outbound link for link-only items (never embedded). */
    url: z.string().url().optional(),
    evidence: Evidence,
  })
  .refine((p) => (p.storage === 'stored' ? !!p.file && !p.url : !!p.url && !p.file), {
    message: 'stored photos need `file` (and no url); link-only photos need `url` (and no file)',
  })
export type Photo = z.infer<typeof Photo>

export const Conflict = z.object({
  id: Id,
  topic: z.string().min(1),
  statements: z.array(z.object({ value: z.string(), sourceId: z.string().regex(/^S\d+$/) })).min(1),
  status: z.enum(['unresolved', 'resolved']),
  notes: z.string().min(1),
})
export type Conflict = z.infer<typeof Conflict>
