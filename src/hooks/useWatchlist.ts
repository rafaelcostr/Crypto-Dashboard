import { useCallback, useEffect, useState } from 'react'
import type { WatchlistEntry } from '../types'

const STORAGE_KEY = 'crypto-dashboard-watchlist'

function load(): WatchlistEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WatchlistEntry[]) : []
  } catch {
    return []
  }
}

export function useWatchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>(() => load())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const isWatched = useCallback(
    (symbol: string) => entries.some((e) => e.symbol === symbol.toUpperCase()),
    [entries],
  )

  const add = useCallback(
    (entry: Omit<WatchlistEntry, 'addedAt'>) => {
      const sym = entry.symbol.toUpperCase()
      setEntries((prev) => {
        if (prev.some((e) => e.symbol === sym)) return prev
        return [...prev, { ...entry, symbol: sym, addedAt: Date.now() }]
      })
    },
    [],
  )

  const remove = useCallback((symbol: string) => {
    setEntries((prev) => prev.filter((e) => e.symbol !== symbol.toUpperCase()))
  }, [])

  const update = useCallback(
    (symbol: string, patch: Partial<Pick<WatchlistEntry, 'quantity' | 'avgBuyPrice'>>) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.symbol === symbol.toUpperCase() ? { ...e, ...patch } : e,
        ),
      )
    },
    [],
  )

  const addOrUpdate = useCallback(
    (
      entry: Omit<WatchlistEntry, 'addedAt'>,
    ) => {
      const sym = entry.symbol.toUpperCase()
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.symbol === sym)
        if (idx >= 0) {
          return prev.map((e) =>
            e.symbol === sym
              ? {
                  ...e,
                  quantity: entry.quantity,
                  avgBuyPrice: entry.avgBuyPrice,
                }
              : e,
          )
        }
        return [...prev, { ...entry, symbol: sym, addedAt: Date.now() }]
      })
    },
    [],
  )

  const toggle = useCallback(
    (entry: Omit<WatchlistEntry, 'addedAt' | 'quantity' | 'avgBuyPrice'> & {
      quantity?: number
      avgBuyPrice?: number
    }) => {
      if (isWatched(entry.symbol)) {
        remove(entry.symbol)
      } else {
        add({
          ...entry,
          quantity: entry.quantity ?? 0,
          avgBuyPrice: entry.avgBuyPrice ?? 0,
        })
      }
    },
    [isWatched, remove, add],
  )

  return { entries, isWatched, add, remove, update, toggle, addOrUpdate }
}
