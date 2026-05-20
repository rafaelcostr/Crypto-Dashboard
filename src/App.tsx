import { useState } from 'react'
import { AlertsPanel } from './components/AlertsPanel'
import { Header } from './components/Header'
import { LiveTicker } from './components/LiveTicker'
import { MarketTable } from './components/MarketTable'
import { NewsFeed } from './components/NewsFeed'
import { useAlerts } from './hooks/useAlerts'
import { useLivePrices } from './hooks/useLivePrices'
import { useMarkets } from './hooks/useMarkets'
import { useNews } from './hooks/useNews'
import { useNewsSummary } from './hooks/useNewsSummary'

export default function App() {
  const { coins, loading, error, refresh } = useMarkets(50)
  const { prices, connected } = useLivePrices()
  const { articles, loading: newsLoading, error: newsError, refresh: refreshNews } = useNews()
  const { summaries, summarize, hasAiKey } = useNewsSummary()
  const {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    notifications,
    dismissNotification,
  } = useAlerts(prices)

  const [alertPreset, setAlertPreset] = useState<{
    symbol: string
    name: string
    price: number
  } | null>(null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Header wsConnected={connected} lastUpdate={loading ? undefined : 'atualizado'} />

      <div className="mt-6 space-y-6">
        <LiveTicker prices={prices} />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <MarketTable
            coins={coins}
            livePrices={prices}
            loading={loading}
            error={error}
            onRefresh={refresh}
            onCreateAlert={(symbol, name, price) =>
              setAlertPreset({ symbol, name, price })
            }
          />
          <AlertsPanel
            alerts={alerts}
            notifications={notifications}
            onAdd={addAlert}
            onRemove={removeAlert}
            onClearTriggered={clearTriggered}
            onDismissNotification={dismissNotification}
            preset={alertPreset}
            onClearPreset={() => setAlertPreset(null)}
          />
        </div>

        <NewsFeed
          articles={articles}
          loading={newsLoading}
          error={newsError}
          onRefresh={refreshNews}
          summaries={summaries}
          onSummarize={summarize}
          hasAiKey={hasAiKey}
        />
      </div>

      <footer className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-muted)]">
        Dados: CoinGecko (ranking) · Binance WebSocket (tempo real) · CryptoCompare (notícias).
        Não constitui aconselhamento financeiro.
      </footer>
    </div>
  )
}
