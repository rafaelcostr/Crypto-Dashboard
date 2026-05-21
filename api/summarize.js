/** Resumo de notícia via OpenAI — POST /api/summarize */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor' })
  }

  const body =
    typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
  const { title, body: articleBody } = body
  if (!title) return res.status(400).json({ error: 'title obrigatório' })

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Resuma a notícia crypto em 2-3 frases em português do Brasil. Seja objetivo.',
          },
          {
            role: 'user',
            content: `${title}\n\n${(articleBody || '').slice(0, 2000)}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `OpenAI: ${response.status}` })
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()
    if (!summary) return res.status(502).json({ error: 'Resposta vazia' })

    return res.status(200).json({ summary })
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Erro no resumo',
    })
  }
}
