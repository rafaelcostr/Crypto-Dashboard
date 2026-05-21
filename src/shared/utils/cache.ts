interface CacheEntry<T> {
  data: T
  ts: number
}

export function readCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - ts > ttlMs) return null
    return data
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    /* quota */
  }
}

export function readLocalCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - ts > ttlMs) return null
    return data
  } catch {
    return null
  }
}

export function writeLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    /* quota */
  }
}

/** Lê cache mesmo expirado (útil quando a API retorna 429). */
export function readCacheStale<T>(key: string): T | null {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(key)
      if (!raw) continue
      const { data } = JSON.parse(raw) as CacheEntry<T>
      if (data != null) return data
    } catch {
      /* ignore */
    }
  }
  return null
}

export function readMarketsCache<T>(key: string, ttlMs: number): T | null {
  return readCache<T>(key, ttlMs) ?? readLocalCache<T>(key, ttlMs)
}

export function writeMarketsCache<T>(key: string, data: T): void {
  writeCache(key, data)
  writeLocalCache(key, data)
}
