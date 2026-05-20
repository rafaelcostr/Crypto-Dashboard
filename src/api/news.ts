import type { CryptoNews } from '../types'

interface CryptoCompareArticle {
  id: string
  title: string
  body: string
  url: string
  source_info: { name: string }
  imageurl?: string
  published_on: number
  categories: string
}

export async function fetchCryptoNews(limit = 12): Promise<CryptoNews[]> {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest`,
  )
  if (!res.ok) throw new Error(`Notícias: ${res.status}`)

  const json = (await res.json()) as {
    Data?: CryptoCompareArticle[]
  }

  return (json.Data ?? []).slice(0, limit).map((item) => ({
    id: String(item.id),
    title: item.title,
    body: item.body,
    url: item.url,
    source: item.source_info?.name ?? 'CryptoCompare',
    imageUrl: item.imageurl,
    publishedAt: item.published_on * 1000,
    categories: item.categories
      ? item.categories.split('|').filter(Boolean)
      : [],
  }))
}
