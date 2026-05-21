import type { FavoriteCoin, MarketCoin, WatchlistEntry } from '@/shared/types'

export function marketCoinFromFavorite(
  fav: FavoriteCoin,
  ranked?: MarketCoin,
): MarketCoin {
  if (ranked) return ranked
  return {
    id: fav.coinId,
    symbol: fav.symbol,
    name: fav.name,
    image: fav.image,
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 0,
    price_change_percentage_24h: 0,
    total_volume: 0,
    high_24h: 0,
    low_24h: 0,
  }
}

export function marketCoinFromEntry(
  entry: WatchlistEntry,
  ranked?: MarketCoin,
): MarketCoin {
  if (ranked) return ranked
  return {
    id: entry.symbol.toLowerCase(),
    symbol: entry.symbol,
    name: entry.name,
    image: entry.image,
    current_price: entry.avgBuyPrice,
    market_cap: 0,
    market_cap_rank: 0,
    price_change_percentage_24h: 0,
    total_volume: 0,
    high_24h: 0,
    low_24h: 0,
  }
}

export function findRankedCoin(
  coins: MarketCoin[],
  opts: { coinId?: string; symbol?: string },
): MarketCoin | undefined {
  const sym = opts.symbol?.toUpperCase()
  if (opts.coinId) {
    const byId = coins.find((c) => c.id === opts.coinId)
    if (byId) return byId
  }
  if (sym) return coins.find((c) => c.symbol.toUpperCase() === sym)
  return undefined
}
