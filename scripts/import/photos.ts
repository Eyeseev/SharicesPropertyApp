/**
 * Photo archive records. Stored files stay in research/photos and are served only by the
 * authenticated /api/photos/[id] route. Google Street View and Bing are link-only: never embedded.
 * The invented mockup entries (1945 / 1975 / 2021 "photos") are not data and are not imported.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { Photo } from '../../src/data/schema'

const CREDIT_OTI = '© City of New York, CC BY 4.0, via NYC OTI orthophotography'

const aerial = (year: string, file = `aerial-${year}.png`, span?: [string, string]): Photo => ({
  id: `aerial-${year}`,
  date: span
    ? { from: span[0], to: span[1], approximate: true, label: `${span[0]}–${span[1]} survey` }
    : { exact: year, approximate: false },
  viewpoint: 'aerial',
  title: `Aerial view, ${span ? `${span[0]}–${span[1]}` : year}`,
  caption: 'City orthophoto crop centred on the lot, north up.',
  credit: CREDIT_OTI,
  sourceId: 'S21',
  rights: 'usable_data',
  storage: 'stored',
  file: `research/photos/aerials/${file}`,
  evidence: 'observed',
})

export const PHOTOS: Photo[] = [
  aerial('1924'),
  aerial('1951'),
  aerial('1996'),
  aerial('2001', 'aerial-2001-2.png', ['2001', '2002']),
  ...['2004', '2006', '2008', '2010', '2012', '2014', '2016', '2018', '2020', '2022', '2024'].map(
    (y) => aerial(y),
  ),
  {
    id: 'tax-1980s',
    date: { from: '1982', to: '1988', approximate: true, label: 'Survey c. 1982–88' },
    viewpoint: 'front',
    title: 'NYC tax photo, 1980s',
    caption: 'NW gable end seen from the corner. Placard: Block 13618, Lot 5.',
    credit: 'NYC Municipal Archives (REC-0041), via the 80s.nyc mirror. Private reference only.',
    sourceId: 'S22',
    rights: 'unknown',
    storage: 'stored',
    file: 'research/photos/tax-photo-1980s-b13618-l5.jpg',
    evidence: 'observed',
  },
  {
    id: 'tax-1940s',
    date: { from: '1939', to: '1941', approximate: true, label: 'Survey bulk 1939–41' },
    viewpoint: 'front',
    title: 'NYC tax photo, 1940s',
    caption:
      'Finished brick house; sign “4931 - 5 Q”. Opens on the 1940s.nyc mirror. Placement is the mirror’s automated match.',
    credit: 'NYC Municipal Archives (REC-0040), via 1940s.nyc',
    sourceId: 'S23',
    rights: 'link_only',
    storage: 'link_only',
    url: 'https://1940s.nyc/map/photo/nynyma_rec0040_4_04931_0005_w4',
    evidence: 'observed',
  },
  {
    id: 'sv-2024-10',
    date: { exact: '2024-10', approximate: false },
    viewpoint: 'front',
    title: 'Street View, Oct 2024',
    caption: '250th Street and the corner: black fence present; best combined front and side view.',
    credit: '© Google. Opens in Google Maps; never embedded.',
    sourceId: 'S9',
    rights: 'link_only',
    storage: 'link_only',
    url: 'https://www.google.com/maps/place/138-37+250th+St,+Jamaica,+NY+11422/@40.6630937,-73.7306105,7a,75y,162.79h,90t/data=!3m8!1e1!3m6!1sQwv2gNcCi29tVK9x0YvFAw!2e0!5s20241001T000000',
    evidence: 'observed',
  },
  {
    id: 'sv-2026-05',
    date: { exact: '2026-05', approximate: false },
    viewpoint: 'side_139th',
    title: 'Street View, May 2026',
    caption: '139th Avenue: latest imagery found; white vinyl rear fence and a patio umbrella.',
    credit: '© Google. Opens in Google Maps; never embedded.',
    sourceId: 'S9',
    rights: 'link_only',
    storage: 'link_only',
    url: 'https://www.google.com/maps/@40.662751,-73.7306639,6a,75y,70h,90t/data=!3m7!1e1!3m5!1sG1YbvKsHxsNSqTiJFEDEgw!2e0',
    evidence: 'observed',
  },
]

export function buildPhotos(root: string): { photos: Photo[]; errors: string[] } {
  const errors: string[] = []
  const photos: Photo[] = []
  for (const p of PHOTOS) {
    const parsed = Photo.safeParse(p)
    if (!parsed.success) {
      errors.push(`photo ${p.id}: ${parsed.error.issues.map((i) => i.message).join('; ')}`)
      continue
    }
    if (p.file) {
      const abs = path.resolve(root, p.file)
      if (!abs.startsWith(path.resolve(root, 'research/photos') + path.sep))
        errors.push(`photo ${p.id}: file escapes research/photos`)
      else if (!existsSync(abs)) errors.push(`photo ${p.id}: file not found: ${p.file}`)
    }
    photos.push(parsed.data)
  }
  return { photos, errors }
}
