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

export interface FavoriteCoin {
  coinId: string
  symbol: string
  name: string
  image: string
  addedAt: number
}

export interface LivePrice {
  symbol: string
  price: number
  change24h: number
  volume: number
}

export type AlertCondition = 'above' | 'below' | 'pct_up' | 'pct_down'

export interface PriceAlert {
  id: string
  symbol: string
  name: string
  condition: AlertCondition
  targetPrice: number
  /** Para pct_up / pct_down: variação % (ex: 5 = 5%) */
  percentChange?: number
  /** Janela em minutos para alerta percentual (ex: 60 = 1h) */
  windowMinutes?: number
  createdAt: number
  triggered?: boolean
  triggeredAt?: number
  /** Preço de referência ao criar alerta % */
  referencePrice?: number
}

export interface AlertHistoryEntry {
  id: string
  alertId?: string
  symbol: string
  name?: string
  message: string
  triggeredAt: number
}

export interface CryptoNews {
  id: string
  title: string
  body: string
  url: string
  source: string
  publishedAt: number
  categories: string[]
  imageUrl?: string
}

export interface NewsSummary {
  articleId: string
  summary: string
  loading: boolean
  source: 'ai' | 'local'
  error?: string
}

export interface CoinTicker {
  exchange: string
  pair: string
  price: number
  volume24h: number
  spread: number | null
  trustScore: string
  tradeUrl: string | null
}

export interface WatchlistEntry {
  symbol: string
  name: string
  image: string
  quantity: number
  avgBuyPrice: number
  addedAt: number
}

/** Registro de cada compra (data + quantidade) */
export interface PortfolioPurchase {
  id: string
  symbol: string
  name: string
  image: string
  quantity: number
  priceUsd: number
  purchasedAt: number
}
