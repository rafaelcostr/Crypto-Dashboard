import { BarChart3, LayoutDashboard, Newspaper, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CHART_CATALOG } from '@/features/charts/data/chartCatalog'
import type { MarketCoin } from '@/shared/types'

interface GlobalSearchProps {
  coins: MarketCoin[]
}

const PAGES = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Portfólio', path: '/portfolio', icon: Star },
  { label: 'Gráficos On-Chain', path: '/charts/mvrv-zscore', icon: BarChart3 },
  { label: 'Notícias', path: '/news', icon: Newspaper },
]

export function GlobalSearch({ coins }: GlobalSearchProps) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return { coins: [], charts: [], pages: [] }

    const matchedCoins = coins
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.symbol.toLowerCase().includes(query),
      )
      .slice(0, 8)

    const matchedCharts = CHART_CATALOG.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.id.includes(query),
    ).slice(0, 5)

    const matchedPages = PAGES.filter((p) => p.label.toLowerCase().includes(query))

    return { coins: matchedCoins, charts: matchedCharts, pages: matchedPages }
  }, [q, coins])

  const hasResults =
    results.coins.length + results.charts.length + results.pages.length > 0

  function go(path: string) {
    navigate(path)
    setQ('')
    setOpen(false)
  }

  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
      <input
        type="search"
        placeholder="Buscar moeda, gráfico..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-accent)] lg:w-56"
      />
      {open && q.trim() && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-80 w-72 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] py-2 shadow-xl">
          {!hasResults ? (
            <p className="px-3 py-2 text-xs text-[var(--color-muted)]">Nada encontrado</p>
          ) : (
            <>
              {results.pages.map((p) => (
                <button
                  key={p.path}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-panel-hover)]"
                  onMouseDown={() => go(p.path)}
                >
                  <p.icon className="h-4 w-4 text-[var(--color-muted)]" />
                  {p.label}
                </button>
              ))}
              {results.charts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-panel-hover)]"
                  onMouseDown={() => go(`/charts/${c.id}`)}
                >
                  <BarChart3 className="h-4 w-4 text-[var(--color-accent)]" />
                  {c.name}
                </button>
              ))}
              {results.coins.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-panel-hover)]"
                  onMouseDown={() => go(`/coin/${c.id}`)}
                >
                  <img src={c.image} alt="" className="h-5 w-5 rounded-full" />
                  {c.name}{' '}
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {c.symbol}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
