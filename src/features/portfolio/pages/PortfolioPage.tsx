import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertsPanel } from '@/features/portfolio/components/AlertsPanel'
import { PortfolioAddCoin } from '@/features/portfolio/components/PortfolioAddCoin'
import { PortfolioCharts, type AllocationSlice } from '@/features/portfolio/components/PortfolioCharts'
import { PortfolioHistoryChart } from '@/features/portfolio/components/PortfolioHistoryChart'
import { PortfolioMonthlyChart } from '@/features/portfolio/components/PortfolioMonthlyChart'
import { WatchlistPanel } from '@/features/portfolio/components/WatchlistPanel'
import { useMarketsContext } from '@/features/markets/context/MarketsContext'
import { TOP_LIVE_WS_SYMBOLS } from '@/shared/constants'
import { getLivePrice } from '@/features/markets/api/binance'
import { useAlerts } from '@/features/portfolio/hooks/useAlerts'
import { useLivePrices } from '@/features/markets/hooks/useLivePrices'
import { usePortfolioPurchases } from '@/features/portfolio/hooks/usePortfolioPurchases'
import { downloadCsv, downloadJson } from '@/shared/utils/exportData'
import { appendPortfolioSnapshot, loadPortfolioHistory } from '@/shared/utils/portfolioHistory'

export function PortfolioPage() {
  const { coins } = useMarketsContext()
  const {
    purchases,
    entries,
    registerPurchase,
    removePurchase,
    removeSymbol,
    updateEntry,
    isHeld,
  } = usePortfolioPurchases()
  const symbols = useMemo(() => {
    const fromRanking = coins.slice(0, TOP_LIVE_WS_SYMBOLS).map((c) => c.symbol)
    const held = entries.map((e) => e.symbol)
    return [...new Set([...fromRanking, ...held])]
  }, [coins, entries])
  const { prices } = useLivePrices(symbols)
  const {
    alerts,
    history,
    addAlert,
    removeAlert,
    clearTriggered,
    clearHistory,
    notifications,
    dismissNotification,
    notifEnabled,
    requestNotificationPermission,
    canNotify,
  } = useAlerts(prices)

  const [portfolioHistory, setPortfolioHistory] = useState(loadPortfolioHistory)

  const location = useLocation()
  const [alertPreset, setAlertPreset] = useState<{
    symbol: string
    name: string
    price: number
  } | null>(null)

  useEffect(() => {
    const state = location.state as {
      preset?: { symbol: string; name: string; price: number }
    } | null
    if (state?.preset) setAlertPreset(state.preset)
  }, [location.state])

  const coinPrices = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of coins) m.set(c.symbol.toUpperCase(), c.current_price)
    return m
  }, [coins])

  const holdings = useMemo(() => {
    return entries.map((entry) => {
      const live = getLivePrice(prices, entry.symbol)
      const price = live?.price ?? coinPrices.get(entry.symbol.toUpperCase()) ?? 0
      const valueUsd = entry.quantity * price
      return { entry, price, valueUsd }
    })
  }, [entries, prices, coinPrices])

  const totalPortfolioUsd = useMemo(
    () => holdings.reduce((s, h) => s + h.valueUsd, 0),
    [holdings],
  )

  const allocationSlices = useMemo((): AllocationSlice[] => {
    const withValue = holdings.filter((h) => h.valueUsd > 0)
    const total = withValue.reduce((s, h) => s + h.valueUsd, 0)
    if (total <= 0) return []

    return withValue
      .map((h) => ({
        symbol: h.entry.symbol,
        name: h.entry.name,
        valueUsd: h.valueUsd,
        percent: (h.valueUsd / total) * 100,
      }))
      .sort((a, b) => b.valueUsd - a.valueUsd)
  }, [holdings])

  useEffect(() => {
    if (totalPortfolioUsd > 0 && entries.some((e) => e.quantity > 0)) {
      setPortfolioHistory(appendPortfolioSnapshot(totalPortfolioUsd))
    }
  }, [totalPortfolioUsd, entries])

  function exportPortfolioJson() {
    downloadJson('portfolio.json', {
      purchases,
      entries,
      exportedAt: new Date().toISOString(),
    })
  }

  function exportPortfolioCsv() {
    downloadCsv(
      'portfolio-compras.csv',
      ['data', 'symbol', 'quantity', 'priceUsd', 'totalUsd'],
      purchases.map((p) => [
        new Date(p.purchasedAt).toISOString().slice(0, 10),
        p.symbol,
        String(p.quantity),
        String(p.priceUsd),
        String(p.quantity * p.priceUsd),
      ]),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Minha carteira</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Sua conta · compras salvas na nuvem · gráfico em linha · pizza e colunas
          </p>
        </div>
        {purchases.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportPortfolioCsv}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-panel-hover)]"
            >
              <Download className="h-3.5 w-3.5" />
              CSV compras
            </button>
            <button
              type="button"
              onClick={exportPortfolioJson}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-panel-hover)]"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        )}
      </div>

      <PortfolioAddCoin
        coins={coins}
        livePrices={prices}
        onAdd={registerPurchase}
        isHeld={isHeld}
      />

      <PortfolioMonthlyChart
        purchases={purchases}
        onRemovePurchase={removePurchase}
      />

      {totalPortfolioUsd > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="text-sm text-[var(--color-muted)]">Patrimônio total estimado</p>
          <p className="text-3xl font-bold text-[var(--color-accent)]">
            {totalPortfolioUsd.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD',
            })}
          </p>
        </div>
      )}

      <PortfolioCharts slices={allocationSlices} />

      <WatchlistPanel
        entries={entries}
        livePrices={prices}
        coinPrices={coinPrices}
        onRemove={removeSymbol}
        onUpdate={updateEntry}
        readOnlyQuantity
      />

      {totalPortfolioUsd > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <p className="mb-2 text-sm font-medium">Evolução do patrimônio</p>
          <PortfolioHistoryChart history={portfolioHistory} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Alertas de preço</h2>
        <AlertsPanel
          alerts={alerts}
          history={history}
          notifications={notifications}
          onAdd={addAlert}
          onRemove={removeAlert}
          onClearTriggered={clearTriggered}
          onClearHistory={clearHistory}
          onDismissNotification={dismissNotification}
          preset={alertPreset}
          onClearPreset={() => setAlertPreset(null)}
          notifEnabled={notifEnabled}
          canNotify={canNotify}
          onEnableNotifications={requestNotificationPermission}
        />
      </div>
    </div>
  )
}
