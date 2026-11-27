import { z } from 'zod'

/** How we know a value. Shown to the user as a badge on every value. */
export const Evidence = z.enum([
  'verified',
  'observed',
  'owner_provided',
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
