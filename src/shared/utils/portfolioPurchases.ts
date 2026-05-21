import type { PortfolioPurchase, WatchlistEntry } from '@/shared/types'

const KEY = 'crypto-dashboard-purchases'
const MIGRATED_KEY = 'crypto-dashboard-purchases-migrated'

export function loadPurchases(): PortfolioPurchase[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PortfolioPurchase[]) : []
  } catch {
    return []
  }
}

export function savePurchases(purchases: PortfolioPurchase[]): void {
  localStorage.setItem(KEY, JSON.stringify(purchases))
  window.dispatchEvent(new Event('crypto-dashboard-purchases-updated'))
}

export function addPurchase(
  data: Omit<PortfolioPurchase, 'id'>,
): PortfolioPurchase {
  const purchase: PortfolioPurchase = {
    ...data,
    id: crypto.randomUUID(),
    symbol: data.symbol.toUpperCase(),
  }
  const next = [...loadPurchases(), purchase]
  savePurchases(next)
  return purchase
}

export function removePurchase(id: string): PortfolioPurchase[] {
  const next = loadPurchases().filter((p) => p.id !== id)
  savePurchases(next)
  return next
}

export function removePurchasesBySymbol(symbol: string): PortfolioPurchase[] {
  const sym = symbol.toUpperCase()
  const next = loadPurchases().filter((p) => p.symbol !== sym)
  savePurchases(next)
  return next
}

export function aggregateEntryFromPurchases(
  symbol: string,
  purchases: PortfolioPurchase[],
): Omit<WatchlistEntry, 'addedAt'> | null {
  const sym = symbol.toUpperCase()
  const list = purchases.filter((p) => p.symbol === sym)
  if (list.length === 0) return null

  const totalQty = list.reduce((s, p) => s + p.quantity, 0)
  const totalCost = list.reduce((s, p) => s + p.quantity * p.priceUsd, 0)
  const first = list[0]

  return {
    symbol: sym,
    name: first.name,
    image: first.image,
    quantity: totalQty,
    avgBuyPrice: totalQty > 0 ? totalCost / totalQty : 0,
  }
}

export function entriesFromPurchases(
  purchases: PortfolioPurchase[],
): WatchlistEntry[] {
  const symbols = [...new Set(purchases.map((p) => p.symbol))]
  const entries: WatchlistEntry[] = []

  for (const sym of symbols) {
    const agg = aggregateEntryFromPurchases(sym, purchases)
    if (agg && agg.quantity > 0) {
      const oldest = purchases
        .filter((p) => p.symbol === sym)
        .reduce((min, p) => (p.purchasedAt < min ? p.purchasedAt : min), Date.now())
      entries.push({ ...agg, addedAt: oldest })
    }
  }

  return entries
}

export function purchasesInMonth(
  purchases: PortfolioPurchase[],
  year: number,
  month: number,
): PortfolioPurchase[] {
  return purchases
    .filter((p) => {
      const d = new Date(p.purchasedAt)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .sort((a, b) => a.purchasedAt - b.purchasedAt)
}

export function purchaseUsdTotal(p: PortfolioPurchase): number {
  return p.quantity * p.priceUsd
}

/** Total USD investido por dia (1..N) no mês selecionado */
export function dailyUsdInMonth(
  purchases: PortfolioPurchase[],
  year: number,
  month: number,
): { day: number; totalUsd: number }[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totals = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    totalUsd: 0,
  }))
  for (const p of purchasesInMonth(purchases, year, month)) {
    const day = new Date(p.purchasedAt).getDate()
    totals[day - 1].totalUsd += purchaseUsdTotal(p)
  }
  return totals
}

/** Total USD investido por mês (0..11) no ano selecionado */
export function monthlyUsdInYear(
  purchases: PortfolioPurchase[],
  year: number,
): { month: number; totalUsd: number }[] {
  const totals = Array.from({ length: 12 }, (_, m) => ({ month: m, totalUsd: 0 }))
  for (const p of purchases) {
    const d = new Date(p.purchasedAt)
    if (d.getFullYear() !== year) continue
    totals[d.getMonth()].totalUsd += purchaseUsdTotal(p)
  }
  return totals
}

export function wasMigratedFromWatchlist(): boolean {
  return localStorage.getItem(MIGRATED_KEY) === '1'
}

export function markMigratedFromWatchlist(): void {
  localStorage.setItem(MIGRATED_KEY, '1')
}
