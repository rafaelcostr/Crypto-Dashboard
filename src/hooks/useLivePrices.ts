import { useEffect, useMemo, useState } from 'react'
import { connectBinanceTicker, type WsStatus } from '../api/binance'
import type { LivePrice } from '../types'

const DEFAULT_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'USDT', 'ADA', 'DOGE', 'AVAX', 'DOT',
  'LINK', 'MATIC', 'LTC', 'UNI', 'ATOM', 'NEAR', 'APT', 'ARB', 'OP',
]

export function useLivePrices(symbols: string[] = DEFAULT_SYMBOLS) {
  const [prices, setPrices] = useState<Map<string, LivePrice>>(new Map())
  const [status, setStatus] = useState<WsStatus>('connecting')
  const [statusDetail, setStatusDetail] = useState<string>()

  const symbolsKey = useMemo(
    () =>
      [...new Set(symbols.map((s) => s.toUpperCase()))]
        .sort()
        .join(','),
    [symbols],
  )

  useEffect(() => {
    setPrices(new Map())
    setStatus('connecting')

    const disconnect = connectBinanceTicker(
      symbolsKey ? symbolsKey.split(',') : DEFAULT_SYMBOLS,
      (updated) => setPrices(updated),
      (next, detail) => {
        setStatus(next)
        setStatusDetail(detail)
      },
    )

    return () => disconnect()
  }, [symbolsKey])

  const isLive = status === 'live' && prices.size > 0
  const isConnected = status === 'connected' || status === 'live'

  return { prices, status, statusDetail, isLive, isConnected }
}
