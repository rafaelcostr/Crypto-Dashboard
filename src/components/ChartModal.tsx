import { X } from 'lucide-react'
import { useEffect } from 'react'
import { toTradingViewSymbol } from '../api/binance'

interface ChartModalProps {
  symbol: string
  name: string
  onClose: () => void
}

export function ChartModal({ symbol, name, onClose }: ChartModalProps) {
  const tvSymbol = encodeURIComponent(toTradingViewSymbol(symbol))
  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=0f1419&studies=%5B%5D&theme=dark&style=1&timezone=America%2FSao_Paulo&withdateranges=1&showpopupbutton=1&locale=br&utm_source=crypto-dashboard&utm_medium=widget`

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Gráfico ${name}`}
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="font-mono text-xs text-[var(--color-muted)]">
              {toTradingViewSymbol(symbol).replace('BINANCE:', '')} · TradingView
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] p-2 transition hover:bg-[var(--color-panel-hover)]"
            aria-label="Fechar gráfico"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <iframe
          title={`Gráfico ${name}`}
          src={chartUrl}
          className="min-h-0 flex-1 w-full border-0 bg-[var(--color-surface)]"
          allowFullScreen
        />
      </div>
    </div>
  )
}
