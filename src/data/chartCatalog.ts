export interface ChartMeta {
  id: string
  name: string
  category: 'on-chain' | 'mercado'
  description: string
  interpretation: string
  bands?: { top: number; bottom: number; topLabel: string; bottomLabel: string }
}

export const CHART_CATALOG: ChartMeta[] = [
  {
    id: 'mvrv-zscore',
    name: 'MVRV Z-Score',
    category: 'on-chain',
    description:
      'Mede se o Bitcoin está extremamente caro ou barato vs. valor "realizado" (proxy: média móvel 200 dias). Inspirado no gráfico da Bitcoin Magazine Pro.',
    interpretation:
      'Z-Score acima de ~7 (faixa vermelha): possível topo de ciclo. Abaixo de ~0 (faixa verde): possível zona de acumulação. Não é aconselhamento financeiro.',
    bands: {
      top: 7,
      bottom: 0,
      topLabel: 'Sobrecompra histórica',
      bottomLabel: 'Subvalorização histórica',
    },
  },
  {
    id: 'mvrv-ratio',
    name: 'MVRV Ratio',
    category: 'on-chain',
    description:
      'Razão entre valor de mercado e valor realizado (proxy). Quanto maior, mais aquecido o mercado.',
    interpretation:
      'Valores altos indicam euforia; valores baixos indicam capitulação ou acumulação.',
  },
  {
    id: 'btc-price',
    name: 'Preço do Bitcoin',
    category: 'mercado',
    description: 'Preço spot USD histórico (Binance / Blockchain.com).',
    interpretation: 'Referência principal de tendência de mercado.',
  },
  {
    id: 'eth-price',
    name: 'Preço do Ethereum',
    category: 'mercado',
    description: 'Preço spot ETH/USD histórico (Binance).',
    interpretation: 'Tendência do segundo maior ativo do ecossistema.',
  },
  {
    id: 'hash-rate',
    name: 'Hash Rate (BTC)',
    category: 'on-chain',
    description: 'Poder computacional da rede Bitcoin (Blockchain.com).',
    interpretation: 'Hash rate em alta sugere confiança dos mineradores na rede.',
  },
  {
    id: 'difficulty',
    name: 'Dificuldade de Mineração',
    category: 'on-chain',
    description: 'Dificuldade de mineração Bitcoin (Blockchain.com).',
    interpretation: 'Ajustes refletem competição entre mineradores.',
  },
  {
    id: 'tx-volume',
    name: 'Volume de Transações (USD)',
    category: 'on-chain',
    description: 'Valor estimado transferido on-chain por dia.',
    interpretation: 'Atividade on-chain e uso da rede.',
  },
  {
    id: 'n-transactions',
    name: 'Nº de Transações / dia',
    category: 'on-chain',
    description: 'Quantidade de transações confirmadas na rede Bitcoin.',
    interpretation: 'Maior atividade indica mais uso da rede.',
  },
  {
    id: 'fear-greed',
    name: 'Medo e Ganância (histórico)',
    category: 'mercado',
    description: 'Índice de sentimento do mercado (0–100).',
    interpretation:
      '0–24 medo extremo · 25–49 medo · 50 neutro · 51–74 ganância · 75+ ganância extrema',
    bands: {
      top: 75,
      bottom: 25,
      topLabel: 'Ganância',
      bottomLabel: 'Medo',
    },
  },
]

export function getChartMeta(id: string): ChartMeta | undefined {
  return CHART_CATALOG.find((c) => c.id === id)
}
