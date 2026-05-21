import type { LivePrice } from '../types'

const WS_BASE = 'wss://stream.binance.com:9443'

/** Símbolos CoinGecko que usam outro ticker na Binance */
const SYMBOL_ALIASES: Record<string, string> = {
  MATIC: 'POL',
}

interface BinanceTicker {
  s: string
  c: string
  P: string
  v: string
}

interface CombinedStreamMessage {
  stream?: string
  data?: BinanceTicker
}

export type WsStatus = 'connecting' | 'connected' | 'live' | 'error' | 'closed'

export type PriceUpdateCallback = (prices: Map<string, LivePrice>) => void
export type StatusCallback = (status: WsStatus, detail?: string) => void

export function toBinancePair(symbol: string): string | null {
  const upper = symbol.toUpperCase()
  if (upper === 'USDT' || upper === 'USDC' || upper === 'DAI') return null
  const base = SYMBOL_ALIASES[upper] ?? upper
  return `${base}USDT`
}

export function toTradingViewSymbol(symbol: string): string {
  const pair = toBinancePair(symbol)
  if (!pair) return 'BINANCE:BTCUSDT'
  return `BINANCE:${pair}`
}

function parseTicker(t: BinanceTicker, prices: Map<string, LivePrice>): boolean {
  if (!t.s?.endsWith('USDT')) return false
  const base = t.s.replace(/USDT$/, '')
  const price = parseFloat(t.c)
  const change24h = parseFloat(t.P)
  if (Number.isNaN(price)) return false

  prices.set(base, {
    symbol: base,
    price,
    change24h: Number.isNaN(change24h) ? 0 : change24h,
    volume: parseFloat(t.v) || 0,
  })
  return true
}

function buildStreamUrl(symbols: string[]): string | null {
  const streams = symbols
    .map((s) => toBinancePair(s))
    .filter((p): p is string => p != null)
    .map((p) => `${p.toLowerCase()}@ticker`)

  const unique = [...new Set(streams)]
  if (unique.length === 0) return null

  return `${WS_BASE}/stream?streams=${unique.join('/')}`
}

export function connectBinanceTicker(
  symbols: string[],
  onUpdate: PriceUpdateCallback,
  onStatus?: StatusCallback,
): () => void {
  const prices = new Map<string, LivePrice>()
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false
  let reconnectAttempt = 0

  function connect() {
    const url = buildStreamUrl(symbols)
    if (!url) {
      onStatus?.('error', 'Nenhum par USDT disponível')
      return
    }

    onStatus?.('connecting')
    ws = new WebSocket(url)

    ws.onopen = () => {
      reconnectAttempt = 0
      onStatus?.('connected')
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as
          | CombinedStreamMessage
          | BinanceTicker[]
          | BinanceTicker

        let changed = false

        if (Array.isArray(payload)) {
          for (const t of payload) {
            if (parseTicker(t, prices)) changed = true
          }
        } else if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
          if (parseTicker(payload.data, prices)) changed = true
        } else if (payload && typeof payload === 'object' && 's' in payload) {
          if (parseTicker(payload as BinanceTicker, prices)) changed = true
        }

        if (changed) {
          onStatus?.('live')
          onUpdate(new Map(prices))
        }
      } catch {
        onStatus?.('error', 'Erro ao processar mensagem')
      }
    }

    ws.onerror = () => {
      onStatus?.('error', 'Falha na conexão WebSocket')
      ws?.close()
    }

    ws.onclose = () => {
      if (closed) {
        onStatus?.('closed')
        return
      }
      reconnectAttempt += 1
      const delay = Math.min(1000 * reconnectAttempt, 10000)
      onStatus?.('connecting', `Reconectando em ${delay / 1000}s...`)
      reconnectTimer = setTimeout(connect, delay)
    }
  }

  connect()

  return () => {
    closed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
    onStatus?.('closed')
  }
}

export function getLivePrice(
  prices: Map<string, LivePrice>,
  symbol: string,
): LivePrice | undefined {
  const upper = symbol.toUpperCase()
  const alias = SYMBOL_ALIASES[upper] ?? upper
  return prices.get(alias) ?? prices.get(upper)
}
