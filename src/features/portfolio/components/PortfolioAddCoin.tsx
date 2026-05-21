import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MarketCoin } from '@/shared/types'
import { getLivePrice } from '@/features/markets/api/binance'
import type { LivePrice } from '@/shared/types'
import { formatPrice, toNum } from '@/shared/utils/format'

interface PortfolioAddCoinProps {
  coins: MarketCoin[]
  livePrices: Map<string, LivePrice>
  onAdd: (
    coin: MarketCoin,
    quantity: number,
    priceUsd: number,
    purchasedAt: number,
  ) => void
  isHeld?: (symbol: string) => boolean
}

export function PortfolioAddCoin({
  coins,
  livePrices,
  onAdd,
  isHeld,
}: PortfolioAddCoinProps) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return coins.slice(0, 12)
    return coins
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q),
      )
      .slice(0, 12)
  }, [coins, search])

  const selected = coins.find((c) => c.id === selectedId)

  function handleSelect(coin: MarketCoin) {
    setSelectedId(coin.id)
    setSearch(`${coin.name} (${coin.symbol})`)
    const live = getLivePrice(livePrices, coin.symbol)
    const price = toNum(live?.price ?? coin.current_price)
    if (price > 0 && !avgPrice) setAvgPrice(String(price))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    const qty = parseFloat(quantity)
    const avg = parseFloat(avgPrice)
    if (Number.isNaN(qty) || qty <= 0) return
    const price = Number.isNaN(avg) ? 0 : avg
    const [y, m, d] = purchaseDate.split('-').map(Number)
    const purchasedAt = new Date(y, m - 1, d, 12, 0, 0).getTime()
    onAdd(selected, qty, price, purchasedAt)
    setQuantity('')
    setAvgPrice('')
    setSearch('')
    setSelectedId('')
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Plus className="h-5 w-5 text-[var(--color-accent)]" />
        Adicionar à carteira
      </h2>
      <p className="mb-4 text-xs text-[var(--color-muted)]">
        Registre cada compra com a data — ex.: comprou BTC no dia 20 e mais 5 BTC no dia 28.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="search"
            placeholder="Buscar moeda (BTC, Ethereum...)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedId('')
            }}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          {search && !selectedId && filtered.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] shadow-lg">
              {filtered.map((coin) => (
                <li key={coin.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(coin)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-panel-hover)]"
                  >
                    <img src={coin.image} alt="" className="h-6 w-6 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="font-mono text-xs text-[var(--color-muted)]">
                      {coin.symbol}
                    </span>
                    {isHeld?.(coin.symbol) && (
                      <span className="ml-auto text-xs text-[var(--color-muted)]">
                        já tem compras
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-[var(--color-muted)]">Data da compra</span>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-[var(--color-muted)]">Quantidade</span>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="ex: 0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-[var(--color-muted)]">Preço unitário (USD)</span>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="preço de compra"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        </div>

        {selected && quantity && (
          <p className="text-xs text-[var(--color-muted)]">
            Valor estimado:{' '}
            <strong className="text-[var(--color-text)]">
              {formatPrice(
                parseFloat(quantity) *
                  toNum(
                    getLivePrice(livePrices, selected.symbol)?.price ??
                      selected.current_price,
                  ),
              )}
            </strong>
          </p>
        )}

        <button
          type="submit"
          disabled={!selected || !quantity}
          className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-surface)] transition hover:bg-[var(--color-accent-dim)] disabled:opacity-50 sm:w-auto sm:px-6"
        >
          Registrar compra
        </button>
      </form>
    </section>
  )
}
