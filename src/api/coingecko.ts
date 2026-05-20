import type { MarketCoin } from '../types'

const BASE = 'https://api.coingecko.com/api/v3'

export async function fetchMarketRanking(
  perPage = 50,
  page = 1,
): Promise<MarketCoin[]> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: String(page),
    sparkline: 'false',
    price_change_percentage: '24h',
  })

  const res = await fetch(`${BASE}/coins/markets?${params}`)
  if (!res.ok) throw new Error(`CoinGecko: ${res.status}`)
  return res.json() as Promise<MarketCoin[]>
}

export async function fetchCoinPrice(coinId: string): Promise<number> {
  const res = await fetch(
    `${BASE}/simple/price?ids=${coinId}&vs_currencies=usd`,
  )
  if (!res.ok) throw new Error(`CoinGecko price: ${res.status}`)
  const data = (await res.json()) as Record<string, { usd: number }>
  return data[coinId]?.usd ?? 0
}
