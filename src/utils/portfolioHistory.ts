export interface PortfolioSnapshot {
  ts: number
  totalUsd: number
}

const KEY = 'crypto-dashboard-portfolio-history'
const MAX_POINTS = 90

export function loadPortfolioHistory(): PortfolioSnapshot[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PortfolioSnapshot[]) : []
  } catch {
    return []
  }
}

export function appendPortfolioSnapshot(totalUsd: number): PortfolioSnapshot[] {
  const history = loadPortfolioHistory()
  const last = history[history.length - 1]
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)

  if (last && last.ts >= dayStart.getTime()) {
    history[history.length - 1] = { ts: Date.now(), totalUsd }
  } else {
    history.push({ ts: Date.now(), totalUsd })
  }

  const trimmed = history.slice(-MAX_POINTS)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
  return trimmed
}
