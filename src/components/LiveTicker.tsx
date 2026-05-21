import type { WsStatus } from '../api/binance'
import type { LivePrice } from '../types'
import { formatPercent, formatPrice, toNum } from '../utils/format'

interface LiveTickerProps {
  prices: Map<string, LivePrice>
  status: WsStatus
  statusDetail?: string
}

const DISPLAY_ORDER = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX']

function statusMessage(status: WsStatus, detail?: string): string {
  if (detail) return detail
  switch (status) {
    case 'connecting':
      return 'Conectando feed Binance...'
    case 'connected':
      return 'Aguardando primeiro tick de preços...'
    case 'error':
      return 'Erro no feed Binance — usando apenas CoinGecko'
    case 'closed':
      return 'Feed encerrado'
    default:
      return 'Carregando preços...'
  }
}

export function LiveTicker({ prices, status, statusDetail }: LiveTickerProps) {
  const items = DISPLAY_ORDER.map((sym) => prices.get(sym)).filter(Boolean) as LivePrice[]

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] py-3">
        <p className="animate-pulse px-4 text-center text-sm text-[var(--color-muted)]">
          {statusMessage(status, statusDetail)}
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
            <span>{formatPrice(toNum(item.price))}</span>
            <span className={toNum(item.change24h) >= 0 ? 'positive' : 'negative'}>
              {formatPercent(toNum(item.change24h))}
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
