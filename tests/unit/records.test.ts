import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { ChronicleEvent, Conflict, Fact, FinancialEntry, Photo } from '../../src/data/schema'
import { buildSources } from '../../scripts/import/sources'
import { runImport } from '../../scripts/import/run'
import { validateRecords, type Records } from '../../scripts/import/records'
import { parseCsv } from '../../scripts/import/csv'

const ROOT = path.resolve(__dirname, '../..')
const read = (f: string) => JSON.parse(readFileSync(path.join(ROOT, 'app-data/real', f), 'utf8'))
const records = (): Records => ({
  facts: z.array(Fact).parse(read('facts.json')),
  financials: z.array(FinancialEntry).parse(read('financials.json')),
  chronicle: z.array(ChronicleEvent).parse(read('chronicle.json')),
  photos: z.array(Photo).parse(read('photos.json')),
  conflicts: z.array(Conflict).parse(read('conflicts.json')),
})
const sources = buildSources()

describe('living database import', () => {
  it('imports without errors and the committed output is current', () => {
    const { errors, outputs } = runImport({ write: false })
    expect(errors).toEqual([])
    for (const [file, content] of Object.entries(outputs)) {
      expect(readFileSync(path.join(ROOT, 'app-data/real', file), 'utf8'), file).toBe(content)
    }
  })

  it('all records validate together', () => {
    expect(validateRecords(records(), sources)).toEqual([])
  })
})

describe('financial honesty (CREATIVE_DIRECTION §7)', () => {
  const { financials } = records()
  const one = (id: string) => financials.find((e) => e.id === id)!

  it('keeps sales, DOF values, taxes and third-party estimates as separate kinds', () => {
    expect(new Set(financials.map((e) => e.kind))).toEqual(
      new Set([
        'recorded_sale',
        'dof_market_value',
        'assessed_value',
        'taxable_value',
        'property_tax',
        'avm_estimate',
      ]),
    )
  })

  it('records the 2021 sale as verified ACRIS data and the 1975 price as unknown', () => {
    expect(one('sale-2021-03-08')).toMatchObject({ amountUsd: 569000, evidence: 'verified' })
    expect(one('sale-2021-03-08').sourceIds).toContain('S3')
    expect(one('deed-1975-01-07').amountUsd).toBeNull()
  })

  it('2025/26 tax is $6,337 and $6,669 appears only as the 2026/27 figure', () => {
    expect(one('tax-2025-26').amountUsd).toBe(6337)
    const sixSixSixNine = financials.filter((e) => e.amountUsd === 6669)
    expect(sixSixSixNine.map((e) => e.taxYear)).toEqual(['2026/27'])
    expect(sixSixSixNine[0]!.evidence).toBe('reported')
  })

  it('DOF values are "verified" only for the years checked directly (2016/17 – 2018/19)', () => {
    const verified = financials.filter((e) => e.taxYear && e.evidence === 'verified')
    expect(new Set(verified.map((e) => e.taxYear))).toEqual(
      new Set(['2016/17', '2017/18', '2018/19']),
    )
    expect(one('market-2025-26')).toMatchObject({ amountUsd: 659000, evidence: 'reported' })
  })

  it('every third-party estimate is "estimated", low confidence, and never a DOF kind', () => {
    const avms = financials.filter((e) => e.kind === 'avm_estimate')
    expect(avms).toHaveLength(5)
    expect(avms.every((e) => e.evidence === 'estimated' && e.confidence === 'low')).toBe(true)
  })

  it('the chart series (DOF market value) covers each tax year in the CSV, including the 2024/25 dip', () => {
    const csv = parseCsv(readFileSync(path.join(ROOT, 'data/financial_history.csv'), 'utf8'))
    const withValue = csv.filter((r) => r.market_value_dof !== '')
    const series = financials.filter((e) => e.kind === 'dof_market_value')
    expect(series).toHaveLength(withValue.length)
    expect(series.find((e) => e.taxYear === '2024/25')!.amountUsd).toBe(613000)
  })
})

describe('data honesty', () => {
  const r = records()

  it('the invented mockup photos are absent; stored photos exist only for real files', () => {
    const text = JSON.stringify(r.photos)
    for (const bad of ['County recorder', 'County historical archive', 'Local historical society'])
      expect(text).not.toContain(bad)
    expect(r.photos.some((p) => p.date.exact === '1945' || p.date.exact === '1975-07-12')).toBe(
      false,
    )
  })

  it('link-only photos carry a link and no file; Street View is never stored', () => {
    for (const p of r.photos.filter((x) => x.storage === 'link_only')) {
      expect(p.url).toBeTruthy()
      expect(p.file).toBeUndefined()
    }
    expect(
      r.photos.filter((p) => p.sourceId === 'S9').every((p) => p.storage === 'link_only'),
    ).toBe(true)
  })

  it('the build year stays an open conflict on the fact and on the 1940s event', () => {
    expect(r.conflicts.find((c) => c.id === 'build-year')!.status).toBe('unresolved')
    expect(r.facts.find((f) => f.id === 'year-built')!.conflictId).toBe('build-year')
    expect(r.chronicle.find((e) => e.id === 'tax-photo-1940s')!.conflictId).toBe('build-year')
  })

  it('unknowns are explicit, not invented', () => {
    const unknown = r.facts.filter((f) => f.value === null)
    expect(unknown.length).toBeGreaterThan(0)
    expect(unknown.every((f) => f.evidence === 'unknown')).toBe(true)
    expect(r.facts.find((f) => f.id === 'beds-baths')!.evidence).toBe('reported')
  })

  it('the chronicle is chronological and local-context events are not mixed into property events', () => {
    const key = (e: ChronicleEvent) => e.date.exact ?? e.date.from ?? e.date.to!
    const keys = r.chronicle.map(key)
    expect(keys).toEqual([...keys].sort())
    expect(r.chronicle.every((e) => e.scope === 'property')).toBe(true)
  })
})

describe('validation rejects bad records', () => {
  const bad = (mutate: (r: Records) => void) => {
    const r = records()
    mutate(r)
    return validateRecords(r, sources).join('\n')
  }

  it('an estimate stored under a verified label', () => {
    expect(
      bad((r) => {
        r.financials.find((e) => e.kind === 'avm_estimate')!.evidence = 'verified'
      }),
    ).toMatch(/estimate must not be stored|without an official source/)
  })

  it('an unknown source, a duplicate id and a dangling conflict', () => {
    expect(bad((r) => (r.facts[0]!.sourceIds = ['S99']))).toMatch(/unknown source S99/)
    expect(bad((r) => r.facts.push({ ...r.facts[0]! }))).toMatch(/duplicate id/)
    expect(bad((r) => (r.facts[0]!.conflictId = 'nope'))).toMatch(/unknown conflict/)
  })

  it('a recorded sale without ACRIS, and an unknown amount outside a sale', () => {
    expect(
      bad((r) => (r.financials.find((e) => e.id === 'sale-2021-03-08')!.sourceIds = ['S8'])),
    ).toMatch(/ACRIS/)
    expect(
      bad((r) => (r.financials.find((e) => e.id === 'tax-2025-26')!.amountUsd = null)),
    ).toMatch(/unknown amount/)
  })

  it('a mockup placeholder photo', () => {
    expect(bad((r) => (r.photos[0]!.caption = 'County recorder (public record)'))).toMatch(
      /placeholder/,
    )
  })
})
