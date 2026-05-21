import { useCallback, useEffect, useState } from 'react'
import { fetchCoinDetail, fetchCoinTickers, type CoinDetailData } from '@/features/markets/api/coingecko'
import { fetchCryptoNewsForCoin } from '@/features/news/api/news'
import { useMarketsContext } from '@/features/markets/context/MarketsContext'
import { getLivePrice } from '@/features/markets/api/binance'
import type { LivePrice } from '@/shared/types'
import type { CoinTicker, CryptoNews } from '@/shared/types'
import { formatApiError } from '@/shared/utils/apiError'

export function useCoinPage(coinId: string | undefined, livePrices: Map<string, LivePrice>) {
  const { coins } = useMarketsContext()
  const [coin, setCoin] = useState<CoinDetailData | null>(null)
  const [tickers, setTickers] = useState<CoinTicker[]>([])
  const [news, setNews] = useState<CryptoNews[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMarkets, setLoadingMarkets] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!coinId) return

    const fromList = coins.find((c) => c.id === coinId)
    setLoading(true)
    setError(null)

    let resolved: CoinDetailData | null = null

    try {
      resolved = await fetchCoinDetail(coinId)
      setCoin(resolved)
    } catch (e) {
      if (fromList) {
        resolved = {
          id: fromList.id,
          symbol: fromList.symbol,
          name: fromList.name,
          image: fromList.image,
          description: '',
          current_price: fromList.current_price,
          market_cap: fromList.market_cap,
          market_cap_rank: fromList.market_cap_rank,
          price_change_percentage_24h: fromList.price_change_percentage_24h,
          total_volume: fromList.total_volume,
          high_24h: fromList.high_24h,
          low_24h: fromList.low_24h,
          circulating_supply: null,
          total_supply: null,
          max_supply: null,
        }
        setCoin(resolved)
      } else {
        setError(formatApiError(e, 'Moeda'))
      }
    } finally {
      setLoading(false)
    }

    const sym = resolved?.symbol ?? fromList?.symbol ?? ''
    const name = resolved?.name ?? fromList?.name ?? coinId

    setLoadingMarkets(true)
    try {
      setTickers(await fetchCoinTickers(coinId))
    } catch {
      setTickers(buildFallbackTickers(sym || coinId))
    } finally {
      setLoadingMarkets(false)
    }

    setLoadingNews(true)
    try {
      setNews(await fetchCryptoNewsForCoin(sym, name, 12))
    } catch {
      setNews([])
    } finally {
      setLoadingNews(false)
    }
  }, [coinId, coins])

  useEffect(() => {
    load()
  }, [load])

  const livePrice = coin
    ? getLivePrice(livePrices, coin.symbol)?.price ?? coin.current_price
    : 0

  const change24h =
    coin && getLivePrice(livePrices, coin.symbol)?.change24h != null
      ? getLivePrice(livePrices, coin.symbol)!.change24h
      : coin?.price_change_percentage_24h ?? 0

  return {
    coin,
    tickers,
    news,
    loading,
    loadingMarkets,
    loadingNews,
    error,
    livePrice,
    change24h,
    refresh: load,
  }
}

function buildFallbackTickers(symbolOrId: string): CoinTicker[] {
  const sym = symbolOrId.length <= 6 ? symbolOrId.toUpperCase() : 'BTC'
  const exchanges = [
    { name: 'Binance', url: `https://www.binance.com/pt-BR/trade/${sym}_USDT` },
    { name: 'Coinbase', url: `https://www.coinbase.com/pt/price/${sym.toLowerCase()}` },
    { name: 'Kraken', url: `https://www.kraken.com/prices/${sym.toLowerCase()}` },
  ]
  return exchanges.map((e) => ({
    exchange: e.name,
    pair: `${sym}/USDT`,
    price: 0,
    volume24h: 0,
    spread: null,
    trustScore: 'yellow',
    tradeUrl: e.url,
  }))
}
