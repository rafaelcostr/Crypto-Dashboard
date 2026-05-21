export type ChartBackground = 'light' | 'dark'

export interface ChartUiTheme {
  bg: string
  text: string
  grid: string
  border: string
  panelBorder: string
  panelBg: string
  titleClass: string
  mutedClass: string
  legendBorder: string
  skeletonBorder: string
  skeletonBg: string
}

export interface MvrvChartColors {
  priceLine: string
  realizedLine: string
  zscoreLine: string
  zoneTop: string
  zoneTopFade: string
  zoneBottom: string
  zoneBottomFade: string
  legendPrice: string
  legendRealized: string
  legendZscore: string
  legendBuyZone: string
  legendTopZone: string
}

export const CHART_UI: Record<ChartBackground, ChartUiTheme> = {
  light: {
    bg: '#ffffff',
    text: '#374151',
    grid: '#e5e7eb',
    border: '#d1d5db',
    panelBorder: 'border-gray-200',
    panelBg: 'bg-white',
    titleClass: 'text-gray-700',
    mutedClass: 'text-gray-500',
    legendBorder: 'border-gray-100',
    skeletonBorder: 'border-gray-200',
    skeletonBg: 'bg-white',
  },
  dark: {
    bg: '#0f1419',
    text: '#9ca3af',
    grid: '#1e2736',
    border: '#2d3748',
    panelBorder: 'border-[var(--color-border)]',
    panelBg: 'bg-[#0f1419]',
    titleClass: 'text-[var(--color-text)]',
    mutedClass: 'text-[var(--color-muted)]',
    legendBorder: 'border-[var(--color-border)]',
    skeletonBorder: 'border-[var(--color-border)]',
    skeletonBg: 'bg-[#0f1419]',
  },
}

export const MVRV_CHART_COLORS: Record<ChartBackground, MvrvChartColors> = {
  light: {
    priceLine: '#111827',
    realizedLine: '#2563eb',
    zscoreLine: '#ea580c',
    zoneTop: 'rgba(248, 113, 113, 0.35)',
    zoneTopFade: 'rgba(248, 113, 113, 0.12)',
    zoneBottom: 'rgba(74, 222, 128, 0.35)',
    zoneBottomFade: 'rgba(74, 222, 128, 0.1)',
    legendPrice: 'bg-gray-900',
    legendRealized: 'bg-blue-600',
    legendZscore: 'bg-orange-600',
    legendBuyZone: 'bg-green-300/60',
    legendTopZone: 'bg-red-300/60',
  },
  dark: {
    priceLine: '#f3f4f6',
    realizedLine: '#60a5fa',
    zscoreLine: '#fb923c',
    zoneTop: 'rgba(248, 113, 113, 0.4)',
    zoneTopFade: 'rgba(248, 113, 113, 0.15)',
    zoneBottom: 'rgba(74, 222, 128, 0.35)',
    zoneBottomFade: 'rgba(74, 222, 128, 0.12)',
    legendPrice: 'bg-gray-200',
    legendRealized: 'bg-blue-400',
    legendZscore: 'bg-orange-400',
    legendBuyZone: 'bg-green-500/50',
    legendTopZone: 'bg-red-500/50',
  },
}
