import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ChartsLayout } from './layout/ChartsLayout'
import { MainLayout } from './layout/MainLayout'
import { ChartDetailPage } from './pages/ChartDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { AccountPage } from './pages/AccountPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterSuccessPage } from './pages/RegisterSuccessPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { NewsPage } from './pages/NewsPage'
import { CoinPage } from './pages/CoinPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { RegisterPage } from './pages/RegisterPage'

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
