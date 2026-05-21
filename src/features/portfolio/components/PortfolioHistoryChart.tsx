import { ColorType, createChart, LineSeries, type Time } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import type { PortfolioSnapshot } from '@/shared/utils/portfolioHistory'

interface PortfolioHistoryChartProps {
  history: PortfolioSnapshot[]
  height?: number
}

export function PortfolioHistoryChart({ history, height = 200 }: PortfolioHistoryChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || history.length < 2) return

    const chart = createChart(ref.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b9bb4',
      },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1e2736' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
    })

    const series = chart.addSeries(LineSeries, {
      color: '#00d4aa',
      lineWidth: 2,
    })
    series.setData(
      history.map((h) => ({
        time: Math.floor(h.ts / 1000) as Time,
        value: h.totalUsd,
      })),
    )
    chart.timeScale().fitContent()

    const resize = () => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.remove()
    }
  }, [history, height])

  if (history.length < 2) {
    return (
      <p className="text-xs text-[var(--color-muted)]">
        Histórico disponível após alguns dias de uso do portfólio.
      </p>
    )
  }

  return <div ref={ref} className="w-full rounded-lg border border-[var(--color-border)]" />
}
