import { Settings2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiveTicker } from '@/features/markets/components/LiveTicker'
import { MarketStats } from '@/features/markets/components/MarketStats'
import { MarketTable } from '@/features/markets/components/MarketTable'
import { TopMovers } from '@/features/markets/components/TopMovers'
import { useMarketsContext } from '@/features/markets/context/MarketsContext'
import { useDashboardLayout } from '@/features/charts/hooks/useDashboardLayout'
import { useFearGreed } from '@/features/markets/hooks/useFearGreed'
import { useLivePrices } from '@/features/markets/hooks/useLivePrices'
import { useFavorites } from '@/features/markets/context/FavoritesContext'
import { usePortfolioPurchases } from '@/features/portfolio/hooks/usePortfolioPurchases'
import { DASHBOARD_WIDGETS, RANKING_PAGE_SIZE, TOP_LIVE_WS_SYMBOLS, TOP_MARKETS } from '@/shared/constants'

const WIDGET_LABELS: Record<string, string> = {
  ticker: 'Ticker ao vivo',
  stats: 'Estatísticas',
  movers: 'Altas / Quedas',
  table: 'Tabela Top 1000',
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { coins, loading, error, refresh, updatedAt } = useMarketsContext()
  const symbols = useMemo(
    () => coins.slice(0, TOP_LIVE_WS_SYMBOLS).map((c) => c.symbol),
    [coins],
  )
  const { prices, status, statusDetail } = useLivePrices(symbols)
  const { data: fearGreed, loading: fngLoading } = useFearGreed()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const { entries: portfolioEntries, isHeld: isInPortfolio } = usePortfolioPurchases()
  const { isVisible, toggle: toggleWidget } = useDashboardLayout()
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)

  const { totalCap, btcDom } = useMemo(() => {
    const cap = coins.reduce((s, c) => s + (c.market_cap || 0), 0)
    const btc = coins.find((c) => c.symbol.toUpperCase() === 'BTC')
    const dom = btc && cap > 0 ? (btc.market_cap / cap) * 100 : undefined
    return { totalCap: cap, btcDom: dom }
  }, [coins])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mercado</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Top {TOP_MARKETS} por market cap (páginas de {RANKING_PAGE_SIZE}) · ao vivo top{' '}
            {TOP_LIVE_WS_SYMBOLS} ·{' '}
            <button
              type="button"
              onClick={() => navigate('/charts/mvrv-zscore')}
              className="text-[var(--color-accent)] hover:underline"
            >
              gráficos on-chain
            </button>
            {updatedAt && (
              <span className="ml-2 text-xs opacity-70">
                · atualizado{' '}
                {new Date(updatedAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWidgetSettings((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)]"
        >
          <Settings2 className="h-4 w-4" />
          Widgets
        </button>
      </div>

      {showWidgetSettings && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
          {DASHBOARD_WIDGETS.map((id) => (
            <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isVisible(id)}
                onChange={() => toggleWidget(id)}
              />
              {WIDGET_LABELS[id] ?? id}
            </label>
          ))}
        </div>
      )}

      {isVisible('ticker') && (
        <LiveTicker prices={prices} status={status} statusDetail={statusDetail} />
      )}

      {isVisible('stats') && (
        <MarketStats
          fearGreed={fearGreed}
          fearGreedLoading={fngLoading}
          totalMarketCap={totalCap}
          btcDominance={btcDom}
        />
      )}

      {isVisible('movers') && coins.length > 0 && <TopMovers coins={coins} />}

      {isVisible('table') && (
        <MarketTable
          coins={coins}
          livePrices={prices}
          loading={loading}
          error={error}
          onRefresh={refresh}
          onCreateAlert={(symbol, name, price) =>
            navigate('/portfolio', { state: { preset: { symbol, name, price } } })
          }
          onOpenCoin={(id) => navigate(`/coin/${id}`)}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          portfolioEntries={portfolioEntries}
          isInPortfolio={isInPortfolio}
          onGoPortfolio={() => navigate('/portfolio')}
        />
      )}

    </div>
  )
}
