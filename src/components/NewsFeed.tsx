import { ExternalLink, RefreshCw, Sparkles } from 'lucide-react'
import type { CryptoNews, NewsSummary } from '../types'
import { timeAgo } from '../utils/format'

interface NewsFeedProps {
  articles: CryptoNews[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  summaries: Record<string, NewsSummary>
  onSummarize: (article: CryptoNews) => void
  hasAiKey: boolean
}

export function NewsFeed({
  articles,
  loading,
  error,
  onRefresh,
  summaries,
  onSummarize,
  hasAiKey,
}: NewsFeedProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">Notícias Crypto</h2>
          <p className="text-xs text-[var(--color-muted)]">
            CryptoCompare
            {hasAiKey ? ' · resumo com IA' : ' · resumo local (adicione VITE_OPENAI_API_KEY para IA)'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:bg-[var(--color-panel-hover)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <p className="px-5 py-3 text-sm text-[var(--color-danger)]">{error}</p>
      )}

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {loading && articles.length === 0 ? (
          <p className="col-span-2 text-center text-[var(--color-muted)]">Carregando notícias...</p>
        ) : (
          articles.map((article) => {
            const summaryState = summaries[article.id]
            return (
              <article
                key={article.id}
                className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)]/30"
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="h-36 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex flex-wrap gap-1">
                    {article.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="rounded bg-[var(--color-panel)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--color-muted)]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug">
                    {article.title}
                  </h3>
                  <p className="mb-3 text-xs text-[var(--color-muted)]">
                    {article.source} · {timeAgo(article.publishedAt)}
                  </p>

                  {summaryState?.summary && (
                    <div className="mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-xs leading-relaxed text-[var(--color-muted)]">
                      <span className="mb-1 flex items-center gap-1 text-[var(--color-accent)]">
                        <Sparkles className="h-3 w-3" />
                        Resumo {summaryState.source === 'ai' ? '(IA)' : '(local)'}
                      </span>
                      {summaryState.summary}
                      {summaryState.error && (
                        <span className="mt-1 block text-[var(--color-warning)]">
                          {summaryState.error}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSummarize(article)}
                      disabled={summaryState?.loading}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--color-accent)]/40 py-1.5 text-xs text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/10 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {summaryState?.loading ? 'Resumindo...' : 'Resumir'}
                    </button>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs transition hover:bg-[var(--color-panel-hover)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ler
                    </a>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
