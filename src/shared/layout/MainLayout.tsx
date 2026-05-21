import {
  BarChart3,
  Bitcoin,
  LayoutDashboard,
  LogOut,
  Moon,
  Newspaper,
  Settings,
  Shield,
  Star,
  Sun,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { GlobalSearch } from '@/features/markets/components/GlobalSearch'
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext'
import { FavoritesProvider } from '@/features/markets/context/FavoritesContext'
import { MarketsProvider, useMarketsContext } from '@/features/markets/context/MarketsContext'
import { useTheme } from '@/shared/context/ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portfolio', label: 'Portfólio', icon: Star },
  { to: '/charts', label: 'Gráficos On-Chain', icon: BarChart3 },
  { to: '/news', label: 'Notícias', icon: Newspaper },
]

function AuthNavActions() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  if (loading) return null

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/account"
          className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)] sm:flex"
        >
          <Settings className="h-3.5 w-3.5" />
          Conta
        </Link>
        {user.isAdmin && (
          <Link
            to="/admin"
            className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 sm:flex"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </Link>
        )}
        <span className="hidden max-w-[120px] truncate text-xs text-[var(--color-muted)] lg:inline">
          {user.name || user.email}
        </span>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        to="/login"
        className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)]"
      >
        Entrar
      </Link>
      <Link
        to="/register"
        className="rounded-lg bg-[var(--color-accent)]/15 px-2.5 py-1.5 text-xs font-medium text-[var(--color-accent)]"
      >
        Criar conta
      </Link>
    </div>
  )
}

function MainLayoutNav() {
  const { theme, toggleTheme } = useTheme()
  const { coins } = useMarketsContext()

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-panel)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              <Bitcoin className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Crypto Dashboard</span>
          </NavLink>

          <div className="flex flex-wrap items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            <GlobalSearch coins={coins} />
            <AuthNavActions />
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-1 rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-panel-hover)]"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-muted)]">
        Crypto Dashboard · dados públicos · não é aconselhamento financeiro
      </footer>
    </div>
  )
}

export function MainLayout() {
  return (
    <AuthProvider>
      <MarketsProvider>
        <FavoritesProvider>
          <MainLayoutNav />
        </FavoritesProvider>
      </MarketsProvider>
    </AuthProvider>
  )
}
