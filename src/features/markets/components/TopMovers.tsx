import { TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import type { MarketCoin } from '@/shared/types'
import { formatPercent } from '@/shared/utils/format'

interface TopMoversProps {
  coins: MarketCoin[]
  limit?: number
}

export function TopMovers({ coins, limit = 5 }: TopMoversProps) {
  const { gainers, losers } = useMemo(() => {
    const sorted = [...coins].filter((c) => c.price_change_percentage_24h != null)
    const gainers = [...sorted]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, limit)
    const losers = [...sorted]
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, limit)
    return { gainers, losers }
  }, [coins, limit])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]">
          <TrendingUp className="h-4 w-4" />
          Maiores altas 24h
        </div>
        <ul className="space-y-2">
          {gainers.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <img src={c.image} alt="" className="h-5 w-5 rounded-full" />
                <span className="font-medium">{c.symbol.toUpperCase()}</span>
              </span>
              <span className="font-mono positive">{formatPercent(c.price_change_percentage_24h)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-danger)]">
          <TrendingDown className="h-4 w-4" />
          Maiores quedas 24h
        </div>
        <ul className="space-y-2">
          {losers.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <img src={c.image} alt="" className="h-5 w-5 rounded-full" />
                <span className="font-medium">{c.symbol.toUpperCase()}</span>
              </span>
              <span className="font-mono negative">{formatPercent(c.price_change_percentage_24h)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
