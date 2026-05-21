import {
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type LineData,
  type Time,
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import type { ChartPoint } from '@/features/charts/api/onchain'

interface LineChartPanelProps {
  data: ChartPoint[]
  height?: number
  topBand?: number
  bottomBand?: number
  formatValue?: (v: number) => string
  loading?: boolean
}

export function LineChartPanel({
  data,
  height = 400,
  topBand,
  bottomBand,
  loading,
}: LineChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const styles = getComputedStyle(document.documentElement)
    const textColor = styles.getPropertyValue('--color-muted').trim() || '#8b9bb4'
    const borderColor = styles.getPropertyValue('--color-border').trim() || '#1e2736'
    const accent = styles.getPropertyValue('--color-accent').trim() || '#00d4aa'

    if (chartRef.current) {
      chartRef.current.remove()
    }

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
      },
      grid: {
        vertLines: { color: borderColor },
        horzLines: { color: borderColor },
      },
      rightPriceScale: { borderColor },
      timeScale: { borderColor },
    })

    const series = chart.addSeries(LineSeries, {
      color: accent,
      lineWidth: 2,
    })

    const lineData: LineData<Time>[] = data.map((d) => ({
      time: d.time as Time,
      value: d.value,
    }))
    series.setData(lineData)

    if (topBand != null) {
      series.createPriceLine({
        price: topBand,
        color: 'rgba(255, 77, 109, 0.7)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Topo',
      })
    }
    if (bottomBand != null) {
      series.createPriceLine({
        price: bottomBand,
        color: 'rgba(0, 212, 170, 0.7)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Fundo',
      })
    }

    chart.timeScale().fitContent()

    chartRef.current = chart

    const resize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      chart.remove()
      chartRef.current = null
    }
  }, [data, height, topBand, bottomBand])

  if (loading) {
    return (
      <div
        className="animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
        style={{ height }}
      />
    )
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-muted)]"
        style={{ height }}
      >
        Sem dados para exibir
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
    />
  )
}
