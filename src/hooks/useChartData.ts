import { useCallback, useEffect, useState } from 'react'
import {
  fetchBlockchainChart,
  fetchBtcDailyPrices,
  fetchEthDailyPrices,
  fetchFearGreedHistory,
  fetchMvrvZScoreData,
  fetchTxVolumeUsd,
  type ChartPoint,
} from '../api/onchain'
import { periodToBlockchainSpan, periodToDays, type ChartPeriodId } from '../constants'
import { formatApiError } from '../utils/apiError'

export function useChartData(chartId: string, period: ChartPeriodId = '2years') {
  const [data, setData] = useState<ChartPoint[]>([])
  const [extra, setExtra] = useState<Record<string, ChartPoint[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setExtra({})

    const days = periodToDays(period)
    const span = periodToBlockchainSpan(period)

    try {
      switch (chartId) {
        case 'mvrv-zscore': {
          const d = await fetchMvrvZScoreData(days)
          setData(d.zscore)
          setExtra({ mvrv: d.mvrv, price: d.price, realized: d.realized, zscore: d.zscore })
          break
        }
        case 'mvrv-ratio': {
          const d = await fetchMvrvZScoreData(days)
          setData(d.mvrv)
          setExtra({ mvrv: d.mvrv, price: d.price, realized: d.realized })
          break
        }
        case 'btc-price':
          setData(await fetchBtcDailyPrices(days))
          break
        case 'eth-price':
          setData(await fetchEthDailyPrices(days))
          break
        case 'hash-rate':
          setData(await fetchBlockchainChart('hash-rate', span))
          break
        case 'tx-volume':
          setData(await fetchTxVolumeUsd(span))
          break
        case 'n-transactions':
          setData(await fetchBlockchainChart('n-transactions', span))
          break
        case 'difficulty':
          setData(await fetchBlockchainChart('difficulty', span))
          break
        case 'fear-greed':
          setData(await fetchFearGreedHistory(Math.min(days, 365)))
          break
        default:
          throw new Error('Gráfico não encontrado')
      }
      setUpdatedAt(Date.now())
    } catch (e) {
      setError(formatApiError(e, 'Gráfico'))
      setData([])
    } finally {
      setLoading(false)
    }
  }, [chartId, period])

  useEffect(() => {
    load()
  }, [load])

  return { data, extra, loading, error, refresh: load, updatedAt }
}
