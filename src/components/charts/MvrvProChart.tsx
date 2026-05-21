import {
  BaselineSeries,
  ColorType,
  createChart,
  LineSeries,
  PriceScaleMode,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type Time,
} from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import type { ChartPoint } from '../../api/onchain'
import { useChartBackground } from '../../context/ChartThemeContext'
import { CHART_UI, MVRV_CHART_COLORS } from '../../data/chartThemes'
import { useChartCrosshair } from '../../hooks/useChartCrosshair'
import { ChartCrosshairLegend } from './ChartCrosshairLegend'

export interface MvrvProChartProps {
  zscore: ChartPoint[]
  mvrv: ChartPoint[]
  price: ChartPoint[]
  realized: ChartPoint[]
  height?: number
  loading?: boolean
  mode?: 'zscore' | 'ratio'
  chartRef?: React.RefObject<HTMLDivElement | null>
}

function toLineData(points: ChartPoint[]): LineData<Time>[] {
  return points.map((p) => ({ time: p.time as Time, value: p.value }))
}

export function MvrvProChart({
  zscore,
  mvrv,
  price,
  realized,
  height = 480,
  loading,
  mode = 'zscore',
  chartRef: externalRef,
}: MvrvProChartProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const chartWrapRef = externalRef ?? internalRef
  const plotRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const { chartBackground } = useChartBackground()
  const ui = CHART_UI[chartBackground]
  const colors = MVRV_CHART_COLORS[chartBackground]

  const [priceSeries, setPriceSeries] = useState<ISeriesApi<'Line'> | null>(null)
  const [realizedSeries, setRealizedSeries] = useState<ISeriesApi<'Line'> | null>(null)
  const [rightSeries, setRightSeries] = useState<ISeriesApi<'Line'> | null>(null)
  const [chartApi, setChartApi] = useState<IChartApi | null>(null)

  const rightData = mode === 'ratio' ? mvrv : zscore
  const topBand = mode === 'ratio' ? 3 : 7
  const bottomBand = mode === 'ratio' ? 1 : 0
  const rightLabel = mode === 'ratio' ? 'MVRV Ratio' : 'Z-Score'

  const { rows, dateLabel } = useChartCrosshair(
    chartApi,
    [
      ...(priceSeries
        ? [{ api: priceSeries, label: 'Preço BTC', color: colors.priceLine }]
        : []),
      ...(realizedSeries
        ? [{ api: realizedSeries, label: 'Realizado', color: colors.realizedLine }]
        : []),
      ...(rightSeries
        ? [{ api: rightSeries, label: rightLabel, color: colors.zscoreLine }]
        : []),
    ],
  )

  useEffect(() => {
    if (!plotRef.current || zscore.length === 0) return

    if (chartRef.current) chartRef.current.remove()

    const chart = createChart(plotRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: ui.bg },
        textColor: ui.text,
        fontFamily: 'Outfit, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: ui.grid },
        horzLines: { color: ui.grid },
      },
      rightPriceScale: {
        borderColor: ui.border,
        scaleMargins: { top: 0.08, bottom: 0.05 },
      },
      leftPriceScale: {
        borderColor: ui.border,
        scaleMargins: { top: 0.08, bottom: 0.05 },
        visible: true,
      },
      timeScale: { borderColor: ui.border, timeVisible: true },
    })

    chart.priceScale('left').applyOptions({ mode: PriceScaleMode.Logarithmic })

    const rightLineData = toLineData(rightData)

    const redZone = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: topBand },
      topFillColor1: colors.zoneTop,
      topFillColor2: colors.zoneTopFade,
      bottomFillColor1: 'transparent',
      bottomFillColor2: 'transparent',
      lineVisible: false,
      priceScaleId: 'right',
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    })
    redZone.setData(rightLineData)

    const greenZone = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: bottomBand },
      bottomFillColor1: colors.zoneBottom,
      bottomFillColor2: colors.zoneBottomFade,
      topFillColor1: 'transparent',
      topFillColor2: 'transparent',
      lineVisible: false,
      priceScaleId: 'right',
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    })
    greenZone.setData(rightLineData)

    const pSeries = chart.addSeries(LineSeries, {
      color: colors.priceLine,
      lineWidth: 2,
      priceScaleId: 'left',
      title: 'Preço',
    })
    pSeries.setData(toLineData(price))

    const rSeries = chart.addSeries(LineSeries, {
      color: colors.realizedLine,
      lineWidth: 2,
      priceScaleId: 'left',
      title: 'Realizado (MM200)',
    })
    rSeries.setData(toLineData(realized))

    const zSeries = chart.addSeries(LineSeries, {
      color: colors.zscoreLine,
      lineWidth: 2,
      priceScaleId: 'right',
      title: rightLabel,
    })
    zSeries.setData(rightLineData)

    chart.timeScale().fitContent()
    chartRef.current = chart
    setChartApi(chart)
    setPriceSeries(pSeries)
    setRealizedSeries(rSeries)
    setRightSeries(zSeries)

    const resize = () => {
      if (plotRef.current) chart.applyOptions({ width: plotRef.current.clientWidth })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.remove()
      chartRef.current = null
      setChartApi(null)
      setPriceSeries(null)
      setRealizedSeries(null)
      setRightSeries(null)
    }
  }, [zscore, mvrv, price, realized, height, chartBackground, ui, colors, mode, rightData, topBand, bottomBand, rightLabel])

  if (loading) {
    return (
      <div
        className={`animate-pulse rounded-lg border ${ui.skeletonBorder} ${ui.skeletonBg}`}
        style={{ height }}
      />
    )
  }

  if (zscore.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border text-sm ${ui.skeletonBorder} ${ui.skeletonBg} ${ui.mutedClass}`}
        style={{ height }}
      >
        Sem dados para exibir
      </div>
    )
  }

  const legendText =
    chartBackground === 'dark' ? 'text-[var(--color-muted)]' : 'text-gray-600'

  return (
    <div
      ref={chartWrapRef}
      className={`overflow-hidden rounded-lg border shadow-sm ${ui.panelBorder} ${ui.panelBg}`}
    >
      <div ref={plotRef} className="w-full" />
      <ChartCrosshairLegend dateLabel={dateLabel} rows={rows} className={ui.legendBorder} />
      <div
        className={`flex flex-wrap items-center justify-center gap-4 border-t px-4 py-3 text-xs ${ui.legendBorder} ${legendText}`}
      >
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-0.5 w-5 ${colors.legendPrice}`} />
          Preço BTC
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-0.5 w-5 ${colors.legendRealized}`} />
          Valor realizado (MM200)
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-0.5 w-5 ${colors.legendZscore}`} />
          {rightLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-5 rounded-sm ${colors.legendBuyZone}`} />
          Zona de compra
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-5 rounded-sm ${colors.legendTopZone}`} />
          Zona de topo
        </span>
      </div>
    </div>
  )
}
