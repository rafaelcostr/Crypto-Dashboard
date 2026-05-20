export interface MarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  total_volume: number
  high_24h: number
  low_24h: number
}

export interface LivePrice {
  symbol: string
  price: number
  change24h: number
  volume: number
}

export type AlertCondition = 'above' | 'below'

export interface PriceAlert {
  id: string
  symbol: string
  name: string
  condition: AlertCondition
  targetPrice: number
  createdAt: number
  triggered?: boolean
  triggeredAt?: number
}

export interface CryptoNews {
  id: string
  title: string
  body: string
  url: string
  source: string
  imageUrl?: string
  publishedAt: number
  categories: string[]
}

export interface NewsSummary {
  articleId: string
  summary: string
  loading: boolean
  error?: string
  source: 'ai' | 'local'
}
