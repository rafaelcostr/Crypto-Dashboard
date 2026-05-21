import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { ChartPeriodId } from '../constants'

const STORAGE_KEY = 'crypto-dashboard-chart-period'

interface ChartPeriodContextValue {
  period: ChartPeriodId
  setPeriod: (id: ChartPeriodId) => void
}

const ChartPeriodContext = createContext<ChartPeriodContextValue | null>(null)

function getInitial(): ChartPeriodId {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === '1year' || s === '2years' || s === '5years' || s === 'all') return s
  } catch {
    /* ignore */
  }
  return '2years'
}

export function ChartPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<ChartPeriodId>(getInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, period)
  }, [period])

  const setPeriod = useCallback((id: ChartPeriodId) => setPeriodState(id), [])

  return (
    <ChartPeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </ChartPeriodContext.Provider>
  )
}

export function useChartPeriod() {
  const ctx = useContext(ChartPeriodContext)
  if (!ctx) throw new Error('useChartPeriod within ChartPeriodProvider')
  return ctx
}
