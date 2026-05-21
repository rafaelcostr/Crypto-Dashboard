import { useCallback, useEffect, useState } from 'react'
import { fetchMarketRankingTop } from '../api/coingecko'
import { TOP_MARKETS } from '../constants'
import type { MarketCoin } from '../types'
import {
  readCacheStale,
  readMarketsCache,
  writeMarketsCache,
} from '../utils/cache'
import { formatApiError } from '../utils/apiError'

/** Atualização em background só depois deste intervalo */
const REFRESH_MS = 8 * 60 * 1000
const CACHE_KEY = 'crypto-dashboard-markets-1000'
/** Dados considerados “frescos” — evita bater na API a cada abertura */
const CACHE_TTL_MS = 10 * 60 * 1000

function initialCoins(): MarketCoin[] {
  return readMarketsCache<MarketCoin[]>(CACHE_KEY, CACHE_TTL_MS) ?? []
}

export function useMarkets(perPage = TOP_MARKETS) {
  const [coins, setCoins] = useState<MarketCoin[]>(initialCoins)
  const [loading, setLoading] = useState(() => initialCoins().length === 0)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(
    async (force = false) => {
      const fresh = readMarketsCache<MarketCoin[]>(CACHE_KEY, CACHE_TTL_MS)
      if (fresh?.length) {
        setCoins(fresh)
        setLoading(false)
        if (!force) return
      } else if (!force) {
        setLoading(true)
      }

      try {
        setError(null)
        const data = await fetchMarketRankingTop(perPage)
        setCoins(data)
        writeMarketsCache(CACHE_KEY, data)
        setUpdatedAt(Date.now())
      } catch (e) {
        const stale = readCacheStale<MarketCoin[]>(CACHE_KEY)
        if (stale?.length) {
          setCoins(stale)
          setError(
            'Exibindo última lista salva — CoinGecko limitou requisições (429). Aguarde ~1 min e clique em Atualizar.',
          )
        } else if (!fresh?.length) {
          setError(formatApiError(e, 'CoinGecko'))
        }
      } finally {
        setLoading(false)
      }
    },
    [perPage],
  )

  useEffect(() => {
    void load(false)
    const id = setInterval(() => void load(false), REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return {
    coins,
    loading,
    error,
    refresh: () => load(true),
    updatedAt,
  }
}
