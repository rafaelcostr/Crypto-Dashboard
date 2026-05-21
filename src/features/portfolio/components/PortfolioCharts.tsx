import { useMemo } from 'react'
import { formatCompact, formatSharePercent } from '@/shared/utils/format'

export interface AllocationSlice {
  symbol: string
  name: string
  valueUsd: number
  percent: number
}

const SLICE_COLORS = [
  '#00d4aa',
  '#60a5fa',
  '#fb923c',
  '#a78bfa',
  '#f472b6',
  '#fbbf24',
  '#34d399',
  '#f87171',
  '#38bdf8',
  '#c084fc',
]

interface PortfolioChartsProps {
  slices: AllocationSlice[]
}

function PieChart({ slices }: { slices: AllocationSlice[] }) {
  const gradient = useMemo(() => {
    let acc = 0
    const stops = slices.map((s, i) => {
      const start = acc
      acc += s.percent
      return `${SLICE_COLORS[i % SLICE_COLORS.length]} ${start}% ${acc}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [slices])

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div
        className="relative h-44 w-44 shrink-0 rounded-full"
        style={{ background: gradient }}
        role="img"
        aria-label="Gráfico de pizza da carteira"
      >
        <div className="absolute inset-6 flex items-center justify-center rounded-full bg-[var(--color-panel)] text-center">
          <span className="text-xs text-[var(--color-muted)]">
            {slices.length} ativos
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
        {slices.map((s, i) => (
          <li key={s.symbol} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 truncate">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
              />
              <span className="font-medium">{s.symbol}</span>
              <span className="truncate text-[var(--color-muted)]">{s.name}</span>
            </span>
            <span className="shrink-0 font-mono text-[var(--color-muted)]">
              {formatSharePercent(s.percent)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ColumnChart({ slices }: { slices: AllocationSlice[] }) {
  const max = Math.max(...slices.map((s) => s.valueUsd), 1)

  return (
    <div className="space-y-3">
      {slices.map((s, i) => (
        <div key={s.symbol}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">{s.symbol}</span>
            <span className="font-mono text-[var(--color-muted)]">
              {formatCompact(s.valueUsd)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(s.valueUsd / max) * 100}%`,
                backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PortfolioCharts({ slices }: PortfolioChartsProps) {
  if (slices.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Adicione moedas com quantidade para ver os gráficos de alocação.
      </p>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <h3 className="mb-4 text-sm font-semibold">Distribuição (pizza)</h3>
        <PieChart slices={slices} />
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <h3 className="mb-4 text-sm font-semibold">Valor por moeda (colunas)</h3>
        <ColumnChart slices={slices} />
      </div>
    </div>
  )
}
