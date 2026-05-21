import { useChartPeriod } from '../../context/ChartPeriodContext'
import { CHART_PERIODS } from '../../constants'

export function ChartPeriodSelector() {
  const { period, setPeriod } = useChartPeriod()

  return (
    <div
      className="inline-flex flex-wrap rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5"
      role="group"
      aria-label="Período do gráfico"
    >
      {CHART_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => setPeriod(p.id)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
            period === p.id
              ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
          aria-pressed={period === p.id}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
