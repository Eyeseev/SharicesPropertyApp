/**
 * Facts: normalised property characteristics. Each row names the raw field in data/property.json
 * it was read from (`from`); the import fails if that path no longer exists, so a restructured or
 * corrected research file forces a human review. Display text, evidence and confidence are set here.
 */
import { Fact, type Confidence, type Evidence } from '../../src/data/schema'

type Row = {
  id: string
  category: Fact['category']
  field: string
  /** null = unknown (shown as "Unknown"). */
  value: string | null
  from: string
  evidence: Evidence
  confidence: Confidence
  sourceIds: string[]
  notes?: string
  conflictId?: string
}

const V = 'verification_2026_11_27'

export const FACT_ROWS: Row[] = [
  // identity
  {
    id: 'address',
    category: 'identity',
    field: 'Address',
    value: '138-37 250th Street, Rosedale, NY 11422',
    from: 'address.queens_form',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1', 'S2'],
    notes: 'Confirmed by the owner side and matches PLUTO and PAD.',
  },
  {
    id: 'address-alt',
    category: 'identity',
    field: 'Alternate address on record',
    value: '250-01 139th Ave, Rosedale, NY 11422',
    from: 'address.alternate_address_on_record',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S2'],
    notes: 'Corner lot with two street frontages.',
  },
  {
    id: 'bbl',
    category: 'identity',
    field: 'Borough-Block-Lot',
    value: '4136180005 (Queens, Block 13618, Lot 5)',
    from: 'identity.bbl.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1', 'S2'],
  },
  {
    id: 'bin',
    category: 'identity',
    field: 'Building ID (BIN)',
    value: '4289397',
    from: 'identity.bin.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S2'],
  },
  {
    id: 'coordinates',
    category: 'identity',
    field: 'Coordinates',
    value: '40.6628678, -73.7305241',
    from: 'identity.coordinates.lat',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'zoning',
    category: 'identity',
    field: 'Zoning',
    value: 'R3X (zoning map 19d)',
    from: 'identity.zoning.district',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'community-district',
    category: 'identity',
    field: 'Community district',
    value: '413 (Queens CB13)',
    from: 'identity.admin.community_district',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'council-district',
    category: 'identity',
    field: 'Council district',
    value: '31',
    from: 'identity.admin.council_district',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'school-district',
    category: 'identity',
    field: 'School district',
    value: '29',
    from: 'identity.admin.school_district',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'police-precinct',
    category: 'identity',
    field: 'Police precinct',
    value: '116',
    from: 'identity.admin.police_precinct',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },

  // parcel
  {
    id: 'lot-size',
    category: 'parcel',
    field: 'Lot',
    value: '50 × 100 ft (5,000 sq ft), corner lot',
    from: 'parcel_geometry.lot_area_sqft.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
    notes: 'PLUTO nominal dimensions.',
  },
  {
    id: 'lot-measured',
    category: 'parcel',
    field: 'Surveyed lot outline',
    value: '≈ 51.1 × 100.4 ft',
    from: `${V}.parcel_polygon.measured_edges_ft`,
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S17'],
    notes: 'Measured from the official DOF Digital Tax Map polygon.',
  },
  {
    id: 'frontages',
    category: 'parcel',
    field: 'Street frontages',
    value: '250th Street (NW end, 50 ft) and 139th Avenue (SW side, 100 ft)',
    from: `${V}.parcel_polygon.street_frontages_official`,
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S17'],
    notes: 'The NE long side is an interior lot line against 138-33.',
    conflictId: 'street-frontage',
  },
  {
    id: 'elevation',
    category: 'parcel',
    field: 'Ground elevation',
    value: '≈ 16.4 ft, flat',
    from: 'parcel_geometry.elevation_ft.value',
    evidence: 'verified',
    confidence: 'medium',
    sourceIds: ['S7'],
    notes: 'USGS point sample.',
  },

  // building
  {
    id: 'year-built',
    category: 'building',
    field: 'Year built (city record)',
    value: '1945',
    from: 'building.year_built.value',
    evidence: 'verified',
    confidence: 'medium',
    sourceIds: ['S1', 'S8', 'S11', 'S23'],
    notes:
      'Disputed: a 1939–41 tax photo may show this house already standing. Treat 1945 as the official record, not as settled.',
    conflictId: 'build-year',
  },
  {
    id: 'building-class',
    category: 'building',
    field: 'Building class',
    value: 'A2: one-story, permanent living quarter',
    from: 'building.building_class.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'style',
    category: 'building',
    field: 'Style',
    value: '1.5-storey Cape Cod',
    from: 'building.style_observed.value',
    evidence: 'observed',
    confidence: 'high',
    sourceIds: ['S9', 'S11'],
  },
  {
    id: 'floors',
    category: 'building',
    field: 'Floors',
    value: '1.5',
    from: 'building.num_floors.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1', 'S11'],
  },
  {
    id: 'units',
    category: 'building',
    field: 'Residential units',
    value: '1',
    from: 'building.units_residential.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'buildings',
    category: 'building',
    field: 'Buildings on the lot',
    value: '2 (house and detached garage)',
    from: 'building.num_buildings_on_lot.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'walls',
    category: 'building',
    field: 'House walls',
    value: '22 × 42 ft',
    from: 'building.building_front_ft.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
  },
  {
    id: 'roof-outline',
    category: 'building',
    field: 'House roof outline',
    value: '24.2 × 50.5 ft, roof height 21.7 ft',
    from: 'building_footprints_official.house.polygon_sides_ft_computed',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S16'],
    notes: 'Official footprint outline: includes eaves and the SE extension.',
  },
  {
    id: 'garage-size',
    category: 'building',
    field: 'Detached garage',
    value: '19.4 × 10.2 ft, roof height 11.5 ft',
    from: 'building_footprints_official.garage.polygon_sides_ft_computed',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S16'],
  },
  {
    id: 'floor-area',
    category: 'building',
    field: 'Gross building area',
    value: '1,052 sq ft',
    from: 'building.gross_building_area_sqft.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1'],
    notes: 'PropertyShark reads 1,050 sq ft.',
    conflictId: 'floor-area',
  },
  {
    id: 'construction',
    category: 'building',
    field: 'Construction',
    value: 'Frame, brick ground floor; detached frame garage',
    from: 'building.construction.value',
    evidence: 'reported',
    confidence: 'medium',
    sourceIds: ['S8', 'S9'],
  },
  {
    id: 'basement',
    category: 'building',
    field: 'Basement',
    value: 'Present',
    from: 'building.basement.value',
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S1', 'S9'],
    notes: 'PLUTO basement code 2; barred basement windows seen on the 139th Ave side.',
  },
  {
    id: 'extension',
    category: 'building',
    field: 'SE extension',
    value: 'Single-storey, white. Present by 2004 aerial; construction date unknown',
    from: 'building.extension.value',
    evidence: 'historical_approximation',
    confidence: 'medium',
    sourceIds: ['S1', 'S9', 'S21'],
    notes: 'PLUTO records an extension but no alteration year; no permit found.',
  },
  {
    id: 'beds-baths',
    category: 'building',
    field: 'Bedrooms / bathrooms',
    value: '3 bed / 1 bath (third-party claim)',
    from: 'building.beds_baths_third_party.value',
    evidence: 'reported',
    confidence: 'low',
    sourceIds: ['S12'],
    notes: 'Not in any official record. Owner confirmation needed.',
  },
  {
    id: 'renovations',
    category: 'building',
    field: 'Renovation history',
    value: null,
    from: 'permits_history.interpretation',
    evidence: 'unknown',
    confidence: 'low',
    sourceIds: ['S4', 'S5', 'S20'],
    notes: 'No digital permit exists. Renovation dates are owner knowledge.',
  },
  {
    id: 'dob-records',
    category: 'building',
    field: 'DOB jobs, permits and violations',
    value: '0 records in all three DOB systems',
    from: `${V}.dob_permits_retry.records`,
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S4', 'S5', 'S20'],
    notes: 'Absence in digital systems does not prove no work occurred.',
  },

  // environment
  {
    id: 'flood-zone',
    category: 'environment',
    field: 'FEMA flood zone',
    value: 'Zone X: minimal flood hazard (not a Special Flood Hazard Area)',
    from: `${V}.fema_flood_official.zone`,
    evidence: 'verified',
    confidence: 'high',
    sourceIds: ['S18'],
    notes: 'FEMA NFHL, DFIRM 360497.',
  },
  {
    id: 'evacuation-zone',
    category: 'environment',
    field: 'Hurricane evacuation zone',
    value: '4',
    from: 'environment.hurricane_evacuation_zone.value',
    evidence: 'reported',
    confidence: 'medium',
    sourceIds: ['S8'],
  },

  // context
  {
    id: 'terrain',
    category: 'context',
    field: 'Local terrain',
    value: 'Low-lying former farmland near Hook Creek; neighbourhood-level flooding is documented',
    from: 'environment.terrain_context.value',
    evidence: 'reported',
    confidence: 'low',
    sourceIds: ['S15', 'S7'],
    notes: 'Local context only. No evidence this property flooded.',
  },
  {
    id: 'walkability',
    category: 'context',
    field: 'Walk / transit / bike score',
    value: '86 / 64 / 57',
    from: 'environment.walk_transit_bike.value',
    evidence: 'reported',
    confidence: 'medium',
    sourceIds: ['S8'],
  },
  {
    id: 'area-median',
    category: 'context',
    field: 'Neighbourhood median sale price',
    value: 'Rosedale $740,000; Queens $765,000 (crawl, Oct–Nov 2026)',
    from: 'environment.neighbourhood_context.value',
    evidence: 'reported',
    confidence: 'medium',
    sourceIds: ['S8'],
    notes: 'Neighbourhood statistic, not a value of this property.',
  },
]

function has(obj: unknown, path: string): boolean {
  let cur: unknown = obj
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(key in (cur as object))) return false
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur !== undefined
}

export function buildFacts(property: unknown): { facts: Fact[]; errors: string[] } {
  const errors: string[] = []
  const facts: Fact[] = []
  for (const r of FACT_ROWS) {
    if (!has(property, r.from))
      errors.push(`fact ${r.id}: raw field "${r.from}" not found in data/property.json`)
    const { from: _from, ...rest } = r
    void _from
    const parsed = Fact.safeParse(rest)
    if (!parsed.success)
      errors.push(`fact ${r.id}: ${parsed.error.issues.map((i) => i.message).join('; ')}`)
    else facts.push(parsed.data)
  }
  return { facts, errors }
}
