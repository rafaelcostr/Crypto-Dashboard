# Reorganiza src/ em shared + features (executar na raiz do projeto)
$src = Join-Path $PSScriptRoot "..\src"
Set-Location $src

$dirs = @(
  "app",
  "shared/types", "shared/utils", "shared/components", "shared/layout", "shared/context",
  "features/auth/api", "features/auth/context", "features/auth/pages",
  "features/markets/api", "features/markets/context", "features/markets/hooks", "features/markets/components", "features/markets/pages",
  "features/charts/api", "features/charts/context", "features/charts/hooks", "features/charts/components", "features/charts/data", "features/charts/layout", "features/charts/pages",
  "features/portfolio/hooks", "features/portfolio/components", "features/portfolio/pages",
  "features/news/api", "features/news/hooks", "features/news/components", "features/news/pages",
  "features/coin/hooks", "features/coin/components", "features/coin/pages",
  "features/admin/pages"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

# shared
Move-Item -Force types/index.ts shared/types/
Move-Item -Force constants.ts, constants.test.ts shared/
Move-Item -Force utils/* shared/utils/
Move-Item -Force components/ErrorBoundary.tsx, components/PasswordInput.tsx, components/ProtectedRoute.tsx shared/components/
Move-Item -Force layout/MainLayout.tsx shared/layout/
Move-Item -Force context/ThemeContext.tsx shared/context/

# auth
Move-Item -Force api/auth.ts features/auth/api/
Move-Item -Force context/AuthContext.tsx features/auth/context/
Move-Item -Force pages/LoginPage.tsx, pages/RegisterPage.tsx, pages/RegisterSuccessPage.tsx, pages/VerifyEmailPage.tsx, pages/AccountPage.tsx features/auth/pages/

# markets
Move-Item -Force api/coingecko.ts, api/binance.ts features/markets/api/
Move-Item -Force context/MarketsContext.tsx, context/FavoritesContext.tsx features/markets/context/
Move-Item -Force hooks/useMarkets.ts, hooks/useLivePrices.ts, hooks/useFearGreed.ts features/markets/hooks/
Move-Item -Force components/MarketTable.tsx, components/MarketTablePagination.tsx, components/LiveTicker.tsx, components/TopMovers.tsx, components/MarketStats.tsx, components/GlobalSearch.tsx features/markets/components/
Move-Item -Force pages/DashboardPage.tsx features/markets/pages/

# charts
Move-Item -Force api/onchain.ts features/charts/api/
Move-Item -Force context/ChartPeriodContext.tsx, context/ChartThemeContext.tsx features/charts/context/
Move-Item -Force hooks/useChartData.ts, hooks/useChartCrosshair.ts, hooks/useDashboardLayout.ts features/charts/hooks/
Move-Item -Force components/charts/* features/charts/components/
Move-Item -Force data/chartCatalog.ts, data/chartThemes.ts features/charts/data/
Move-Item -Force layout/ChartsLayout.tsx features/charts/layout/
Move-Item -Force pages/ChartDetailPage.tsx features/charts/pages/

# portfolio
Move-Item -Force hooks/usePortfolioPurchases.ts, hooks/useAlerts.ts features/portfolio/hooks/
Move-Item -Force components/PortfolioAddCoin.tsx, components/PortfolioCharts.tsx, components/PortfolioHistoryChart.tsx, components/PortfolioMonthlyChart.tsx, components/PortfolioPurchasesLineChart.tsx, components/WatchlistPanel.tsx, components/AlertsPanel.tsx, components/AlertHistory.tsx features/portfolio/components/
Move-Item -Force pages/PortfolioPage.tsx features/portfolio/pages/

# news
Move-Item -Force api/news.ts features/news/api/
Move-Item -Force hooks/useNews.ts, hooks/useNewsSummary.ts features/news/hooks/
Move-Item -Force components/NewsFeed.tsx features/news/components/
Move-Item -Force pages/NewsPage.tsx features/news/pages/

# coin
Move-Item -Force hooks/useCoinPage.ts features/coin/hooks/
Move-Item -Force components/coin/* features/coin/components/
Move-Item -Force pages/CoinPage.tsx features/coin/pages/

# admin
Move-Item -Force pages/AdminPage.tsx features/admin/pages/

# app
Move-Item -Force App.tsx app/

# cleanup dead / empty
Remove-Item -Force -ErrorAction SilentlyContinue components/Header.tsx, components/ChartModal.tsx
Remove-Item -Force -ErrorAction SilentlyContinue hooks/useWatchlist.ts, hooks/useFavorites.ts
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue types, utils, api, context, data, layout, pages, components, hooks

Write-Host "Move concluido."
