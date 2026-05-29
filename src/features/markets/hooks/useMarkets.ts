import { useCallback, useEffect, useState } from 'react'
import { fetchMarketRankingTop } from '@/features/markets/api/coingecko'
import { TOP_MARKETS } from '@/shared/constants'
import type { MarketCoin } from '@/shared/types'
import {
  readCacheStale,
  readMarketsCache,
  writeMarketsCache,
} from '@/shared/utils/cache'
import { formatApiError } from '@/shared/utils/apiError'

/** Atualização em background só depois deste intervalo */
const REFRESH_MS = 30 * 60 * 1000
const CACHE_KEY = 'crypto-dashboard-markets-1000'
/** Dados considerados “frescos” — evita bater na API a cada abertura */
const CACHE_TTL_MS = 45 * 60 * 1000
/** Após 429, não tenta de novo na rede por este período (usa cache) */
const RATE_LIMIT_COOLDOWN_MS = 3 * 60 * 1000

function initialCoins(): MarketCoin[] {
  return readMarketsCache<MarketCoin[]>(CACHE_KEY, CACHE_TTL_MS) ?? []
}

function readRateLimitCooldown(): boolean {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-cooldown`)
    if (!raw) return false
    return Date.now() - Number(raw) < RATE_LIMIT_COOLDOWN_MS
  } catch {
    return false
  }
}

function markRateLimitCooldown(): void {
  try {
    localStorage.setItem(`${CACHE_KEY}-cooldown`, String(Date.now()))
  } catch {
    /* ignore */
  }
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

      if (!force && readRateLimitCooldown()) {
        const stale = readCacheStale<MarketCoin[]>(CACHE_KEY)
        if (stale?.length) {
          setCoins(stale)
          setError(
            'Lista em cache — CoinGecko limitou requisições. Aguarde 2–3 min antes de atualizar.',
          )
          setLoading(false)
          return
        }
      }

      try {
        setError(null)
        const { coins: data, partial } = await fetchMarketRankingTop(perPage)
        setCoins(data)
        writeMarketsCache(CACHE_KEY, data)
        setUpdatedAt(Date.now())
        if (partial) {
          setError(
            `Exibindo top ${data.length} moedas — limite CoinGecko na página seguinte. Tente atualizar em 2 min.`,
          )
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        const is429 = msg.includes('429')
        if (is429) markRateLimitCooldown()

        const stale = readCacheStale<MarketCoin[]>(CACHE_KEY)
        if (stale?.length) {
          setCoins(stale)
          setError(
            is429
              ? 'Exibindo última lista salva — CoinGecko limitou requisições (429). Aguarde 2–3 min e clique em Atualizar.'
              : formatApiError(e, 'CoinGecko'),
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
