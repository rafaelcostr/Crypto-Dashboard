import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import type { FavoriteCoin, MarketCoin } from '../types'

const STORAGE_KEY = 'crypto-dashboard-favorites'

function loadLocal(): FavoriteCoin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FavoriteCoin[]) : []
  } catch {
    return []
  }
}

function saveLocal(list: FavoriteCoin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

interface FavoritesContextValue {
  favorites: FavoriteCoin[]
  isFavorite: (symbol: string) => boolean
  toggleFavorite: (coin: MarketCoin) => void
  removeFavorite: (symbol: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userData, persistUserData } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteCoin[]>(() =>
    isAuthenticated && userData?.favorites ? userData.favorites : loadLocal(),
  )

  useEffect(() => {
    if (isAuthenticated && userData?.favorites) {
      setFavorites(userData.favorites)
    }
  }, [isAuthenticated, userData?.favorites])

  const persist = useCallback(
    async (next: FavoriteCoin[]) => {
      setFavorites(next)
      if (isAuthenticated) {
        await persistUserData({ favorites: next })
      } else {
        saveLocal(next)
      }
    },
    [isAuthenticated, persistUserData],
  )

  const isFavorite = useCallback(
    (symbol: string) =>
      favorites.some((f) => f.symbol.toUpperCase() === symbol.toUpperCase()),
    [favorites],
  )

  const toggleFavorite = useCallback(
    (coin: MarketCoin) => {
      const sym = coin.symbol.toUpperCase()
      const next = favorites.some((f) => f.symbol.toUpperCase() === sym)
        ? favorites.filter((f) => f.symbol.toUpperCase() !== sym)
        : [
            ...favorites,
            {
              coinId: coin.id,
              symbol: sym,
              name: coin.name,
              image: coin.image,
              addedAt: Date.now(),
            },
          ]
      void persist(next)
    },
    [favorites, persist],
  )

  const removeFavorite = useCallback(
    (symbol: string) => {
      const sym = symbol.toUpperCase()
      void persist(favorites.filter((f) => f.symbol.toUpperCase() !== sym))
    },
    [favorites, persist],
  )

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, isFavorite, toggleFavorite, removeFavorite],
  )

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider')
  }
  return ctx
}
