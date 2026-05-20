import type { LivePrice } from '../types'

const WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr'

const TRACKED_SYMBOLS = new Set([
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'POLUSDT',
  'LTCUSDT',
  'TRXUSDT',
  'ATOMUSDT',
  'UNIUSDT',
  'NEARUSDT',
  'APTUSDT',
  'ARBUSDT',
  'OPUSDT',
])

interface BinanceTicker {
  s: string
  c: string
  P: string
  v: string
}

export type PriceUpdateCallback = (prices: Map<string, LivePrice>) => void

export function connectBinanceTicker(onUpdate: PriceUpdateCallback): () => void {
  const prices = new Map<string, LivePrice>()
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false

  function connect() {
    ws = new WebSocket(WS_URL)

    ws.onmessage = (event) => {
      try {
        const tickers = JSON.parse(event.data as string) as BinanceTicker[]
        let changed = false

        for (const t of tickers) {
          if (!TRACKED_SYMBOLS.has(t.s)) continue
          const base = t.s.replace('USDT', '')
          prices.set(base, {
            symbol: base,
            price: parseFloat(t.c),
            change24h: parseFloat(t.P),
            volume: parseFloat(t.v),
          })
          changed = true
        }

        if (changed) onUpdate(new Map(prices))
      } catch {
        /* ignore malformed */
      }
    }

    ws.onclose = () => {
      if (!closed) {
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    ws.onerror = () => ws?.close()
  }

  connect()

  return () => {
    closed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
  }
}

export function getLivePrice(
  prices: Map<string, LivePrice>,
  symbol: string,
): LivePrice | undefined {
  return prices.get(symbol.toUpperCase())
}
