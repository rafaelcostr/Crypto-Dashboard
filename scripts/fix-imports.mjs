/**
 * Atualiza imports relativos quebrados para alias @/ após reorganização em modules.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

const MODULE_MAP = [
  [/from ['"]\.\.\/\.\.\/types['"]/g, `from '@/shared/types'`],
  [/from ['"]\.\.\/types['"]/g, `from '@/shared/types'`],
  [/from ['"]\.\.\/\.\.\/constants['"]/g, `from '@/shared/constants'`],
  [/from ['"]\.\.\/constants['"]/g, `from '@/shared/constants'`],
  [/from ['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, `from '@/shared/utils/$1'`],
  [/from ['"]\.\.\/utils\/([^'"]+)['"]/g, `from '@/shared/utils/$1'`],
  [/from ['"]\.\/utils\/([^'"]+)['"]/g, `from '@/shared/utils/$1'`],
  [/from ['"]\.\.\/\.\.\/components\/(ErrorBoundary|PasswordInput|ProtectedRoute)['"]/g, `from '@/shared/components/$1'`],
  [/from ['"]\.\.\/components\/(ErrorBoundary|PasswordInput|ProtectedRoute)['"]/g, `from '@/shared/components/$1'`],
  [/from ['"]\.\/components\/(ErrorBoundary|PasswordInput|ProtectedRoute)['"]/g, `from '@/shared/components/$1'`],
  [/from ['"]\.\.\/\.\.\/layout\/MainLayout['"]/g, `from '@/shared/layout/MainLayout'`],
  [/from ['"]\.\.\/layout\/MainLayout['"]/g, `from '@/shared/layout/MainLayout'`],
  [/from ['"]\.\/layout\/MainLayout['"]/g, `from '@/shared/layout/MainLayout'`],
  [/from ['"]\.\.\/\.\.\/context\/ThemeContext['"]/g, `from '@/shared/context/ThemeContext'`],
  [/from ['"]\.\.\/context\/ThemeContext['"]/g, `from '@/shared/context/ThemeContext'`],
  [/from ['"]\.\/context\/ThemeContext['"]/g, `from '@/shared/context/ThemeContext'`],

  [/from ['"]\.\.\/\.\.\/api\/auth['"]/g, `from '@/features/auth/api/auth'`],
  [/from ['"]\.\.\/api\/auth['"]/g, `from '@/features/auth/api/auth'`],
  [/from ['"]\.\.\/\.\.\/context\/AuthContext['"]/g, `from '@/features/auth/context/AuthContext'`],
  [/from ['"]\.\.\/context\/AuthContext['"]/g, `from '@/features/auth/context/AuthContext'`],
  [/from ['"]\.\/context\/AuthContext['"]/g, `from '@/features/auth/context/AuthContext'`],

  [/from ['"]\.\.\/\.\.\/api\/coingecko['"]/g, `from '@/features/markets/api/coingecko'`],
  [/from ['"]\.\.\/api\/coingecko['"]/g, `from '@/features/markets/api/coingecko'`],
  [/from ['"]\.\.\/\.\.\/api\/binance['"]/g, `from '@/features/markets/api/binance'`],
  [/from ['"]\.\.\/api\/binance['"]/g, `from '@/features/markets/api/binance'`],
  [/from ['"]\.\.\/\.\.\/context\/MarketsContext['"]/g, `from '@/features/markets/context/MarketsContext'`],
  [/from ['"]\.\.\/context\/MarketsContext['"]/g, `from '@/features/markets/context/MarketsContext'`],
  [/from ['"]\.\.\/\.\.\/context\/FavoritesContext['"]/g, `from '@/features/markets/context/FavoritesContext'`],
  [/from ['"]\.\.\/context\/FavoritesContext['"]/g, `from '@/features/markets/context/FavoritesContext'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useMarkets['"]/g, `from '@/features/markets/hooks/useMarkets'`],
  [/from ['"]\.\.\/hooks\/useMarkets['"]/g, `from '@/features/markets/hooks/useMarkets'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useLivePrices['"]/g, `from '@/features/markets/hooks/useLivePrices'`],
  [/from ['"]\.\.\/hooks\/useLivePrices['"]/g, `from '@/features/markets/hooks/useLivePrices'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useFearGreed['"]/g, `from '@/features/markets/hooks/useFearGreed'`],
  [/from ['"]\.\.\/hooks\/useFearGreed['"]/g, `from '@/features/markets/hooks/useFearGreed'`],

  [/from ['"]\.\.\/\.\.\/api\/onchain['"]/g, `from '@/features/charts/api/onchain'`],
  [/from ['"]\.\.\/api\/onchain['"]/g, `from '@/features/charts/api/onchain'`],
  [/from ['"]\.\.\/\.\.\/context\/ChartPeriodContext['"]/g, `from '@/features/charts/context/ChartPeriodContext'`],
  [/from ['"]\.\.\/context\/ChartPeriodContext['"]/g, `from '@/features/charts/context/ChartPeriodContext'`],
  [/from ['"]\.\.\/\.\.\/context\/ChartThemeContext['"]/g, `from '@/features/charts/context/ChartThemeContext'`],
  [/from ['"]\.\.\/context\/ChartThemeContext['"]/g, `from '@/features/charts/context/ChartThemeContext'`],
  [/from ['"]\.\.\/\.\.\/data\/chartCatalog['"]/g, `from '@/features/charts/data/chartCatalog'`],
  [/from ['"]\.\.\/data\/chartCatalog['"]/g, `from '@/features/charts/data/chartCatalog'`],
  [/from ['"]\.\.\/\.\.\/data\/chartThemes['"]/g, `from '@/features/charts/data/chartThemes'`],
  [/from ['"]\.\.\/data\/chartThemes['"]/g, `from '@/features/charts/data/chartThemes'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useChartData['"]/g, `from '@/features/charts/hooks/useChartData'`],
  [/from ['"]\.\.\/hooks\/useChartData['"]/g, `from '@/features/charts/hooks/useChartData'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useChartCrosshair['"]/g, `from '@/features/charts/hooks/useChartCrosshair'`],
  [/from ['"]\.\.\/hooks\/useChartCrosshair['"]/g, `from '@/features/charts/hooks/useChartCrosshair'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useDashboardLayout['"]/g, `from '@/features/charts/hooks/useDashboardLayout'`],
  [/from ['"]\.\.\/hooks\/useDashboardLayout['"]/g, `from '@/features/charts/hooks/useDashboardLayout'`],
  [/from ['"]\.\.\/components\/charts\/([^'"]+)['"]/g, `from '@/features/charts/components/$1'`],
  [/from ['"]\.\.\/\.\.\/components\/charts\/([^'"]+)['"]/g, `from '@/features/charts/components/$1'`],
  [/from ['"]\.\/charts\/([^'"]+)['"]/g, `from '@/features/charts/components/$1'`],

  [/from ['"]\.\.\/\.\.\/api\/news['"]/g, `from '@/features/news/api/news'`],
  [/from ['"]\.\.\/api\/news['"]/g, `from '@/features/news/api/news'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useNews['"]/g, `from '@/features/news/hooks/useNews'`],
  [/from ['"]\.\.\/hooks\/useNews['"]/g, `from '@/features/news/hooks/useNews'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useNewsSummary['"]/g, `from '@/features/news/hooks/useNewsSummary'`],
  [/from ['"]\.\.\/hooks\/useNewsSummary['"]/g, `from '@/features/news/hooks/useNewsSummary'`],

  [/from ['"]\.\.\/\.\.\/hooks\/usePortfolioPurchases['"]/g, `from '@/features/portfolio/hooks/usePortfolioPurchases'`],
  [/from ['"]\.\.\/hooks\/usePortfolioPurchases['"]/g, `from '@/features/portfolio/hooks/usePortfolioPurchases'`],
  [/from ['"]\.\.\/\.\.\/hooks\/useAlerts['"]/g, `from '@/features/portfolio/hooks/useAlerts'`],
  [/from ['"]\.\.\/hooks\/useAlerts['"]/g, `from '@/features/portfolio/hooks/useAlerts'`],

  [/from ['"]\.\.\/\.\.\/hooks\/useCoinPage['"]/g, `from '@/features/coin/hooks/useCoinPage'`],
  [/from ['"]\.\.\/hooks\/useCoinPage['"]/g, `from '@/features/coin/hooks/useCoinPage'`],
  [/from ['"]\.\.\/components\/coin\/([^'"]+)['"]/g, `from '@/features/coin/components/$1'`],
  [/from ['"]\.\.\/\.\.\/components\/coin\/([^'"]+)['"]/g, `from '@/features/coin/components/$1'`],

  [/from ['"]\.\.\/components\/(MarketTable|MarketTablePagination|LiveTicker|TopMovers|MarketStats|GlobalSearch)['"]/g, `from '@/features/markets/components/$1'`],
  [/from ['"]\.\.\/\.\.\/components\/(MarketTable|MarketTablePagination|LiveTicker|TopMovers|MarketStats|GlobalSearch)['"]/g, `from '@/features/markets/components/$1'`],
  [/from ['"]\.\.\/components\/(NewsFeed)['"]/g, `from '@/features/news/components/$1'`],
  [/from ['"]\.\.\/components\/(PortfolioAddCoin|PortfolioCharts|PortfolioHistoryChart|PortfolioMonthlyChart|PortfolioPurchasesLineChart|WatchlistPanel|AlertsPanel|AlertHistory)['"]/g, `from '@/features/portfolio/components/$1'`],
  [/from ['"]\.\.\/\.\.\/components\/(PortfolioAddCoin|PortfolioCharts|PortfolioHistoryChart|PortfolioMonthlyChart|PortfolioPurchasesLineChart|WatchlistPanel|AlertsPanel|AlertHistory)['"]/g, `from '@/features/portfolio/components/$1'`],
]

const SAME_FEATURE = [
  [/from ['"]\.\/([^'"]+)['"]/g, (m, p, file) => {
    if (p.includes('/')) return m
    return m
  }],
]

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (/\.(tsx?)$/.test(ent.name)) files.push(p)
  }
  return files
}

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8')
  let changed = false
  for (const [re, rep] of MODULE_MAP) {
    const next = code.replace(re, rep)
    if (next !== code) {
      code = next
      changed = true
    }
  }
  if (changed) fs.writeFileSync(file, code)
  return changed
}

const files = walk(root)
let n = 0
for (const f of files) {
  if (fixFile(f)) n++
}
console.log(`Atualizados ${n} arquivos.`)
