import { useCallback, useEffect, useState } from 'react'
import { fetchCryptoNews } from '../api/news'
import type { CryptoNews } from '../types'

export function useNews(limit = 12) {
  const [articles, setArticles] = useState<CryptoNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchCryptoNews(limit)
      setArticles(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar notícias')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
  }, [load])

  return { articles, loading, error, refresh: load }
}
