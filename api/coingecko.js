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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const upstream = resolveUpstreamUrl(req)
  if (!subpathValid(upstream)) {
    return res.status(400).json({ error: 'Rota CoinGecko inválida' })
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
    res.statusCode = response.status
    res.setHeader('Content-Type', 'application/json')
    res.end(await response.text())
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Erro ao buscar CoinGecko',
    })
  }
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
