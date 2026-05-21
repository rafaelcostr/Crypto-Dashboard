import type { CoinTicker, MarketCoin } from '../types'

/** Proxy no dev evita CORS; em prod usa API direta com cache no hook */
const BASE = import.meta.env.DEV
  ? '/api/coingecko'
  : 'https://api.coingecko.com/api/v3'

type CoinGeckoMarketRaw = Omit<
  MarketCoin,
  'current_price' | 'market_cap' | 'price_change_percentage_24h' | 'total_volume' | 'high_24h' | 'low_24h'
> & {
  current_price: number | null
  market_cap: number | null
  price_change_percentage_24h: number | null
  total_volume: number | null
  high_24h: number | null
  low_24h: number | null
}

function normalizeCoin(raw: CoinGeckoMarketRaw): MarketCoin {
  return {
    ...raw,
    current_price: raw.current_price ?? 0,
    market_cap: raw.market_cap ?? 0,
    price_change_percentage_24h: raw.price_change_percentage_24h ?? 0,
    total_volume: raw.total_volume ?? 0,
    high_24h: raw.high_24h ?? 0,
    low_24h: raw.low_24h ?? 0,
  }
}

export async function fetchMarketRanking(
  perPage = 100,
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
  if (res.status === 429) {
    throw new Error(
      'CoinGecko: limite de requisições (429). Aguarde 1 minuto e atualize.',
    )
  }
  if (!res.ok) throw new Error(`CoinGecko: ${res.status}`)
  const data = (await res.json()) as CoinGeckoMarketRaw[]
  return data.map(normalizeCoin)
}

/** Busca top N moedas (paginação automática, até 250 por página — limite CoinGecko) */
export async function fetchMarketRankingTop(total = 1000): Promise<MarketCoin[]> {
  const perPage = 250
  const pages = Math.ceil(total / perPage)
  const all: MarketCoin[] = []

  for (let page = 1; page <= pages; page++) {
    const batch = await fetchMarketRanking(perPage, page)
    all.push(...batch)
    if (batch.length < perPage) break
    if (page < pages) {
      await new Promise((r) => setTimeout(r, 900))
    }
  }

  return all.slice(0, total)
}

export interface CoinDetailData {
  id: string
  symbol: string
  name: string
  image: string
  description: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  total_volume: number
  high_24h: number
  low_24h: number
  circulating_supply: number | null
  total_supply: number | null
  max_supply: number | null
}

export async function fetchCoinDetail(coinId: string): Promise<CoinDetailData> {
  const params = new URLSearchParams({
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
  })
  const res = await fetch(`${BASE}/coins/${coinId}?${params}`)
  if (res.status === 429) {
    throw new Error('CoinGecko: limite de requisições (429). Aguarde e tente novamente.')
  }
  if (!res.ok) throw new Error(`CoinGecko: ${res.status}`)

  const raw = (await res.json()) as {
    id: string
    symbol: string
    name: string
    image?: { large?: string; small?: string }
    description?: { en?: string; pt?: string }
    market_cap_rank?: number
    market_data?: {
      current_price?: Record<string, number>
      market_cap?: Record<string, number>
      price_change_percentage_24h?: number
      total_volume?: Record<string, number>
      high_24h?: Record<string, number>
      low_24h?: Record<string, number>
      circulating_supply?: number
      total_supply?: number
      max_supply?: number
    }
  }

  const md = raw.market_data
  const desc = raw.description?.pt || raw.description?.en || ''

  return {
    id: raw.id,
    symbol: raw.symbol,
    name: raw.name,
    image: raw.image?.large ?? raw.image?.small ?? '',
    description: desc.replace(/<[^>]+>/g, '').slice(0, 800),
    current_price: md?.current_price?.usd ?? 0,
    market_cap: md?.market_cap?.usd ?? 0,
    market_cap_rank: raw.market_cap_rank ?? 0,
    price_change_percentage_24h: md?.price_change_percentage_24h ?? 0,
    total_volume: md?.total_volume?.usd ?? 0,
    high_24h: md?.high_24h?.usd ?? 0,
    low_24h: md?.low_24h?.usd ?? 0,
    circulating_supply: md?.circulating_supply ?? null,
    total_supply: md?.total_supply ?? null,
    max_supply: md?.max_supply ?? null,
  }
}

export async function fetchCoinTickers(coinId: string): Promise<CoinTicker[]> {
  const res = await fetch(`${BASE}/coins/${coinId}/tickers?include_exchange_logo=false`)
  if (!res.ok) throw new Error(`CoinGecko tickers: ${res.status}`)

  const json = (await res.json()) as {
    tickers?: {
      market?: { name?: string }
      base?: string
      target?: string
      last?: number
      converted_volume?: { usd?: number }
      volume?: number
      bid_ask_spread_percentage?: number
      trust_score?: string
      trade_url?: string
    }[]
  }

  return (json.tickers ?? [])
    .filter((t) => t.market?.name && t.last != null)
    .map((t) => ({
      exchange: t.market!.name!,
      pair: `${(t.base ?? '').toUpperCase()}/${(t.target ?? '').toUpperCase()}`,
      price: t.last ?? 0,
      volume24h: t.converted_volume?.usd ?? t.volume ?? 0,
      spread: t.bid_ask_spread_percentage ?? null,
      trustScore: t.trust_score ?? 'unknown',
      tradeUrl: t.trade_url ?? null,
    }))
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 25)
}

export async function fetchCoinPrice(coinId: string): Promise<number> {
  const res = await fetch(
    `${BASE}/simple/price?ids=${coinId}&vs_currencies=usd`,
  )
  if (!res.ok) throw new Error(`CoinGecko price: ${res.status}`)
  const data = (await res.json()) as Record<string, { usd: number }>
  return data[coinId]?.usd ?? 0
}
