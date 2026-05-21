import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Time } from 'lightweight-charts'
import type { PortfolioPurchase } from '@/shared/types'
import {
  dailyUsdInMonth,
  monthlyUsdInYear,
  purchasesInMonth,
} from '@/shared/utils/portfolioPurchases'
import { formatPrice } from '@/shared/utils/format'
import {
  PortfolioPurchasesLineChart,
  type PurchaseLinePoint,
} from './PortfolioPurchasesLineChart'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

type ChartView = 'month' | 'year'

interface PortfolioMonthlyChartProps {
  purchases: PortfolioPurchase[]
  onRemovePurchase?: (id: string) => void
}

function formatDayMonth(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })
}

function dayToTime(year: number, month: number, day: number): Time {
  return Math.floor(new Date(year, month, day).getTime() / 1000) as Time
}

function monthToTime(year: number, month: number): Time {
  return Math.floor(new Date(year, month, 1).getTime() / 1000) as Time
}

export function PortfolioMonthlyChart({
  purchases,
  onRemovePurchase,
}: PortfolioMonthlyChartProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view, setView] = useState<ChartView>('year')

  const monthPurchases = useMemo(
    () => purchasesInMonth(purchases, year, month),
    [purchases, year, month],
  )

  const dailyLinePoints = useMemo((): PurchaseLinePoint[] => {
    return dailyUsdInMonth(purchases, year, month).map((d) => ({
      time: dayToTime(year, month, d.day),
      value: d.totalUsd,
      label: `Dia ${d.day}`,
    }))
  }, [purchases, year, month])

  const monthlyLinePoints = useMemo((): PurchaseLinePoint[] => {
    return monthlyUsdInYear(purchases, year).map((m) => ({
      time: monthToTime(year, m.month),
      value: m.totalUsd,
      label: MONTH_NAMES[m.month],
    }))
  }, [purchases, year])

  const peakMonth = useMemo(() => {
    const totals = monthlyUsdInYear(purchases, year)
    let bestIdx = -1
    let max = 0
    for (let i = 0; i < totals.length; i++) {
      if (totals[i].totalUsd > max) {
        max = totals[i].totalUsd
        bestIdx = i
      }
    }
    if (bestIdx < 0 || max <= 0) return null
    return { month: bestIdx, totalUsd: max }
  }, [purchases, year])

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  function shiftYear(delta: number) {
    setYear((y) => y + delta)
  }

  const groupedByDay = useMemo(() => {
    const days: { day: number; items: PortfolioPurchase[] }[] = []
    const map = new Map<number, PortfolioPurchase[]>()
    for (const p of monthPurchases) {
      const day = new Date(p.purchasedAt).getDate()
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(p)
    }
    for (const [day, items] of [...map.entries()].sort((a, b) => a[0] - b[0])) {
      days.push({ day, items })
    }
    return days
  }, [monthPurchases])

  const linePoints = view === 'year' ? monthlyLinePoints : dailyLinePoints
  const hasAnyPurchases = purchases.length > 0

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Histórico de compras</h2>
          <p className="text-xs text-[var(--color-muted)]">
            Linha de investimento · compare meses do ano ou dias do mês
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
            <button
              type="button"
              onClick={() => setView('year')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                view === 'year'
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Por mês (ano)
            </button>
            <button
              type="button"
              onClick={() => setView('month')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                view === 'month'
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Por dia (mês)
            </button>
          </div>
          <button
            type="button"
            onClick={() => (view === 'year' ? shiftYear(-1) : shiftMonth(-1))}
            className="rounded-lg border border-[var(--color-border)] p-2 hover:bg-[var(--color-panel-hover)]"
            aria-label={view === 'year' ? 'Ano anterior' : 'Mês anterior'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {view === 'year' ? year : `${MONTH_NAMES[month]} ${year}`}
          </span>
          <button
            type="button"
            onClick={() => (view === 'year' ? shiftYear(1) : shiftMonth(1))}
            className="rounded-lg border border-[var(--color-border)] p-2 hover:bg-[var(--color-panel-hover)]"
            aria-label={view === 'year' ? 'Próximo ano' : 'Próximo mês'}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!hasAnyPurchases ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">
          Nenhuma compra registrada. Use o formulário acima e escolha a data da compra.
        </p>
      ) : (
        <>
          <PortfolioPurchasesLineChart
            points={linePoints}
            emptyMessage={
              view === 'year'
                ? `Nenhuma compra em ${year}.`
                : `Nenhuma compra em ${MONTH_NAMES[month].toLowerCase()} ${year}.`
            }
          />

          {view === 'year' && peakMonth && peakMonth.totalUsd > 0 && (
            <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
              Maior volume em{' '}
              <span className="font-semibold text-[var(--color-accent)]">
                {MONTH_NAMES[peakMonth.month]}
              </span>
              {' '}
              ({formatPrice(peakMonth.totalUsd)})
            </p>
          )}

          {view === 'year' && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {monthlyLinePoints.map((m, i) => (
                <span
                  key={MONTH_SHORT[i]}
                  className={`rounded px-2 py-0.5 text-[10px] ${
                    m.value > 0
                      ? 'bg-[var(--color-accent)]/10 font-medium text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)]'
                  }`}
                  title={m.value > 0 ? formatPrice(m.value) : undefined}
                >
                  {MONTH_SHORT[i]}
                </span>
              ))}
            </div>
          )}

          {view === 'month' && (
            <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
              Valor investido por dia (USD) · passe o cursor no gráfico
            </p>
          )}

          {view === 'month' && monthPurchases.length > 0 && (
            <ul className="mt-6 space-y-4">
              {groupedByDay.map(({ day, items }) => (
                <li key={day}>
                  <p className="mb-2 text-sm font-semibold text-[var(--color-accent)]">
                    Dia {day} — {MONTH_NAMES[month].toLowerCase()}
                  </p>
                  <ul className="space-y-2">
                    {items.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <img
                            src={p.image}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-full"
                          />
                          <div className="min-w-0">
                            <p className="font-medium">
                              Comprou{' '}
                              <span className="font-mono text-[var(--color-accent)]">
                                {p.quantity} {p.symbol}
                              </span>
                            </p>
                            <p className="text-xs text-[var(--color-muted)]">
                              {formatDayMonth(p.purchasedAt)} · preço{' '}
                              {formatPrice(p.priceUsd)}/un · total{' '}
                              {formatPrice(p.quantity * p.priceUsd)}
                            </p>
                          </div>
                        </div>
                        {onRemovePurchase && (
                          <button
                            type="button"
                            onClick={() => onRemovePurchase(p.id)}
                            className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-danger)]"
                            aria-label="Remover compra"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
