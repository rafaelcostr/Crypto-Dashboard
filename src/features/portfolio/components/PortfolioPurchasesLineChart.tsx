import {
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type Time,
} from 'lightweight-charts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '@/shared/context/ThemeContext'
import { CHART_UI } from '@/features/charts/data/chartThemes'
import { useChartCrosshair } from '@/features/charts/hooks/useChartCrosshair'
import { formatPrice } from '@/shared/utils/format'
import { ChartCrosshairLegend } from '@/features/charts/components/ChartCrosshairLegend'

export interface PurchaseLinePoint {
  time: Time
  value: number
  label: string
}

interface PortfolioPurchasesLineChartProps {
  points: PurchaseLinePoint[]
  height?: number
  emptyMessage?: string
}

export function PortfolioPurchasesLineChart({
  points,
  height = 280,
  emptyMessage = 'Sem compras no período',
}: PortfolioPurchasesLineChartProps) {
  const plotRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const chartBackground = theme === 'dark' ? 'dark' : 'light'
  const ui = CHART_UI[chartBackground]
  const lineColor = chartBackground === 'dark' ? '#00d4aa' : '#059669'
  const [chartApi, setChartApi] = useState<IChartApi | null>(null)
  const [mainSeries, setMainSeries] = useState<ISeriesApi<'Line'> | null>(null)

  const hasData = useMemo(() => points.some((p) => p.value > 0), [points])

  const { rows, dateLabel } = useChartCrosshair(
    chartApi,
    mainSeries
      ? [
          {
            api: mainSeries,
            label: 'Investido',
            color: lineColor,
            format: (v) => formatPrice(v),
          },
        ]
      : [],
  )

  useEffect(() => {
    if (!plotRef.current || points.length === 0) return

    const chart = createChart(plotRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: ui.bg },
        textColor: ui.text,
      },
      grid: {
        vertLines: { color: ui.grid },
        horzLines: { color: ui.grid },
      },
      rightPriceScale: { borderColor: ui.border },
      timeScale: { borderColor: ui.border, timeVisible: true },
    })

    const series = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => formatPrice(price),
      },
    })

    const lineData: LineData<Time>[] = points.map((p) => ({
      time: p.time,
      value: p.value,
    }))
    series.setData(lineData)
    chart.timeScale().fitContent()

    setChartApi(chart)
    setMainSeries(series)

    const resize = () => {
      if (plotRef.current) chart.applyOptions({ width: plotRef.current.clientWidth })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.remove()
      setChartApi(null)
      setMainSeries(null)
    }
  }, [points, height, lineColor, ui])

  if (points.length === 0 || !hasData) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border ${ui.skeletonBorder} ${ui.skeletonBg} ${ui.mutedClass}`}
        style={{ height }}
      >
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-lg border ${ui.panelBorder} ${ui.panelBg}`}>
      <div ref={plotRef} className="w-full" />
      <ChartCrosshairLegend dateLabel={dateLabel} rows={rows} className={ui.legendBorder} />
    </div>
  )
}
