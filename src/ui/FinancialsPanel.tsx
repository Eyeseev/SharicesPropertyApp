'use client'

import { useMemo, useState } from 'react'
import type { FinancialEntry } from '@/data/schema'
import { dateLabel, usd } from './format'
import { useData } from './DataContext'
import { Panel } from './Panel'
import { Provenanced } from './Provenance'

const byYear = (a: FinancialEntry, b: FinancialEntry) =>
  (a.taxYear ?? '').localeCompare(b.taxYear ?? '')

/** Latest entry of a tax-year series that has an amount. */
const latest = (list: FinancialEntry[]) =>
  [...list]
    .sort(byYear)
    .filter((e) => e.amountUsd !== null)
    .at(-1)

function Card({
  label,
  entry,
  when,
  tip,
}: {
  label: string
  entry: FinancialEntry | undefined
  when: string
  tip?: string
}) {
  if (!entry || entry.amountUsd === null) {
    return (
      <div className="fin-card">
        <span className="fin-label">{label}</span>
        <span className="fin-amount fin-unknown">Unknown</span>
      </div>
    )
  }
  return (
    <div className="fin-card" data-kind={entry.kind}>
      <div className="fin-label">{label}</div>
      <div className="fin-amount" data-testid={`amount-${entry.id}`}>
        {usd(entry.amountUsd)}
      </div>
      <div className="fin-when">
        {when} <Provenanced p={entry} label={label} />
      </div>
      {tip && <p className="fin-tip">{tip}</p>}
    </div>
  )
}

/** Municipal market value per tax year, every year plotted (no smoothing, no gaps closed). */
function MarketChart({ series }: { series: FinancialEntry[] }) {
  const W = 360
  const H = 150
  const pad = { l: 8, r: 8, t: 22, b: 24 }
  const values = series.map((e) => e.amountUsd as number)
  const lo = Math.min(...values) * 0.92
  const hi = Math.max(...values) * 1.04
  const x = (i: number) => pad.l + (i / (series.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b)
  const line = series
    .map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(e.amountUsd!).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${x(series.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`
  const first = series[0]!
  const last = series.at(-1)!
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="fin-chart"
      role="img"
      aria-label={`Municipal market value by tax year: ${series.map((e) => `${e.taxYear} ${usd(e.amountUsd!)}`).join(', ')}`}
    >
      <path d={area} className="chart-area" />
      <path d={line} className="chart-line" />
      {series.map((e, i) => (
        <circle
          key={e.id}
          cx={x(i)}
          cy={y(e.amountUsd!)}
          r={3.4}
          className={e.evidence === 'verified' ? 'dot dot-verified' : 'dot dot-reported'}
        >
          <title>{`${e.taxYear}: ${usd(e.amountUsd!)} (${e.evidence})`}</title>
        </circle>
      ))}
      <text x={x(0) + 2} y={y(first.amountUsd!) - 14} className="chart-label">
        {usd(first.amountUsd!)}
      </text>
      <text
        x={x(series.length - 1)}
        y={y(last.amountUsd!) - 8}
        textAnchor="end"
        className="chart-label"
      >
        {usd(last.amountUsd!)}
      </text>
      <text x={x(0)} y={H - 6} className="chart-axis">
        {first.taxYear}
      </text>
      <text x={x(series.length - 1)} y={H - 6} textAnchor="end" className="chart-axis">
        {last.taxYear}
      </text>
    </svg>
  )
}

function Overview() {
  const { financials } = useData()
  const of = (kind: FinancialEntry['kind']) => financials.filter((e) => e.kind === kind)
  const market = of('dof_market_value').sort(byYear)
  const tax = of('property_tax').sort(byYear)
  const sales = of('recorded_sale')
  const sale = sales.find((s) => s.amountUsd !== null)
  const avms = of('avm_estimate')
  const marketNow = latest(market)
  const taxNow = tax.find((e) => e.taxYear === marketNow?.taxYear) ?? latest(tax)
  const taxNext = tax.filter((e) => e.taxYear! > (taxNow?.taxYear ?? '')).at(-1)
  const avmAmounts = avms.map((e) => e.amountUsd as number)
  return (
    <>
      <div className="fin-cards">
        <Card
          label="Municipal market value"
          entry={marketNow}
          when={marketNow ? `Tax year ${marketNow.taxYear}` : ''}
          tip="The city’s value used for assessment. Not an appraisal and not a sale price."
        />
        <Card
          label="Recorded sale"
          entry={sale}
          when={sale?.date ? dateLabel(sale.date) : ''}
          tip="Recorded deed, ACRIS (NYC Dept. of Finance, City Register)."
        />
        <Card
          label="Annual property tax"
          entry={taxNow}
          when={taxNow ? `Tax year ${taxNow.taxYear}` : ''}
        />
        {taxNext && (
          <p className="fin-next">
            Next year on record: {taxNext.taxYear} tax {usd(taxNext.amountUsd!)}{' '}
            <Provenanced p={taxNext} label={`${taxNext.taxYear} tax`} />
          </p>
        )}
      </div>

      <section className="fin-block">
        <h3>
          Municipal market value by tax year <span className="fin-chip">DOF</span>
        </h3>
        <p className="fin-sub">
          Every year on record. Filled dots were checked at the official source.
        </p>
        <MarketChart series={market.filter((e) => e.amountUsd !== null)} />
        <p className="fin-legend">
          <span className="dot-key dot-verified" /> checked at source
          <span className="dot-key dot-reported" /> reported by a secondary source
        </p>
      </section>

      <section className="fin-block fin-avm">
        <h3>
          Third-party estimates <span className="fin-chip fin-chip-est">estimates</span>
        </h3>
        {avmAmounts.length > 0 && (
          <p className="fin-range">
            {usd(Math.min(...avmAmounts))} – {usd(Math.max(...avmAmounts))}
          </p>
        )}
        <p className="fin-sub">
          Automated aggregator values. Low confidence, stale crawls, wide spread. Not sales and not
          the city’s value.
        </p>
      </section>
    </>
  )
}

function Assessments() {
  const { financials } = useData()
  const years = useMemo(
    () => [...new Set(financials.filter((e) => e.taxYear).map((e) => e.taxYear!))].sort().reverse(),
    [financials],
  )
  const cell = (year: string, kind: FinancialEntry['kind']) =>
    financials.find((e) => e.taxYear === year && e.kind === kind)
  const cols: [FinancialEntry['kind'], string][] = [
    ['dof_market_value', 'Market value'],
    ['assessed_value', 'Assessed'],
    ['taxable_value', 'Taxable'],
    ['property_tax', 'Tax'],
  ]
  return (
    <div className="fin-table-wrap">
      <table className="fin-table">
        <thead>
          <tr>
            <th scope="col">Tax year</th>
            {cols.map(([, label]) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((y) => (
            <tr key={y}>
              <th scope="row">{y}</th>
              {cols.map(([kind]) => {
                const e = cell(y, kind)
                return (
                  <td key={kind}>
                    {e && e.amountUsd !== null ? (
                      <>
                        {usd(e.amountUsd)} <Provenanced p={e} label={`${y} ${kind}`} />
                      </>
                    ) : (
                      <span className="fin-unknown">Unknown</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SourceDetails() {
  const { sources, financials } = useData()
  const [open, setOpen] = useState(false)
  const used = [...new Set(financials.flatMap((e) => e.sourceIds))].sort(
    (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
  )
  return (
    <section className="fin-block fin-sources">
      <button className="fin-source-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>
          <strong>Source details</strong>
          <small>Where these figures come from and how far to trust them</small>
        </span>
        <span aria-hidden>{open ? '⌃' : '›'}</span>
      </button>
      {open && (
        <ul className="fin-source-list">
          {used.map((id) => {
            const s = sources.find((x) => x.id === id)!
            return (
              <li key={id}>
                <span className="source-id">{id}</span> {s.name}{' '}
                <span className="info-meta">
                  · {s.type} · retrieved {s.retrieved}
                </span>
                <br />
                <span className="info-meta">{s.established}</span>
              </li>
            )
          })}
          <li className="fin-source-note">
            Tax and assessment figures for 2019/20 onward reach the app through PropertyShark, a
            secondary source, and are labelled Reported until checked at NYC Department of Finance.
          </li>
        </ul>
      )}
    </section>
  )
}

export function FinancialsPanel() {
  const [tab, setTab] = useState<'overview' | 'assessments'>('overview')
  return (
    <Panel title="Financials" subtitle="Records and estimates, kept apart">
      <div className="fin-tabs" role="tablist" aria-label="Financial views">
        {(['overview', 'assessments'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`fin-tab${tab === t ? ' fin-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? 'Overview' : 'Assessments'}
          </button>
        ))}
      </div>
      {tab === 'overview' ? <Overview /> : <Assessments />}
      <SourceDetails />
    </Panel>
  )
}
