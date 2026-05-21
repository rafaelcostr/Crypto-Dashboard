/** Proxy CoinGecko com headers (rewrite da Vercel recebe 403 sem User-Agent / API key). */

function resolveUpstreamUrl(req) {
  let subpath = ''
  const pathParam = req.query.path

  if (Array.isArray(pathParam)) {
    subpath = pathParam.map((s) => decodeURIComponent(String(s))).join('/')
  } else if (typeof pathParam === 'string' && pathParam) {
    subpath = decodeURIComponent(pathParam)
  } else {
    const match = (req.url || '').match(/\/api\/coingecko\/([^?#]*)/)
    if (match?.[1]) subpath = decodeURIComponent(match[1])
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'path') continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v))
    } else if (value != null) {
      params.append(key, String(value))
    }
  }

  const qs = params.toString()
  const base = `https://api.coingecko.com/api/v3/${subpath}`
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
  if (!upstream.includes('/api/v3/') || upstream.endsWith('/api/v3/')) {
    return res.status(400).json({ error: 'Rota CoinGecko inválida' })
  }

  try {
    const headers = {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'CryptoDashboard/1.1 (+https://crypto-dashboard-iota-peach.vercel.app)',
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
