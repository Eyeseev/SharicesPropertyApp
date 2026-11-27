/**
 * Financial entries from data/financial_history.csv plus the sales and market estimates in
 * data/property.json. The six kinds are never mixed in one series (recorded sale, DOF market value,
 * assessed value, taxable value, property tax, third-party estimate).
 */
import { readFileSync } from 'node:fs'
import { FinancialEntry, type Confidence, type Evidence } from '../../src/data/schema'
import { parseCsv } from './csv'

/** Tax years whose DOF values were checked directly at NYC Open Data (S19): GEOMETRY_VERIFICATION §6. */
const DOF_VERIFIED_YEARS = new Set(['2016/17', '2017/18', '2018/19'])

const confidenceOf = (s: string): Confidence =>
  s.startsWith('low') ? 'low' : s.startsWith('high') ? 'high' : 'medium'

const slug = (y: string) => y.replace('/', '-')

type Property = {
  financial: {
    recorded_sales: {
      date: string
      price_usd: number | null
      deed_doc_id: string
      recorded?: string
    }[]
    market_estimates_NOT_sales: {
      value_usd: number
      source: string
      date?: string
      confidence?: string
    }[]
  }
}

export function buildFinancials(
  csvPath: string,
  property: Property,
): { entries: FinancialEntry[]; errors: string[] } {
  const errors: string[] = []
  const entries: FinancialEntry[] = []
  const add = (e: unknown) => {
    const p = FinancialEntry.safeParse(e)
    if (p.success) entries.push(p.data)
    else
      errors.push(
        `financial ${(e as { id?: string }).id}: ${p.error.issues.map((i) => i.message).join('; ')}`,
      )
  }

  // Assessment and tax years
  for (const row of parseCsv(readFileSync(csvPath, 'utf8'))) {
    const year = row.tax_year!
    const direct = DOF_VERIFIED_YEARS.has(year)
    const evidence: Evidence = direct ? 'verified' : 'reported'
    const sourceIds = direct ? ['S19', 'S8'] : ['S8']
    const confidence: Confidence = direct ? 'high' : confidenceOf(row.confidence!)
    const num = (k: string) => (row[k] === '' ? null : Number(row[k]))
    const base = { taxYear: year, evidence, confidence, sourceIds }
    const series: [string, FinancialEntry['kind'], string][] = [
      ['market_value_dof', 'dof_market_value', 'market'],
      ['assessed_value', 'assessed_value', 'assessed'],
      ['taxable_amount', 'taxable_value', 'taxable'],
      ['property_tax', 'property_tax', 'tax'],
    ]
    for (const [col, kind, tag] of series) {
      const amount = num(col)
      if (amount === null) continue
      const isTax2627 = kind === 'property_tax' && year === '2026/27'
      add({
        id: `${tag}-${slug(year)}`,
        kind,
        ...base,
        ...(isTax2627 ? { evidence: 'reported', confidence: 'medium', sourceIds: ['S8'] } : {}),
        amountUsd: amount,
        notes:
          [
            kind === 'dof_market_value'
              ? 'City “market value” used for assessment; not an appraisal or a sale price.'
              : '',
            kind === 'property_tax' && row.tax_rate_pct ? `Tax rate ${row.tax_rate_pct}%.` : '',
            isTax2627
              ? 'Resolved by reasoning: the $6,669 figure is the 2026/27 tax, not 2025/26 (medium-high confidence).'
              : '',
            row.notes && year !== '2026/27' ? row.notes : '',
          ]
            .filter(Boolean)
            .join(' ') || undefined,
        conflictId:
          isTax2627 || (year === '2025/26' && kind === 'property_tax')
            ? 'tax-6669-label'
            : undefined,
      })
    }
  }

  // Recorded sales (ACRIS)
  const [sale2021, deed1975] = property.financial.recorded_sales
  if (!sale2021 || sale2021.date !== '2021-03-08' || sale2021.price_usd !== 569000)
    errors.push(
      'financial: expected the 2021-03-08 $569,000 sale as the first recorded sale in property.json',
    )
  else
    add({
      id: 'sale-2021-03-08',
      kind: 'recorded_sale',
      date: { exact: '2021-03-08', approximate: false },
      amountUsd: sale2021.price_usd,
      evidence: 'verified',
      confidence: 'high',
      sourceIds: ['S3', 'S8'],
      notes: `Deed ${sale2021.deed_doc_id}, recorded ${sale2021.recorded}.`,
    })
  if (!deed1975 || deed1975.price_usd !== null)
    errors.push('financial: expected the 1975 deed (price unknown) as the second recorded sale')
  else
    add({
      id: 'deed-1975-01-07',
      kind: 'recorded_sale',
      date: { exact: '1975-01-07', approximate: false },
      amountUsd: null,
      evidence: 'verified',
      confidence: 'high',
      sourceIds: ['S3'],
      notes: `Deed ${deed1975.deed_doc_id} recorded; the price is not in the public record.`,
    })

  // Third-party estimates (kept apart from DOF values and sales)
  const avmRows = property.financial.market_estimates_NOT_sales.filter(
    (m) => !/NYC DOF/.test(m.source),
  )
  if (avmRows.length !== 5)
    errors.push(`financial: expected 5 third-party estimates, found ${avmRows.length}`)
  avmRows.forEach((m, i) =>
    add({
      id: `avm-${i + 1}`,
      kind: 'avm_estimate',
      date: { exact: '2026', approximate: true, label: m.date ?? 'crawl date unknown' },
      amountUsd: m.value_usd,
      evidence: 'estimated',
      confidence: 'low',
      sourceIds: ['S12'],
      notes: `${m.source}. Automated estimate from an aggregator crawl; not a sale or an appraisal.`,
    }),
  )

  return { entries, errors }
}
