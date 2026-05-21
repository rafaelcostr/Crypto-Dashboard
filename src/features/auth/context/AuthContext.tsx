import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchSession,
  getAuthToken,
  loginUser,
  registerUser,
  saveUserData,
  setAuthToken,
  type AuthUser,
  type RegisterResult,
  type UserCloudData,
} from '@/features/auth/api/auth'
import type { FavoriteCoin, PortfolioPurchase } from '@/shared/types'
import { loadPurchases } from '@/shared/utils/portfolioPurchases'

const FAVORITES_KEY = 'crypto-dashboard-favorites'

function loadLocalFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

interface AuthContextValue {
  user: AuthUser | null
  userData: UserCloudData | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<RegisterResult>
  logout: () => void
  refreshSession: () => Promise<void>
  persistUserData: (patch: Partial<UserCloudData>) => Promise<void>
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userData, setUserData] = useState<UserCloudData | null>(null)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback((u: AuthUser, data: UserCloudData) => {
    setUser(u)
    setUserData(data)
  }, [])

  const refreshSession = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setUserData(null)
      return
    }
    const session = await fetchSession()
    applySession(session.user, session.data)
  }, [applySession])

  useEffect(() => {
    refreshSession()
      .catch(() => {
        setAuthToken(null)
        setUser(null)
        setUserData(null)
      })
      .finally(() => setLoading(false))
  }, [refreshSession])

  const persistUserData = useCallback(
    async (patch: Partial<UserCloudData>) => {
      if (!user) return
      const merged: UserCloudData = {
        purchases: patch.purchases ?? userData?.purchases ?? [],
        favorites: patch.favorites ?? userData?.favorites ?? [],
        alerts: patch.alerts ?? userData?.alerts ?? [],
        alertHistory: patch.alertHistory ?? userData?.alertHistory ?? [],
        portfolioHistory: patch.portfolioHistory ?? userData?.portfolioHistory ?? [],
      }
      const saved = await saveUserData(merged)
      setUserData(saved)
    },
    [user, userData],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: u } = await loginUser(email, password)
      setAuthToken(token)
      const session = await fetchSession()

      let localPurchases = loadPurchases()
      let localFavorites = loadLocalFavorites()
      try {
        const pending = localStorage.getItem('crypto-dashboard-pending-merge')
        if (pending) {
          const parsed = JSON.parse(pending) as {
            email?: string
            purchases?: PortfolioPurchase[]
            favorites?: FavoriteCoin[]
          }
          if (!parsed.email || parsed.email === email.toLowerCase()) {
            localPurchases = parsed.purchases ?? localPurchases
            localFavorites = parsed.favorites ?? localFavorites
          }
          localStorage.removeItem('crypto-dashboard-pending-merge')
        }
      } catch {
        /* ignore */
      }

      const needsMerge =
        localPurchases.length > 0 && (session.data.purchases?.length ?? 0) === 0

      if (needsMerge || (localFavorites.length > 0 && !session.data.favorites?.length)) {
        const merged = {
          ...session.data,
          purchases: needsMerge ? localPurchases : session.data.purchases,
          favorites:
            localFavorites.length > 0 && !session.data.favorites?.length
              ? localFavorites
              : session.data.favorites,
        }
        const saved = await saveUserData(merged)
        applySession(u, saved)
      } else {
        applySession(session.user, session.data)
      }
    },
    [applySession],
  )

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const localPurchases = loadPurchases()
    const localFavorites = loadLocalFavorites()
    const result = await registerUser(email, password, name)

    if (localPurchases.length > 0 || localFavorites.length > 0) {
      localStorage.setItem(
        'crypto-dashboard-pending-merge',
        JSON.stringify({ purchases: localPurchases, favorites: localFavorites, email }),
      )
    }

    return result
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setUser(null)
    setUserData(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshSession,
      persistUserData,
      setUser,
    }),
    [user, userData, loading, login, register, logout, refreshSession, persistUserData],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
