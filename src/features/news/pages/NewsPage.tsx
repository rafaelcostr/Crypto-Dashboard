import { useMemo, useState } from 'react'
import { NewsFeed } from '@/features/news/components/NewsFeed'
import { useNews } from '@/features/news/hooks/useNews'
import { useNewsSummary } from '@/features/news/hooks/useNewsSummary'
import { buildDailyDigest } from '@/shared/utils/dailyDigest'

const COIN_FILTERS = ['', 'BTC', 'ETH', 'SOL', 'XRP', 'BNB']

export function NewsPage() {
  const { articles, loading, error, refresh, updatedAt } = useNews(30)
  const { summaries, summarize, hasAiKey } = useNewsSummary()
  const [coinFilter, setCoinFilter] = useState('')

  const filtered = useMemo(() => {
    if (!coinFilter) return articles
    const q = coinFilter.toLowerCase()
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.categories.some((c) => c.toLowerCase().includes(q)),
    )
  }, [articles, coinFilter])

  const dailyDigest = useMemo(() => buildDailyDigest(articles, 5), [articles])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notícias Crypto</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Somente portais brasileiros em português · cache 5 min
            {updatedAt && (
              <span className="ml-1 opacity-70">
                · {new Date(updatedAt).toLocaleTimeString('pt-BR')}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {COIN_FILTERS.map((c) => (
            <button
              key={c || 'all'}
              type="button"
              onClick={() => setCoinFilter(c)}
              className={`rounded-lg px-2.5 py-1 text-xs ${
                coinFilter === c
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)]'
              }`}
            >
              {c || 'Todas'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <p className="mb-2 text-sm font-semibold">Resumo do dia</p>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-muted)]">
          {dailyDigest}
        </pre>
      </div>

      <NewsFeed
        articles={filtered}
        loading={loading}
        error={error}
        onRefresh={refresh}
        summaries={summaries}
        onSummarize={summarize}
        hasAiKey={hasAiKey}
      />
    </div>
  )
}
