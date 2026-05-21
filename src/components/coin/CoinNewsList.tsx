import { ExternalLink, Newspaper } from 'lucide-react'
import type { CryptoNews } from '../../types'
import { timeAgo } from '../../utils/format'

interface CoinNewsListProps {
  articles: CryptoNews[]
  loading: boolean
  symbol: string
}

export function CoinNewsList({ articles, loading, symbol }: CoinNewsListProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center text-sm text-[var(--color-muted)]">
        Buscando notícias sobre {symbol}...
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-sm text-[var(--color-muted)]">
        Nenhuma notícia em português encontrada para {symbol} nos feeds atuais. Veja a página{' '}
        <a href="/news" className="text-[var(--color-accent)] hover:underline">
          Notícias
        </a>{' '}
        para o mercado geral.
      </p>
    )
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Newspaper className="h-5 w-5 text-[var(--color-accent)]" />
          Notícias sobre {symbol}
        </h2>
        <p className="text-xs text-[var(--color-muted)]">Fontes em português · Brasil</p>
      </div>
      <ul className="divide-y divide-[var(--color-border)]">
        {articles.map((a) => (
          <li key={a.id} className="px-5 py-4 transition hover:bg-[var(--color-panel-hover)]">
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium leading-snug group-hover:text-[var(--color-accent)]">
                    {a.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">
                    {a.body}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    {a.source} · {timeAgo(a.publishedAt)}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-[var(--color-muted)] opacity-0 transition group-hover:opacity-100" />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
