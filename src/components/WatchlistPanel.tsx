import { Star, Trash2 } from 'lucide-react'
import type { LivePrice } from '../types'
import type { WatchlistEntry } from '../types'
import { getLivePrice } from '../api/binance'
import { formatCompact, formatPercent, formatPrice, toNum } from '../utils/format'

interface WatchlistPanelProps {
  entries: WatchlistEntry[]
  livePrices: Map<string, LivePrice>
  coinPrices: Map<string, number>
  onRemove: (symbol: string) => void
  readOnlyQuantity?: boolean
  onUpdate: (
    symbol: string,
    patch: Partial<Pick<WatchlistEntry, 'quantity' | 'avgBuyPrice'>>,
  ) => void
}

export function WatchlistPanel({
  entries,
  livePrices,
  coinPrices,
  onRemove,
  onUpdate,
  readOnlyQuantity,
}: WatchlistPanelProps) {
  const rows = entries.map((entry) => {
    const live = getLivePrice(livePrices, entry.symbol)
    const price = toNum(live?.price ?? coinPrices.get(entry.symbol.toUpperCase()))
    const valueUsd = entry.quantity * price
    const invested = entry.quantity * entry.avgBuyPrice
    const pnl = valueUsd - invested
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
    return { entry, price, valueUsd, invested, pnl, pnlPct }
  })

  const totalValue = rows.reduce((s, r) => s + r.valueUsd, 0)

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[var(--color-warning)]" />
          <h2 className="text-lg font-semibold">Minha carteira</h2>
        </div>
        {totalValue > 0 && (
          <span className="text-sm font-mono text-[var(--color-accent)]">
            {formatPrice(totalValue)}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Registre compras acima — a quantidade total é a soma de todas as compras.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)]">
                <th className="py-2 pr-3 font-medium">Moeda</th>
                <th className="py-2 pr-3 font-medium text-right">Qtd</th>
                <th className="py-2 pr-3 font-medium text-right">Preço</th>
                <th className="py-2 pr-3 font-medium text-right">Valor USD</th>
                <th className="py-2 pr-3 font-medium text-right">P&L</th>
                <th className="py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ entry, price, valueUsd, pnl, pnlPct }) => (
                <tr
                  key={entry.symbol}
                  className="border-b border-[var(--color-border)]/50"
                >
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <img src={entry.image} alt="" className="h-7 w-7 rounded-full" />
                      <div>
                        <span className="font-medium">{entry.symbol}</span>
                        <p className="text-xs text-[var(--color-muted)]">{entry.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right font-mono">
                    {readOnlyQuantity ? (
                      <span>{entry.quantity || '—'}</span>
                    ) : (
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={entry.quantity || ''}
                        onChange={(e) =>
                          onUpdate(entry.symbol, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-right text-xs"
                      />
                    )}
                  </td>
                  <td className="py-3 pr-3 text-right font-mono text-xs">
                    {formatPrice(price)}
                  </td>
                  <td className="py-3 pr-3 text-right font-mono font-medium">
                    {entry.quantity > 0 ? formatPrice(valueUsd) : '—'}
                  </td>
                  <td className="py-3 pr-3 text-right text-xs">
                    {entry.quantity > 0 && entry.avgBuyPrice > 0 ? (
                      <span className={pnl >= 0 ? 'positive' : 'negative'}>
                        {formatPercent(pnlPct)}
                        <span className="block font-mono opacity-80">
                          {formatCompact(pnl)}
                        </span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onRemove(entry.symbol)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-danger)]"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
