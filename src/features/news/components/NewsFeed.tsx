import { ExternalLink, Newspaper, RefreshCw, Sparkles } from 'lucide-react'
import type { CryptoNews, NewsSummary } from '@/shared/types'
import { timeAgo } from '@/shared/utils/format'

interface NewsFeedProps {
  articles: CryptoNews[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  summaries: Record<string, NewsSummary>
  onSummarize: (article: CryptoNews) => void
  hasAiKey: boolean
}

function excerpt(body: string, max = 140): string {
  const clean = body.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max)}…`
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
    <section
      id="noticias"
      className="scroll-mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Notícias Crypto</h2>
            <p className="text-xs text-[var(--color-muted)]">
              Livecoins · Portal do Bitcoin · CriptoFácil · BeInCrypto BR · Portal Cripto
              {hasAiKey ? ' · resumo IA em português' : ' · resumo local em português'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:bg-[var(--color-panel-hover)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && articles.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))
        ) : articles.length === 0 ? (
          <p className="col-span-full py-8 text-center text-[var(--color-muted)]">
            Nenhuma notícia encontrada. Clique em Atualizar.
          </p>
        ) : (
          articles.map((article) => {
            const summaryState = summaries[article.id]
            return (
              <article
                key={article.id}
                className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)]/30"
              >
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="h-36 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="flex h-20 items-center justify-center bg-[var(--color-panel)] text-[var(--color-muted)]">
                    <Newspaper className="h-8 w-8 opacity-40" />
                  </div>
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
                  <h3 className="mb-1 line-clamp-3 text-sm font-semibold leading-snug">
                    {article.title}
                  </h3>
                  <p className="mb-2 text-xs text-[var(--color-muted)]">
                    {article.source} · {timeAgo(article.publishedAt)}
                  </p>
                  <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-[var(--color-muted)]">
                    {excerpt(article.body)}
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
