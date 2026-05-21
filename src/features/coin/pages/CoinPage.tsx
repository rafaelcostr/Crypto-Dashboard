import {
  ArrowLeft,
  LineChart,
  Newspaper,
  RefreshCw,
  ShoppingCart,
  Heart,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CoinMarketsTable } from '@/features/coin/components/CoinMarketsTable'
import { CoinNewsList } from '@/features/coin/components/CoinNewsList'
import { CoinTradingChart } from '@/features/coin/components/CoinTradingChart'
import { useMarketsContext } from '@/features/markets/context/MarketsContext'
import { useCoinPage } from '@/features/coin/hooks/useCoinPage'
import { useLivePrices } from '@/features/markets/hooks/useLivePrices'
import { useFavorites } from '@/features/markets/context/FavoritesContext'
import { usePortfolioPurchases } from '@/features/portfolio/hooks/usePortfolioPurchases'
import { formatCompact, formatPercent, formatPrice } from '@/shared/utils/format'

type CoinTab = 'chart' | 'markets' | 'news'

const TABS: { id: CoinTab; label: string; icon: typeof LineChart }[] = [
  { id: 'chart', label: 'Gráfico', icon: LineChart },
  { id: 'markets', label: 'Onde comprar', icon: ShoppingCart },
  { id: 'news', label: 'Notícias', icon: Newspaper },
]

export function CoinPage() {
  const { coinId } = useParams<{ coinId: string }>()
  const navigate = useNavigate()
  const { coins } = useMarketsContext()
  const [tab, setTab] = useState<CoinTab>('chart')

  const listCoin = coins.find((c) => c.id === coinId)
  const symbolForLive = listCoin?.symbol ?? coinId ?? ''
  const { prices } = useLivePrices(symbolForLive ? [symbolForLive] : [])

  const {
    coin,
    tickers,
    news,
    loading,
    loadingMarkets,
    loadingNews,
    error,
    livePrice,
    change24h,
    refresh,
  } = useCoinPage(coinId, prices)

  const { isFavorite, toggleFavorite } = useFavorites()
  const { isHeld: inPortfolio } = usePortfolioPurchases()
  const favorited = coin ? isFavorite(coin.symbol) : false
  const held = coin ? inPortfolio(coin.symbol) : false
  const isUp = change24h >= 0

  if (!coinId) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Moeda inválida.{' '}
        <Link to="/" className="text-[var(--color-accent)] hover:underline">
          Voltar ao dashboard
        </Link>
      </p>
    )
  }

  if (loading && !coin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-muted)]">
        Carregando {listCoin?.name ?? coinId}...
      </div>
    )
  }

  if (error && !coin) {
    return (
      <div className="space-y-4 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-panel)] p-6">
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Voltar ao ranking
        </button>
      </div>
    )
  }

  if (!coin) return null

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {coin.image && (
            <img
              src={coin.image}
              alt=""
              className="h-14 w-14 rounded-full border border-[var(--color-border)]"
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{coin.name}</h1>
              <span className="font-mono text-sm uppercase text-[var(--color-muted)]">
                {coin.symbol}
              </span>
              {coin.market_cap_rank > 0 && (
                <span className="rounded-md bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                  #{coin.market_cap_rank}
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-tight">
              {formatPrice(livePrice)}
            </p>
            <p
              className={`mt-0.5 flex items-center gap-1 font-mono text-sm ${isUp ? 'positive' : 'negative'}`}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercent(change24h)} (24h)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-panel-hover)]"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => coin && toggleFavorite(coin)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
              favorited
                ? 'border-pink-400/50 text-pink-400'
                : 'border-[var(--color-border)] hover:bg-[var(--color-panel-hover)]'
            }`}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
            {favorited ? 'Favorito' : 'Favoritar'}
          </button>
          {held && (
            <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-warning)]/40 px-3 py-2 text-sm text-[var(--color-warning)]">
              <Star className="h-4 w-4 fill-current" />
              No portfólio
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Market Cap" value={formatCompact(coin.market_cap)} />
        <Stat label="Volume 24h" value={formatCompact(coin.total_volume)} />
        <Stat
          label="Oferta circulante"
          value={
            coin.circulating_supply != null
              ? `${formatCompact(coin.circulating_supply)} ${coin.symbol.toUpperCase()}`
              : '—'
          }
        />
        <Stat
          label="Máx. 24h / Mín. 24h"
          value={`${formatPrice(coin.high_24h)} / ${formatPrice(coin.low_24h)}`}
        />
      </div>

      {coin.description && (
        <p className="line-clamp-4 text-sm leading-relaxed text-[var(--color-muted)]">
          {coin.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === id
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'chart' && <CoinTradingChart symbol={coin.symbol} />}
      {tab === 'markets' && (
        <CoinMarketsTable
          tickers={tickers}
          loading={loadingMarkets}
          symbol={coin.symbol.toUpperCase()}
        />
      )}
      {tab === 'news' && (
        <CoinNewsList
          articles={news}
          loading={loadingNews}
          symbol={coin.symbol.toUpperCase()}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium">{value}</p>
    </div>
  )
}
