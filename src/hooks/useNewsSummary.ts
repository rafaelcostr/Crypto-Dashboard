import { useCallback, useState } from 'react'
import type { CryptoNews, NewsSummary } from '../types'
import { summarizeLocally, summarizeWithAI } from '../utils/summarize'

export function useNewsSummary() {
  const [summaries, setSummaries] = useState<Record<string, NewsSummary>>({})
  const hasAiKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY)

  const summarize = useCallback(async (article: CryptoNews) => {
    setSummaries((prev) => ({
      ...prev,
      [article.id]: {
        articleId: article.id,
        summary: '',
        loading: true,
        source: hasAiKey ? 'ai' : 'local',
      },
    }))

    try {
      const summary = hasAiKey
        ? await summarizeWithAI(article)
        : summarizeLocally(article)

      setSummaries((prev) => ({
        ...prev,
        [article.id]: {
          articleId: article.id,
          summary,
          loading: false,
          source: hasAiKey ? 'ai' : 'local',
        },
      }))
    } catch (e) {
      const fallback = summarizeLocally(article)
      setSummaries((prev) => ({
        ...prev,
        [article.id]: {
          articleId: article.id,
          summary: fallback,
          loading: false,
          error: e instanceof Error ? e.message : 'Erro no resumo',
          source: 'local',
        },
      }))
    }
  }, [hasAiKey])

  return { summaries, summarize, hasAiKey }
}
