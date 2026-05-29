import { requireCors } from './lib/cors.js'
import {
  isMarketsUpstream,
  readUpstreamCache,
  readUpstreamCacheStale,
  writeUpstreamCache,
} from './lib/coingeckoCache.js'

/**
 * Proxy CoinGecko (Vercel).
 * Rotas públicas /api/coingecko/* são reescritas para ?cgpath=... via vercel.json
 */
function resolveUpstreamUrl(req) {
  let subpath = ''
  const proxy = req.query.cgpath ?? req.query.path

  if (Array.isArray(proxy)) {
    subpath = proxy.map((s) => decodeURIComponent(String(s))).join('/')
  } else if (typeof proxy === 'string' && proxy) {
    subpath = decodeURIComponent(proxy)
  }

  if (!subpath) {
    const raw = req.url || ''
    const url = new URL(raw.startsWith('http') ? raw : `https://x${raw}`)
    subpath = url.pathname.replace(/^\/api\/coingecko\/?/, '')
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'cgpath' || key === 'path') continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v))
    } else if (value != null) {
      params.append(key, String(value))
    }
  }

  const qs = params.toString()
  const base = `https://api.coingecko.com/api/v3/${subpath.replace(/^\/+/, '')}`
  return qs ? `${base}?${qs}` : base
}

function subpathValid(upstream) {
  try {
    const u = new URL(upstream)
    const after = u.pathname.replace(/^\/api\/v3\/?/, '')
    return Boolean(after && after !== '/')
  } catch {
    return false
  }
}

function sendCached(res, cached) {
  res.statusCode = cached.status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('X-Cache', 'HIT')
  res.end(cached.body)
}

export default async function handler(req, res) {
  if (!requireCors(req, res, 'GET, OPTIONS')) return
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const upstream = resolveUpstreamUrl(req)
  if (!subpathValid(upstream)) {
    return res.status(400).json({ error: 'Rota CoinGecko inválida' })
  }

  const marketsRoute = isMarketsUpstream(upstream)
  const fresh = marketsRoute ? readUpstreamCache(upstream) : null
  if (fresh) {
    sendCached(res, fresh)
    return
  }

  try {
    const headers = {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'CryptoDashboard/1.1 (+https://vercel.app)',
    }

    const apiKey = process.env.COINGECKO_API_KEY?.trim()
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
    }

    const response = await fetch(upstream, { headers })
    const body = await response.text()

    if (marketsRoute && response.status === 200) {
      writeUpstreamCache(upstream, response.status, body)
    }

    if (marketsRoute && response.status === 429) {
      const stale = readUpstreamCacheStale(upstream)
      if (stale) {
        sendCached(res, stale)
        return
      }
    }

    res.statusCode = response.status
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-Cache', 'MISS')
    res.end(body)
  } catch (e) {
    if (marketsRoute) {
      const stale = readUpstreamCacheStale(upstream)
      if (stale) {
        sendCached(res, stale)
        return
      }
    }
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Erro ao buscar CoinGecko',
    })
  }
}
