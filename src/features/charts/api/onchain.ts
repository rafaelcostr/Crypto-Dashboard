export interface ChartPoint {
  time: number
  value: number
}

export interface DualChartPoint {
  time: number
  primary: number
  secondary: number
}

const BINANCE = import.meta.env.DEV ? '/api/binance' : 'https://api.binance.com'

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
]

async function fetchSymbolFromBinance(
  symbol: string,
  days = 730,
): Promise<ChartPoint[]> {
  const limit = Math.min(Math.max(days, 30), 1000)
  const url = `${BINANCE}/api/v3/klines?symbol=${symbol}&interval=1d&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance histórico: ${res.status}`)

  const json = (await res.json()) as BinanceKline[]
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('Binance: dados vazios')
  }

  return json.map((k) => ({
    time: Math.floor(k[0] / 1000),
    value: parseFloat(k[4]),
  }))
}

const CHART_ALIASES: Record<string, string[]> = {
  'estimated-transaction-volume-usd': [
    'estimated-transaction-volume-usd',
    'estimated-transaction-volume',
  ],
}

const CHART_TIMESPANS = ['2years', '1year', '5years']

function parseBlockchainChart(json: {
  error?: string
  values?: { x: number; y: number }[]
}): ChartPoint[] {
  if (json.error) throw new Error(json.error)
  return (json.values ?? []).map((v) => ({
    time: Math.floor(v.x / 1000),
    value: v.y,
  }))
}

async function fetchBlockchainChartOnce(
  chartName: string,
  timespan: string,
): Promise<ChartPoint[]> {
  const qs = `timespan=${encodeURIComponent(timespan)}&format=json&sampled=true`
  const urls = [
    `/api/blockchain/charts/${encodeURIComponent(chartName)}?${qs}`,
    `/api/blockchain-chart?name=${encodeURIComponent(chartName)}&${qs}`,
  ]

  let lastError = `Blockchain chart ${chartName}: falha`

  for (const url of urls) {
    const res = await fetch(url)
    if (!res.ok) {
      lastError = `Blockchain chart ${chartName}: ${res.status}`
      continue
    }

    try {
      const json = (await res.json()) as {
        error?: string
        values?: { x: number; y: number }[]
      }
      const points = parseBlockchainChart(json)
      if (points.length > 0) return points
      lastError = `Blockchain chart ${chartName}: sem dados`
    } catch (e) {
      lastError = e instanceof Error ? e.message : lastError
    }
  }

  throw new Error(lastError)
}

export async function fetchBlockchainChart(
  chartName: string,
  timespan = '2years',
): Promise<ChartPoint[]> {
  const names = CHART_ALIASES[chartName] ?? [chartName]
  const spans = [timespan, ...CHART_TIMESPANS.filter((t) => t !== timespan)]

  let lastError = `Blockchain chart ${chartName}: falha`

  for (const name of names) {
    for (const span of spans) {
      try {
        return await fetchBlockchainChartOnce(name, span)
      } catch (e) {
        lastError = e instanceof Error ? e.message : lastError
      }
    }
  }

  throw new Error(lastError)
}

/** Volume on-chain em USD (Blockchain.com) */
export async function fetchTxVolumeUsd(
  timespan = '2years',
): Promise<ChartPoint[]> {
  return fetchBlockchainChart('estimated-transaction-volume-usd', timespan)
}

/** Histórico BTC — Binance (primário) ou Blockchain.com (fallback). */
export async function fetchBtcDailyPrices(days = 730): Promise<ChartPoint[]> {
  try {
    return await fetchSymbolFromBinance('BTCUSDT', days)
  } catch {
    const timespan = days > 500 ? '5years' : days > 365 ? '2years' : '1year'
    return await fetchBlockchainChart('market-price', timespan)
  }
}

export async function fetchEthDailyPrices(days = 730): Promise<ChartPoint[]> {
  return fetchSymbolFromBinance('ETHUSDT', days)
}

function sma(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}

function zScoreSeries(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  const std = Math.sqrt(variance) || 1
  return values.map((v) => (v - mean) / std)
}

/** MVRV aproximado: preço / média móvel 200d (proxy de valor realizado) */
export function computeMvrvSeries(prices: ChartPoint[]): {
  mvrv: ChartPoint[]
  zscore: ChartPoint[]
  realized: ChartPoint[]
} {
  const values = prices.map((p) => p.value)
  const avg200 = sma(values, 200)

  const mvrv: ChartPoint[] = prices.map((p, i) => ({
    time: p.time,
    value: avg200[i] > 0 ? p.value / avg200[i] : 1,
  }))

  const zValues = zScoreSeries(mvrv.map((m) => m.value))
  const zscore: ChartPoint[] = mvrv.map((m, i) => ({
    time: m.time,
    value: zValues[i],
  }))

  const realized: ChartPoint[] = prices.map((p, i) => ({
    time: p.time,
    value: avg200[i],
  }))

  return { mvrv, zscore, realized }
}

export async function fetchFearGreedHistory(limit = 365): Promise<ChartPoint[]> {
  const res = await fetch(`https://api.alternative.me/fng/?limit=${limit}&format=json`)
  if (!res.ok) throw new Error(`Fear & Greed: ${res.status}`)

  const json = (await res.json()) as {
    data?: { timestamp: string; value: string }[]
  }

  return (json.data ?? [])
    .map((d) => ({
      time: Number(d.timestamp),
      value: Number(d.value),
    }))
    .sort((a, b) => a.time - b.time)
}

export async function fetchMvrvZScoreData(days = 730): Promise<{
  zscore: ChartPoint[]
  mvrv: ChartPoint[]
  price: ChartPoint[]
  realized: ChartPoint[]
}> {
  const prices = await fetchBtcDailyPrices(days)
  const { mvrv, zscore, realized } = computeMvrvSeries(prices)
  return { zscore, mvrv, price: prices, realized }
}
