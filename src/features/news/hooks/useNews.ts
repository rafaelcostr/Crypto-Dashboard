import { useCallback, useEffect, useState } from 'react'
import { fetchCryptoNews } from '@/features/news/api/news'
import type { CryptoNews } from '@/shared/types'
import { readLocalCache, writeLocalCache } from '@/shared/utils/cache'
import { formatApiError } from '@/shared/utils/apiError'

const CACHE_KEY = 'crypto-dashboard-news-pt-v2'
const CACHE_TTL_MS = 5 * 60_000

export function useNews(limit = 18) {
  const [articles, setArticles] = useState<CryptoNews[]>(
    () => readLocalCache<CryptoNews[]>(CACHE_KEY, CACHE_TTL_MS) ?? [],
  )
  const [loading, setLoading] = useState(!readLocalCache(CACHE_KEY, CACHE_TTL_MS))
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(async () => {
    const cached = readLocalCache<CryptoNews[]>(CACHE_KEY, CACHE_TTL_MS)
    if (cached?.length) {
      setArticles(cached)
      setLoading(false)
    }

    try {
      setError(null)
      const data = await fetchCryptoNews(limit)
      setArticles(data)
      writeLocalCache(CACHE_KEY, data)
      setUpdatedAt(Date.now())
    } catch (e) {
      if (!cached?.length) {
        setError(formatApiError(e, 'Notícias'))
      }
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
  }, [load])

  return { articles, loading, error, refresh: load, updatedAt }
}
