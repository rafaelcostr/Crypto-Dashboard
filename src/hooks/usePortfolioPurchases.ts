import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { MarketCoin } from '../types'
import type { PortfolioPurchase, WatchlistEntry } from '../types'
import {
  entriesFromPurchases,
  loadPurchases,
  markMigratedFromWatchlist,
  removePurchase as removePurchaseRecord,
  removePurchasesBySymbol,
  savePurchases,
  wasMigratedFromWatchlist,
} from '../utils/portfolioPurchases'

const WATCHLIST_KEY = 'crypto-dashboard-watchlist'

function loadWatchlistFallback(): WatchlistEntry[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY)
    return raw ? (JSON.parse(raw) as WatchlistEntry[]) : []
  } catch {
    return []
  }
}

export function usePortfolioPurchases() {
  const { isAuthenticated, userData, persistUserData } = useAuth()
  const cloudPurchases = userData?.purchases

  const [purchases, setPurchases] = useState<PortfolioPurchase[]>(() =>
    isAuthenticated && cloudPurchases ? cloudPurchases : loadPurchases(),
  )
  const [entries, setEntries] = useState<WatchlistEntry[]>(() =>
    entriesFromPurchases(
      isAuthenticated && cloudPurchases ? cloudPurchases : loadPurchases(),
    ),
  )

  useEffect(() => {
    if (isAuthenticated && cloudPurchases) {
      setPurchases(cloudPurchases)
      setEntries(entriesFromPurchases(cloudPurchases))
    }
  }, [isAuthenticated, cloudPurchases])

  useEffect(() => {
    if (isAuthenticated) return
    if (!wasMigratedFromWatchlist() && purchases.length === 0) {
      const legacy = loadWatchlistFallback().filter((e) => e.quantity > 0)
      if (legacy.length > 0) {
        const migrated: PortfolioPurchase[] = legacy.map((e) => ({
          id: crypto.randomUUID(),
          symbol: e.symbol.toUpperCase(),
          name: e.name,
          image: e.image,
          quantity: e.quantity,
          priceUsd: e.avgBuyPrice,
          purchasedAt: e.addedAt || Date.now(),
        }))
        savePurchases(migrated)
        markMigratedFromWatchlist()
        setPurchases(migrated)
        setEntries(entriesFromPurchases(migrated))
      }
    }
  }, [isAuthenticated, purchases.length])

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(entries))
    }
  }, [entries, isAuthenticated])

  const syncPurchases = useCallback(
    async (next: PortfolioPurchase[]) => {
      setPurchases(next)
      setEntries(entriesFromPurchases(next))
      if (isAuthenticated) {
        await persistUserData({ purchases: next })
      } else {
        savePurchases(next)
      }
    },
    [isAuthenticated, persistUserData],
  )

  const registerPurchase = useCallback(
    async (coin: MarketCoin, quantity: number, priceUsd: number, purchasedAt: number) => {
      const purchase: PortfolioPurchase = {
        id: crypto.randomUUID(),
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        quantity,
        priceUsd,
        purchasedAt,
      }
      const next = [...purchases, purchase]
      await syncPurchases(next)
    },
    [purchases, syncPurchases],
  )

  const removePurchase = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        const next = purchases.filter((p) => p.id !== id)
        await syncPurchases(next)
      } else {
        await syncPurchases(removePurchaseRecord(id))
      }
    },
    [isAuthenticated, purchases, syncPurchases],
  )

  const removeSymbol = useCallback(
    async (symbol: string) => {
      if (isAuthenticated) {
        const sym = symbol.toUpperCase()
        const next = purchases.filter((p) => p.symbol !== sym)
        await syncPurchases(next)
      } else {
        await syncPurchases(removePurchasesBySymbol(symbol))
      }
    },
    [isAuthenticated, purchases, syncPurchases],
  )

  const updateEntry = useCallback(
    (symbol: string, patch: Partial<Pick<WatchlistEntry, 'quantity' | 'avgBuyPrice'>>) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.symbol === symbol.toUpperCase() ? { ...e, ...patch } : e,
        ),
      )
    },
    [],
  )

  const isHeld = useCallback(
    (symbol: string) => entries.some((e) => e.symbol === symbol.toUpperCase()),
    [entries],
  )

  return {
    purchases,
    entries,
    registerPurchase,
    removePurchase,
    removeSymbol,
    updateEntry,
    isHeld,
  }
}
