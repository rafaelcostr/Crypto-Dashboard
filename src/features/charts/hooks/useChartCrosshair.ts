import { useEffect, useState } from 'react'
import type { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'
import { formatPrice } from '@/shared/utils/format'

export interface CrosshairRow {
  label: string
  value: string
  color?: string
}

export function useChartCrosshair(
  chart: IChartApi | null,
  series: { api: ISeriesApi<SeriesType>; label: string; color?: string; format?: (v: number) => string }[],
) {
  const [rows, setRows] = useState<CrosshairRow[]>([])
  const [dateLabel, setDateLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!chart) return

    const handler = (param: { time?: Time; seriesData: Map<ISeriesApi<SeriesType>, unknown> }) => {
      if (!param.time) {
        setRows([])
        setDateLabel(null)
        return
      }

      let t: Date
      if (typeof param.time === 'number') {
        t = new Date(param.time * 1000)
      } else if (typeof param.time === 'string') {
        t = new Date(param.time)
      } else {
        t = new Date(Date.UTC(param.time.year, param.time.month - 1, param.time.day))
      }

      setDateLabel(
        t.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      )

      const next: CrosshairRow[] = []
      for (const s of series) {
        const raw = param.seriesData.get(s.api) as { value?: number } | undefined
        if (raw?.value == null) continue
        const fmt = s.format ?? ((v: number) => formatPrice(v))
        next.push({ label: s.label, value: fmt(raw.value), color: s.color })
      }
      setRows(next)
    }

    chart.subscribeCrosshairMove(handler)
    return () => chart.unsubscribeCrosshairMove(handler)
  }, [chart, series])

  return { rows, dateLabel }
}
