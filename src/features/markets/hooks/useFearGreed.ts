import { useCallback, useEffect, useState } from 'react'

export interface FearGreedData {
  value: number
  classification: string
  timestamp: number
}

export function useFearGreed() {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1')
      if (!res.ok) throw new Error('F&G indisponível')
      const json = (await res.json()) as {
        data?: { value: string; value_classification: string; timestamp: string }[]
      }
      const item = json.data?.[0]
      if (item) {
        setData({
          value: Number(item.value),
          classification: item.value_classification,
          timestamp: Number(item.timestamp) * 1000,
        })
      }
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30 * 60_000)
    return () => clearInterval(id)
  }, [load])

  return { data, loading }
}
