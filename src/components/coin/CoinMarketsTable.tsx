import { ExternalLink } from 'lucide-react'
import type { CoinTicker } from '../../types'
import { formatCompact, formatPrice } from '../../utils/format'

interface CoinMarketsTableProps {
  tickers: CoinTicker[]
  loading: boolean
  symbol: string
}

export function CoinMarketsTable({ tickers, loading, symbol }: CoinMarketsTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center text-sm text-[var(--color-muted)]">
        Carregando exchanges...
      </div>
    )
  }

  if (tickers.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-sm text-[var(--color-muted)]">
        Nenhum mercado listado. Tente atualizar ou busque {symbol} diretamente na Binance ou Coinbase.
      </p>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h2 className="text-lg font-semibold">Onde comprar {symbol}</h2>
        <p className="text-xs text-[var(--color-muted)]">
          Principais exchanges por volume (CoinGecko) · clique em Negociar para abrir o site
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Exchange</th>
              <th className="px-5 py-3 font-medium">Par</th>
              <th className="px-5 py-3 font-medium text-right">Preço</th>
              <th className="px-5 py-3 font-medium text-right">Volume 24h</th>
              <th className="px-5 py-3 font-medium text-center">Confiança</th>
              <th className="px-5 py-3 font-medium text-right" />
            </tr>
          </thead>
          <tbody>
            {tickers.map((t, i) => (
              <tr
                key={`${t.exchange}-${t.pair}-${i}`}
                className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-panel-hover)]"
              >
                <td className="px-5 py-3 font-medium">{t.exchange}</td>
                <td className="px-5 py-3 font-mono text-[var(--color-muted)]">{t.pair}</td>
                <td className="px-5 py-3 text-right font-mono">
                  {t.price > 0 ? formatPrice(t.price) : '—'}
                </td>
                <td className="px-5 py-3 text-right font-mono text-[var(--color-muted)]">
                  {t.volume24h > 0 ? formatCompact(t.volume24h) : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  <TrustBadge score={t.trustScore} />
                </td>
                <td className="px-5 py-3 text-right">
                  {t.tradeUrl ? (
                    <a
                      href={t.tradeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-accent)]/40 px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
                    >
                      Negociar
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TrustBadge({ score }: { score: string }) {
  const s = score.toLowerCase()
  const cls =
    s === 'green'
      ? 'bg-green-500/15 text-green-400'
      : s === 'red'
        ? 'bg-red-500/15 text-red-400'
        : 'bg-yellow-500/15 text-yellow-400'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${cls}`}>{score}</span>
  )
}
