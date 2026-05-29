/** Cache em memória (por instância serverless) para reduzir 429 na CoinGecko */
const entries = new Map()

/** Ranking /coins/markets — TTL longo (poucas mudanças por minuto) */
export const MARKETS_CACHE_TTL_MS = 30 * 60 * 1000

export function isMarketsUpstream(url) {
  try {
    const path = new URL(url).pathname
    return path.includes('/coins/markets')
  } catch {
    return false
  }
}

export function readUpstreamCache(url) {
  const hit = entries.get(url)
  if (!hit) return null
  if (Date.now() - hit.ts > hit.ttlMs) return null
  return hit
}

export function readUpstreamCacheStale(url) {
  return entries.get(url) ?? null
}

export function writeUpstreamCache(url, status, body, ttlMs = MARKETS_CACHE_TTL_MS) {
  if (status !== 200 || !body) return
  entries.set(url, { status, body, ts: Date.now(), ttlMs })
}
