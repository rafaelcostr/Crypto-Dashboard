import { useEffect, useState } from 'react'
import { connectBinanceTicker } from '../api/binance'
import type { LivePrice } from '../types'

export function useLivePrices() {
  const [prices, setPrices] = useState<Map<string, LivePrice>>(new Map())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    setConnected(true)
    const disconnect = connectBinanceTicker((updated) => {
      setPrices(updated)
    })
    return () => {
      disconnect()
      setConnected(false)
    }
  }, [])

  return { prices, connected }
}
