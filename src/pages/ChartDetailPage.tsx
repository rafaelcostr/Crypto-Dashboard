import { RefreshCw } from 'lucide-react'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ChartToolbar } from '../components/charts/ChartToolbar'
import { LightChartPanel } from '../components/charts/LightChartPanel'
import { MvrvProChart } from '../components/charts/MvrvProChart'
import { useChartBackground } from '../context/ChartThemeContext'
import { useChartPeriod } from '../context/ChartPeriodContext'
import { getChartMeta } from '../data/chartCatalog'
import { useChartData } from '../hooks/useChartData'

export function ChartDetailPage() {
  const { chartId = 'mvrv-zscore' } = useParams()
  const meta = getChartMeta(chartId)
  const { period } = useChartPeriod()
  const { data, extra, loading, error, refresh, updatedAt } = useChartData(chartId, period)
  const { chartBackground } = useChartBackground()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const isDark = chartBackground === 'dark'

  if (!meta) {
    return <p className="text-[var(--color-danger)]">Gráfico não encontrado.</p>
  }

  const isMvrvZ = chartId === 'mvrv-zscore'
  const isMvrvRatio = chartId === 'mvrv-ratio'

  const titleClass = isDark ? 'text-[var(--color-text)]' : 'text-gray-900'
  const descClass = isDark ? 'text-[var(--color-muted)]' : 'text-gray-600'
  const btnClass = isDark
    ? 'border-[var(--color-border)] bg-[var(--color-panel-hover)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  const errorClass = isDark
    ? 'border-red-500/30 bg-red-500/10 text-red-300'
    : 'border-red-200 bg-red-50 text-red-700'
  const bandTopClass = isDark
    ? 'border-red-500/30 bg-red-500/10 text-red-300'
    : 'border-red-200 bg-red-50 text-red-700'
  const bandBottomClass = isDark
    ? 'border-green-500/30 bg-green-500/10 text-green-300'
    : 'border-green-200 bg-green-50 text-green-700'
  const interpretClass = isDark
    ? 'border-[var(--color-border)] bg-[var(--color-panel-hover)] text-[var(--color-muted)]'
    : 'border-gray-200 bg-gray-50 text-gray-600'
  const interpretStrong = isDark ? 'text-[var(--color-text)]' : 'text-gray-900'
  const footnoteClass = isDark ? 'text-[var(--color-muted)]' : 'text-gray-500'
  const linkClass = isDark
    ? 'text-[var(--color-accent)] hover:underline'
    : 'text-emerald-600 hover:underline'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${titleClass}`}>{meta.name}</h2>
          <p className={`mt-1 text-sm ${descClass}`}>{meta.description}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 ${btnClass}`}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <ChartToolbar
        chartContainerRef={chartContainerRef}
        exportFilename={`${chartId}-${period}.png`}
        updatedAt={updatedAt}
        loading={loading}
      />

      {error && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${errorClass}`}>
          <p>{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-2 text-xs underline opacity-80"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div ref={chartContainerRef}>
        {isMvrvZ && extra.price && extra.realized && extra.mvrv ? (
          <MvrvProChart
            zscore={data}
            mvrv={extra.mvrv}
            price={extra.price}
            realized={extra.realized}
            loading={loading}
            mode="zscore"
          />
        ) : isMvrvRatio && extra.price && extra.realized && extra.mvrv ? (
          <MvrvProChart
            zscore={data}
            mvrv={extra.mvrv}
            price={extra.price}
            realized={extra.realized}
            loading={loading}
            mode="ratio"
          />
        ) : (
          <LightChartPanel
            data={data}
            loading={loading}
            height={420}
            topBand={meta.bands?.top}
            bottomBand={meta.bands?.bottom}
            color={
              chartId === 'fear-greed'
                ? isDark
                  ? '#fb923c'
                  : '#ea580c'
                : isDark
                  ? '#00d4aa'
                  : '#059669'
            }
          />
        )}
      </div>

      {meta.bands && !isMvrvZ && !isMvrvRatio && (
        <div className="flex flex-wrap gap-3 text-xs">
          <span className={`rounded-full border px-3 py-1 ${bandTopClass}`}>
            ▲ {meta.bands.topLabel}
          </span>
          <span className={`rounded-full border px-3 py-1 ${bandBottomClass}`}>
            ▼ {meta.bands.bottomLabel}
          </span>
        </div>
      )}

      <div className={`rounded-lg border p-4 text-sm leading-relaxed ${interpretClass}`}>
        <strong className={interpretStrong}>Como interpretar: </strong>
        {meta.interpretation}
      </div>

      {isMvrvZ && (
        <p className={`text-xs ${footnoteClass}`}>
          Layout inspirado em{' '}
          <a
            href="https://www.bitcoinmagazinepro.com/charts/mvrv-zscore/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Bitcoin Magazine Pro
          </a>
          . Valor realizado ≈ média móvel 200 dias · dados Binance.
        </p>
      )}
    </div>
  )
}
