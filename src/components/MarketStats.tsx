import { Gauge } from 'lucide-react'
import type { FearGreedData } from '../hooks/useFearGreed'
import { TOP_MARKETS } from '../constants'
import { formatCompact } from '../utils/format'

interface MarketStatsProps {
  fearGreed: FearGreedData | null
  fearGreedLoading: boolean
  totalMarketCap?: number
  btcDominance?: number
}

function fngColor(value: number): string {
  if (value <= 25) return 'var(--color-danger)'
  if (value <= 45) return 'var(--color-warning)'
  if (value <= 55) return 'var(--color-muted)'
  if (value <= 75) return 'var(--color-accent-dim)'
  return 'var(--color-accent)'
}

export function MarketStats({
  fearGreed,
  fearGreedLoading,
  totalMarketCap,
  btcDominance,
}: MarketStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Gauge className="h-4 w-4" />
          Medo e Ganância
        </div>
        {fearGreedLoading ? (
          <div className="h-10 animate-pulse rounded bg-[var(--color-surface)]" />
        ) : fearGreed ? (
          <>
            <p
              className="text-3xl font-bold"
              style={{ color: fngColor(fearGreed.value) }}
            >
              {fearGreed.value}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {fearGreed.classification}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">Indisponível</p>
        )}
      </div>

      {totalMarketCap != null && totalMarketCap > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="mb-2 text-sm text-[var(--color-muted)]">Market Cap Total</p>
          <p className="text-2xl font-bold">{formatCompact(totalMarketCap)}</p>
          <p className="text-xs text-[var(--color-muted)]">Top {TOP_MARKETS} moedas</p>
        </div>
      )}

      {btcDominance != null && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="mb-2 text-sm text-[var(--color-muted)]">Dominância BTC (est.)</p>
          <p className="text-2xl font-bold">{btcDominance.toFixed(1)}%</p>
          <p className="text-xs text-[var(--color-muted)]">Entre top {TOP_MARKETS}</p>
        </div>
      )}
    </div>
  )
}
