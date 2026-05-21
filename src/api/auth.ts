import type { FavoriteCoin, PortfolioPurchase, PriceAlert, AlertHistoryEntry } from '../types'

const TOKEN_KEY = 'crypto-dashboard-auth-token'

export interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: number
  emailVerified: boolean
  isAdmin: boolean
  pendingEmail: string | null
}

export interface UserCloudData {
  purchases: PortfolioPurchase[]
  favorites: FavoriteCoin[]
  alerts: PriceAlert[]
  alertHistory: AlertHistoryEntry[]
  portfolioHistory: { ts: number; totalUsd: number }[]
}

export interface RegisterResult {
  needsVerification: boolean
  message: string
  email: string
  devVerifyLink?: string | null
}

export interface AdminUserRow {
  id: string
  email: string
  name: string
  createdAt: number
  emailVerified: boolean
  pendingEmail: string | null
  purchasesCount: number
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...init, headers })
  const json = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new Error((json as { error?: string }).error || `Erro ${res.status}`)
  }
  return json
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<RegisterResult> {
  return authFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function verifyEmailToken(token: string): Promise<{ message: string; email: string }> {
  return authFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  })
}

export async function resendVerification(email: string): Promise<{
  message: string
  devVerifyLink?: string | null
}> {
  return authFetch('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function fetchSession(): Promise<{ user: AuthUser; data: UserCloudData }> {
  return authFetch('/api/auth/me', { method: 'GET' })
}

export async function saveUserData(data: Partial<UserCloudData>): Promise<UserCloudData> {
  const res = await authFetch<{ data: UserCloudData }>('/api/user/data', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return res.data
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return authFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function changeEmail(
  newEmail: string,
  password: string,
): Promise<{ message: string; pendingEmail: string; devVerifyLink?: string | null }> {
  return authFetch('/api/auth/change-email', {
    method: 'POST',
    body: JSON.stringify({ newEmail, password }),
  })
}

export async function updateProfile(name: string): Promise<{ user: AuthUser }> {
  return authFetch('/api/auth/update-profile', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function fetchAdminUsers(): Promise<{ users: AdminUserRow[]; total: number }> {
  return authFetch('/api/admin/users', { method: 'GET' })
}

export async function deleteAdminUser(userId: string): Promise<{ message: string }> {
  return authFetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
}
