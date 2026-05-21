/** Total de moedas carregadas do ranking (CoinGecko) */
export const TOP_MARKETS = 1000

/** Máximo de pares no WebSocket Binance (evita URL gigante) */
export const TOP_LIVE_WS_SYMBOLS = 100

/** Tamanho padrão de página na tabela de ranking */
export const RANKING_PAGE_SIZE = 100

/** Opções do seletor "Mostrar N" (estilo CoinMarketCap) */
export const RANKING_PAGE_SIZE_OPTIONS = [50, 100] as const

export const CHART_PERIODS = [
  { id: '1year', label: '1 ano', days: 365, blockchainSpan: '1year' },
  { id: '2years', label: '2 anos', days: 730, blockchainSpan: '2years' },
  { id: '5years', label: '5 anos', days: 1825, blockchainSpan: '5years' },
  { id: 'all', label: 'Máximo', days: 1000, blockchainSpan: 'all' },
] as const

export type ChartPeriodId = (typeof CHART_PERIODS)[number]['id']

export function periodToDays(id: ChartPeriodId): number {
  return CHART_PERIODS.find((p) => p.id === id)?.days ?? 730
}

export function periodToBlockchainSpan(id: ChartPeriodId): string {
  return CHART_PERIODS.find((p) => p.id === id)?.blockchainSpan ?? '2years'
}

export const DASHBOARD_WIDGETS = [
  'ticker',
  'stats',
  'movers',
  'table',
] as const

export type DashboardWidgetId = (typeof DASHBOARD_WIDGETS)[number]
