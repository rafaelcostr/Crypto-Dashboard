import { toTradingViewSymbol } from '@/features/markets/api/binance'

interface CoinTradingChartProps {
  symbol: string
  height?: number
}

export function CoinTradingChart({ symbol, height = 480 }: CoinTradingChartProps) {
  const tvSymbol = encodeURIComponent(toTradingViewSymbol(symbol))
  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0f1419&studies=%5B%5D&theme=dark&style=1&timezone=America%2FSao_Paulo&withdateranges=1&showpopupbutton=1&locale=br&utm_source=crypto-dashboard&utm_medium=widget`

  return (
    <div
      className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ height }}
    >
      <iframe
        title={`Gráfico ${symbol}`}
        src={chartUrl}
        className="h-full w-full border-0"
        allowFullScreen
      />
    </div>
  )
}
