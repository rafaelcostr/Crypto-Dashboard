import { useCallback, useEffect, useState } from 'react'
import { fetchMarketRanking } from '../api/coingecko'
import type { MarketCoin } from '../types'

const REFRESH_MS = 60_000

export function useMarkets(perPage = 50) {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchMarketRanking(perPage)
      setCoins(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }, [perPage])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return { coins, loading, error, refresh: load }
}
