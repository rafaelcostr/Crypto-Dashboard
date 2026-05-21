import { createContext, useContext, type ReactNode } from 'react'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { TOP_MARKETS } from '@/shared/constants'
import type { MarketCoin } from '@/shared/types'

interface MarketsContextValue {
  coins: MarketCoin[]
  loading: boolean
  error: string | null
  refresh: () => void
  updatedAt: number | null
}

const MarketsContext = createContext<MarketsContextValue | null>(null)

export function MarketsProvider({ children }: { children: ReactNode }) {
  const value = useMarkets(TOP_MARKETS)
  return <MarketsContext.Provider value={value}>{children}</MarketsContext.Provider>
}

export function useMarketsContext() {
  const ctx = useContext(MarketsContext)
  if (!ctx) throw new Error('useMarketsContext within MarketsProvider')
  return ctx
}
