import {
  Heart,
  LineChart,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FavoriteCoin, LivePrice, MarketCoin, WatchlistEntry } from '@/shared/types'
import { getLivePrice } from '@/features/markets/api/binance'
import {
  RANKING_PAGE_SIZE,
  RANKING_PAGE_SIZE_OPTIONS,
  TOP_MARKETS,
} from '@/shared/constants'
import { MarketTablePagination } from './MarketTablePagination'
import {
  findRankedCoin,
  marketCoinFromEntry,
  marketCoinFromFavorite,
} from '@/shared/utils/marketCoinLookup'
import { formatCompact, formatPercent, formatPrice, toNum } from '@/shared/utils/format'

export type MarketTableView = 'ranking' | 'favorites' | 'portfolio'

interface MarketTableProps {
  coins: MarketCoin[]
  livePrices: Map<string, LivePrice>
  loading: boolean
  error: string | null
  onRefresh: () => void
  onCreateAlert: (symbol: string, name: string, price: number) => void
  onOpenCoin: (coinId: string) => void
  favorites: FavoriteCoin[]
  isFavorite: (symbol: string) => boolean
  onToggleFavorite: (coin: MarketCoin) => void
  portfolioEntries: WatchlistEntry[]
  isInPortfolio: (symbol: string) => boolean
  onGoPortfolio?: () => void
}

const VIEW_TABS: { id: MarketTableView; label: string }[] = [
  { id: 'ranking', label: 'Ranking' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'portfolio', label: 'Portfólio' },
]

export function MarketTable({
  coins,
  livePrices,
  loading,
  error,
  onRefresh,
  onCreateAlert,
  onOpenCoin,
  favorites,
  isFavorite,
  onToggleFavorite,
  portfolioEntries,
  isInPortfolio,
  onGoPortfolio,
}: MarketTableProps) {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<MarketTableView>('ranking')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(RANKING_PAGE_SIZE)
  const sectionRef = useRef<HTMLElement>(null)

  const sourceCoins = useMemo(() => {
    if (view === 'ranking') return coins

    if (view === 'favorites') {
      return favorites.map((fav) => {
        const ranked = findRankedCoin(coins, { coinId: fav.coinId, symbol: fav.symbol })
        return marketCoinFromFavorite(fav, ranked)
      })
    }

    return portfolioEntries.map((entry) => {
      const ranked = findRankedCoin(coins, { symbol: entry.symbol })
      return marketCoinFromEntry(entry, ranked)
    })
  }, [view, coins, favorites, portfolioEntries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sourceCoins
    return sourceCoins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    )
  }, [sourceCoins, search])

  useEffect(() => {
    setPage(1)
  }, [search, view, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageStart = (safePage - 1) * pageSize
  const visible = filtered.slice(pageStart, pageStart + pageSize)
  const isSearching = search.trim().length > 0

  function goToPage(next: number) {
    setPage(next)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(1)
  }

  const subtitle = useMemo(() => {
    if (view === 'favorites') {
      return isSearching
        ? `${filtered.length} favorito(s) encontrado(s)`
        : `${favorites.length} moeda(s) nos favoritos · coração para remover`
    }
    if (view === 'portfolio') {
      return isSearching
        ? `${filtered.length} no portfólio (busca)`
        : `${portfolioEntries.length} moeda(s) com compras registradas · atualiza ao adicionar no Portfólio`
    }
    return isSearching
      ? `${filtered.length} resultado(s) · busca em todo o ranking`
      : `${filtered.length} moedas · coração = favorito · use as páginas abaixo`
  }, [view, isSearching, filtered.length, favorites.length, portfolioEntries.length])

  const title =
    view === 'ranking'
      ? `Top ${TOP_MARKETS} — Market Cap`
      : view === 'favorites'
        ? 'Favoritos'
        : 'Portfólio'

  return (
    <section
      ref={sectionRef}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]"
    >
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                type="search"
                placeholder="BTC, Ethereum..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)] sm:w-52"
              />
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:bg-[var(--color-panel-hover)] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                view === tab.id
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]'
              }`}
            >
              {tab.label}
              {tab.id === 'favorites' && favorites.length > 0 && (
                <span className="ml-1.5 opacity-80">({favorites.length})</span>
              )}
              {tab.id === 'portfolio' && portfolioEntries.length > 0 && (
                <span className="ml-1.5 opacity-80">({portfolioEntries.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && view === 'ranking' && (
        <p className="px-5 py-3 text-sm text-[var(--color-danger)]">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
              <th className="w-16 px-3 py-3 font-medium" />
              <th className="px-3 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Moeda</th>
              <th className="px-5 py-3 font-medium text-right">Preço</th>
              <th className="px-5 py-3 font-medium text-right">24h</th>
              <th className="px-5 py-3 font-medium text-right">Market Cap</th>
              <th className="px-5 py-3 font-medium text-right">Volume</th>
              <th className="px-5 py-3 text-center font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && view === 'ranking' && coins.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-[var(--color-muted)]">
                  Carregando ranking (top {TOP_MARKETS})...
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-[var(--color-muted)]">
                  {view === 'favorites' && (
                    <>
                      Nenhum favorito ainda. No ranking, clique no{' '}
                      <Heart className="inline h-3.5 w-3.5 text-pink-400" /> para acompanhar moedas.
                    </>
                  )}
                  {view === 'portfolio' && (
                    <>
                      Nenhuma moeda no portfólio.{' '}
                      {onGoPortfolio && (
                        <button
                          type="button"
                          onClick={onGoPortfolio}
                          className="text-[var(--color-accent)] hover:underline"
                        >
                          Registrar compras no Portfólio
                        </button>
                      )}
                    </>
                  )}
                  {view === 'ranking' &&
                    (isSearching
                      ? `Nenhuma moeda encontrada para "${search}"`
                      : 'Nenhuma moeda para exibir')}
                </td>
              </tr>
            ) : (
              visible.map((coin) => {
                const live = getLivePrice(livePrices, coin.symbol)
                const price = toNum(live?.price ?? coin.current_price)
                const change = toNum(
                  live?.change24h ?? coin.price_change_percentage_24h,
                )
                const isUp = change >= 0
                const favorited = isFavorite(coin.symbol)
                const inPortfolio = isInPortfolio(coin.symbol)

                return (
                  <tr
                    key={`${view}-${coin.id}-${coin.symbol}`}
                    className="cursor-pointer border-b border-[var(--color-border)]/50 transition hover:bg-[var(--color-panel-hover)]"
                    onClick={() => onOpenCoin(coin.id)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(coin)}
                          className={
                            favorited
                              ? 'text-pink-400'
                              : 'text-[var(--color-muted)] hover:text-pink-400'
                          }
                          aria-label={
                            favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
                          }
                        >
                          <Heart
                            className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`}
                          />
                        </button>
                        {inPortfolio && (
                          <span
                            className="text-[var(--color-warning)]"
                            title="No portfólio (compras registradas)"
                          >
                            <Wallet className="h-4 w-4 fill-current/20" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[var(--color-muted)]">
                      {coin.market_cap_rank > 0 ? coin.market_cap_rank : '—'}
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
                            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">{formatPrice(price)}</td>
                    <td
                      className={`px-5 py-3 text-right font-mono ${isUp ? 'positive' : 'negative'}`}
                    >
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
                      {coin.market_cap > 0 ? formatCompact(coin.market_cap) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--color-muted)]">
                      {coin.total_volume > 0 ? formatCompact(coin.total_volume) : '—'}
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenCoin(coin.id)}
                          className="rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
                        >
                          <LineChart className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCreateAlert(coin.symbol, coin.name, price)}
                          className="rounded-md border border-[var(--color-accent)]/40 px-2 py-1 text-xs text-[var(--color-accent)]"
                        >
                          + Alerta
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <MarketTablePagination
          totalItems={filtered.length}
          page={safePage}
          pageSize={pageSize}
          pageSizeOptions={RANKING_PAGE_SIZE_OPTIONS}
          onPageChange={goToPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </section>
  )
}
