import { RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import type { LivePrice } from '../types'
import type { MarketCoin } from '../types'
import { formatCompact, formatPercent, formatPrice } from '../utils/format'
import { getLivePrice } from '../api/binance'

interface MarketTableProps {
  coins: MarketCoin[]
  livePrices: Map<string, LivePrice>
  loading: boolean
  error: string | null
  onRefresh: () => void
  onCreateAlert: (symbol: string, name: string, price: number) => void
}

export function MarketTable({
  coins,
  livePrices,
  loading,
  error,
  onRefresh,
  onCreateAlert,
}: MarketTableProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">Ranking por Market Cap</h2>
          <p className="text-xs text-[var(--color-muted)]">CoinGecko · atualizado a cada 60s</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:bg-[var(--color-panel-hover)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <p className="px-5 py-3 text-sm text-[var(--color-danger)]">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Moeda</th>
              <th className="px-5 py-3 font-medium text-right">Preço</th>
              <th className="px-5 py-3 font-medium text-right">24h</th>
              <th className="px-5 py-3 font-medium text-right">Market Cap</th>
              <th className="px-5 py-3 font-medium text-right">Volume</th>
              <th className="px-5 py-3 font-medium text-center">Alerta</th>
            </tr>
          </thead>
          <tbody>
            {loading && coins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[var(--color-muted)]">
                  Carregando ranking...
                </td>
              </tr>
            ) : (
              coins.map((coin) => {
                const live = getLivePrice(livePrices, coin.symbol)
                const price = live?.price ?? coin.current_price
                const change = live?.change24h ?? coin.price_change_percentage_24h
                const isUp = change >= 0

                return (
                  <tr
                    key={coin.id}
                    className="border-b border-[var(--color-border)]/50 transition hover:bg-[var(--color-panel-hover)]"
                  >
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      {coin.market_cap_rank}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={coin.image}
                          alt=""
                          className="h-8 w-8 rounded-full"
                          loading="lazy"
                        />
                        <div>
                          <span className="font-medium">{coin.name}</span>
                          <span className="ml-2 font-mono text-xs uppercase text-[var(--color-muted)]">
                            {coin.symbol}
                          </span>
                          {live && (
                            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" title="Preço ao vivo" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {formatPrice(price)}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono ${isUp ? 'positive' : 'negative'}`}>
                      <span className="inline-flex items-center justify-end gap-1">
                        {isUp ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {formatPercent(change)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--color-muted)]">
                      {formatCompact(coin.market_cap)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--color-muted)]">
                      {formatCompact(coin.total_volume)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onCreateAlert(coin.symbol, coin.name, price)}
                        className="rounded-md border border-[var(--color-accent)]/40 px-2 py-1 text-xs text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/10"
                      >
                        + Alerta
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
