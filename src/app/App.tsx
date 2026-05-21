import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminPage } from '@/features/admin/pages/AdminPage'
import { AccountPage } from '@/features/auth/pages/AccountPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { RegisterSuccessPage } from '@/features/auth/pages/RegisterSuccessPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ChartsLayout } from '@/features/charts/layout/ChartsLayout'
import { ChartDetailPage } from '@/features/charts/pages/ChartDetailPage'
import { CoinPage } from '@/features/coin/pages/CoinPage'
import { DashboardPage } from '@/features/markets/pages/DashboardPage'
import { NewsPage } from '@/features/news/pages/NewsPage'
import { PortfolioPage } from '@/features/portfolio/pages/PortfolioPage'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { MainLayout } from '@/shared/layout/MainLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="charts" element={<ChartsLayout />}>
          <Route index element={<Navigate to="mvrv-zscore" replace />} />
          <Route path=":chartId" element={<ChartDetailPage />} />
        </Route>
        <Route path="coin/:coinId" element={<CoinPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="register/success" element={<RegisterSuccessPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
