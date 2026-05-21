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
import type { ChartPoint } from '@/features/charts/api/onchain'
import { useChartBackground } from '@/features/charts/context/ChartThemeContext'
import { CHART_UI } from '@/features/charts/data/chartThemes'
import { useChartCrosshair } from '@/features/charts/hooks/useChartCrosshair'
import {
  formatScaledChartValue,
  scaleChartPointsForLightweight,
} from '@/shared/utils/chartScale'
import { ChartCrosshairLegend } from './ChartCrosshairLegend'

interface LightChartPanelProps {
  data: ChartPoint[]
  title?: string
  color?: string
  height?: number
  topBand?: number
  bottomBand?: number
  loading?: boolean
  chartRef?: React.RefObject<HTMLDivElement | null>
}

export function LightChartPanel({
  data,
  title,
  color,
  height = 400,
  topBand,
  bottomBand,
  loading,
  chartRef: externalRef,
}: LightChartPanelProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const chartWrapRef = externalRef ?? internalRef
  const plotRef = useRef<HTMLDivElement>(null)
  const { chartBackground } = useChartBackground()
  const ui = CHART_UI[chartBackground]
  const lineColor = color ?? (chartBackground === 'dark' ? '#00d4aa' : '#059669')
  const [chartApi, setChartApi] = useState<IChartApi | null>(null)
  const [mainSeries, setMainSeries] = useState<ISeriesApi<'Line'> | null>(null)

  const { points: scaledData, divisor, unitLabel } = useMemo(
    () => scaleChartPointsForLightweight(data),
    [data],
  )

  const scaledTopBand =
    topBand != null && divisor !== 1 ? topBand / divisor : topBand
  const scaledBottomBand =
    bottomBand != null && divisor !== 1 ? bottomBand / divisor : bottomBand

  const valueFormat = (v: number) => formatScaledChartValue(v, divisor, unitLabel)

  const { rows, dateLabel } = useChartCrosshair(
    chartApi,
    mainSeries
      ? [
          {
            api: mainSeries,
            label: title ?? 'Valor',
            color: lineColor,
            format: valueFormat,
          },
        ]
      : [],
  )

  useEffect(() => {
    if (!plotRef.current || scaledData.length === 0) return

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
        formatter: (price: number) => valueFormat(price),
      },
    })
    series.setData(
      scaledData.map((d) => ({ time: d.time as Time, value: d.value })) as LineData<Time>[],
    )

    if (scaledTopBand != null) {
      series.createPriceLine({
        price: scaledTopBand,
        color: chartBackground === 'dark' ? 'rgba(255, 77, 109, 0.7)' : 'rgba(220, 38, 38, 0.7)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Topo',
      })
    }
    if (scaledBottomBand != null) {
      series.createPriceLine({
        price: scaledBottomBand,
        color: chartBackground === 'dark' ? 'rgba(0, 212, 170, 0.7)' : 'rgba(22, 163, 74, 0.7)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Fundo',
      })
    }

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
  }, [
    scaledData,
    height,
    lineColor,
    scaledTopBand,
    scaledBottomBand,
    chartBackground,
    ui,
    title,
    divisor,
    unitLabel,
  ])

  if (loading) {
    return (
      <div
        className={`animate-pulse rounded-lg border ${ui.skeletonBorder} ${ui.skeletonBg}`}
        style={{ height }}
      />
    )
  }

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border ${ui.skeletonBorder} ${ui.skeletonBg} ${ui.mutedClass}`}
        style={{ height }}
      >
        Sem dados
      </div>
    )
  }

  return (
    <div
      ref={chartWrapRef}
      className={`overflow-hidden rounded-lg border shadow-sm ${ui.panelBorder} ${ui.panelBg}`}
    >
      {(title || unitLabel) && (
        <p className={`border-b px-4 py-2 text-sm font-medium ${ui.legendBorder} ${ui.titleClass}`}>
          {title}
          {unitLabel && (
            <span className={`ml-2 text-xs font-normal ${ui.mutedClass}`}>
              · eixo em {unitLabel} (valor real no cursor)
            </span>
          )}
        </p>
      )}
      <div ref={plotRef} className="w-full" />
      <ChartCrosshairLegend
        dateLabel={dateLabel}
        rows={rows}
        className={ui.legendBorder}
      />
    </div>
  )
}
