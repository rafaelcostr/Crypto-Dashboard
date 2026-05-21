import type { CryptoNews } from '../types'

/** Resumo local (sem API) — extrai frases principais */
export function summarizeLocally(article: CryptoNews): string {
  const text = (article.body || article.title).replace(/\s+/g, ' ').trim()
  if (text.length <= 200) return text

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)

  const picked = sentences.slice(0, 2).join(' ')
  const summary = picked.length > 280 ? `${picked.slice(0, 277)}...` : picked
  return summary || article.title
}

/** Resumo via servidor Vercel (/api/summarize) ou cliente OpenAI */
export async function summarizeWithAI(article: CryptoNews): Promise<string> {
  try {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: article.title, body: article.body }),
    })
    if (res.ok) {
      const json = (await res.json()) as { summary?: string }
      if (json.summary) return json.summary
    }
  } catch {
    /* fallback cliente */
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    return summarizeLocally(article)
  }

  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

  const content = `Título: ${article.title}\n\nTexto: ${(article.body || article.title).slice(0, 2000)}`

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            'Você resume notícias de criptomoedas em português do Brasil. Seja objetivo (2-3 frases), destaque impacto no mercado e evite sensacionalismo.',
        },
        { role: 'user', content },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`IA indisponível (${response.status})`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const summary = data.choices?.[0]?.message?.content?.trim()
  if (!summary) throw new Error('Resposta vazia da IA')
  return summary
}
