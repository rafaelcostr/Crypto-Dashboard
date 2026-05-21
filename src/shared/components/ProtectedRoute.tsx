import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-muted)]">
        Verificando sessão...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />
  }

  return children
}
