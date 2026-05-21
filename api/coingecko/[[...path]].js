/** Proxy CoinGecko — evita CORS no browser (Vercel + dev via Vite). */
function upstreamPath(req) {
  const segments = req.query.path
  if (Array.isArray(segments) && segments.length) return segments.join('/')
  if (typeof segments === 'string' && segments) return segments
  const match = (req.url || '').match(/\/api\/coingecko\/([^?]*)/)
  return match?.[1] ? decodeURIComponent(match[1]) : ''
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

  const subpath = upstreamPath(req)
  if (!subpath) {
    return res.status(400).json({ error: 'Rota CoinGecko inválida' })
  }

  const queryIndex = (req.url || '').indexOf('?')
  const qs = queryIndex >= 0 ? req.url.slice(queryIndex) : ''

  try {
    const headers = {
      Accept: 'application/json',
      'User-Agent': 'crypto-dashboard/1.0',
    }
    const apiKey = process.env.COINGECKO_API_KEY
    if (apiKey) headers['x-cg-demo-api-key'] = apiKey

    const upstream = `https://api.coingecko.com/api/v3/${subpath}${qs}`
    const response = await fetch(upstream, { headers })

    res.statusCode = response.status
    res.setHeader('Content-Type', 'application/json')
    const body = await response.text()
    res.end(body)
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Erro ao buscar CoinGecko',
    })
  }
}
