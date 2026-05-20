import type { LivePrice } from '../types'
import { formatPercent, formatPrice } from '../utils/format'

interface LiveTickerProps {
  prices: Map<string, LivePrice>
}

const DISPLAY_ORDER = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX']

export function LiveTicker({ prices }: LiveTickerProps) {
  const items = DISPLAY_ORDER.map((sym) => prices.get(sym)).filter(Boolean) as LivePrice[]

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] py-3">
        <p className="animate-pulse px-4 text-center text-sm text-[var(--color-muted)]">
          Conectando feed Binance...
        </p>
      </div>
    )
  }

  const duplicated = [...items, ...items]

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] py-3">
      <div className="flex animate-ticker gap-8 whitespace-nowrap">
        {duplicated.map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-3 px-2 font-mono text-sm">
            <span className="font-semibold text-white">{item.symbol}</span>
            <span>{formatPrice(item.price)}</span>
            <span className={item.change24h >= 0 ? 'positive' : 'negative'}>
              {formatPercent(item.change24h)}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
