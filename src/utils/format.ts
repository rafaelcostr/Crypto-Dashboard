export function toNum(value: number | null | undefined, fallback = 0): number {
  if (value == null || Number.isNaN(value)) return fallback
  return value
}

export function formatPrice(
  value: number | null | undefined,
  currency = 'USD',
): string {
  if (value == null || Number.isNaN(value)) return '—'
  if (value >= 1_000_000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value)
  }
  if (value >= 1) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  }).format(value)
}

export function formatSharePercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function symbolToBinancePair(symbol: string): string {
  return `${symbol.toUpperCase()}USDT`
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'agora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}
