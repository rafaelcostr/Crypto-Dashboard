/** Proxy Blockchain.com — /api/blockchain-chart?name=hash-rate&timespan=2years */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const chart = req.query.name || req.query.chart
  const timespan =
    typeof req.query.timespan === 'string' && req.query.timespan
      ? req.query.timespan
      : '2years'

  if (!chart || Array.isArray(chart)) {
    return res.status(400).json({ error: 'Parâmetro name obrigatório' })
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
