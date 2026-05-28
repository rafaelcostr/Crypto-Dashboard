import { requireCors } from '../../../lib/cors.js'

/** Proxy Blockchain.com — /api/blockchain/charts/:chart */
function chartFromRequest(req) {
  const q = req.query.chart
  if (typeof q === 'string' && q.trim()) return q.trim()
  const path = req.url || ''
  const match = path.match(/\/charts\/([^/?#]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

export default async function handler(req, res) {
  if (!requireCors(req, res, 'GET, OPTIONS')) return

  const chart = chartFromRequest(req)
  const timespan =
    typeof req.query.timespan === 'string' && req.query.timespan
      ? req.query.timespan
      : '2years'

  if (!chart) {
    return res.status(400).json({ error: 'Parâmetro chart obrigatório' })
  }

  try {
    const url = `https://api.blockchain.info/charts/${encodeURIComponent(chart)}?timespan=${encodeURIComponent(timespan)}&format=json&sampled=true`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'crypto-dashboard/1.0' },
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Blockchain.com: ${response.status}`,
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Erro ao buscar gráfico',
    })
  }
}
