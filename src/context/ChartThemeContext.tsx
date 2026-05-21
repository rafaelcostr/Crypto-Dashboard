import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ChartBackground } from '../data/chartThemes'
import { useTheme } from './ThemeContext'

export type ChartBackgroundMode = ChartBackground | 'auto'

const STORAGE_KEY = 'crypto-dashboard-chart-bg'

interface ChartThemeContextValue {
  chartBackgroundMode: ChartBackgroundMode
  chartBackground: ChartBackground
  setChartBackgroundMode: (mode: ChartBackgroundMode) => void
}

const ChartThemeContext = createContext<ChartThemeContextValue | null>(null)

function getInitialMode(): ChartBackgroundMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  } catch {
    /* ignore */
  }
  return 'auto'
}

export function ChartThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const [chartBackgroundMode, setChartBackgroundModeState] =
    useState<ChartBackgroundMode>(getInitialMode)

  const chartBackground: ChartBackground = useMemo(() => {
    if (chartBackgroundMode === 'auto') return theme
    return chartBackgroundMode
  }, [chartBackgroundMode, theme])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, chartBackgroundMode)
  }, [chartBackgroundMode])

  const setChartBackgroundMode = useCallback((mode: ChartBackgroundMode) => {
    setChartBackgroundModeState(mode)
  }, [])

  return (
    <ChartThemeContext.Provider
      value={{ chartBackgroundMode, chartBackground, setChartBackgroundMode }}
    >
      {children}
    </ChartThemeContext.Provider>
  )
}

export function useChartBackground() {
  const ctx = useContext(ChartThemeContext)
  if (!ctx) {
    throw new Error('useChartBackground must be used within ChartThemeProvider')
  }
  return ctx
}
