import { Monitor, Moon, Sun } from 'lucide-react'
import { useChartBackground } from '../../context/ChartThemeContext'
import type { ChartBackgroundMode } from '../../context/ChartThemeContext'

const OPTIONS: {
  id: ChartBackgroundMode
  label: string
  icon: typeof Sun
}[] = [
  { id: 'auto', label: 'Auto', icon: Monitor },
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Escuro', icon: Moon },
]

export function ChartBackgroundToggle() {
  const { chartBackgroundMode, setChartBackgroundMode } = useChartBackground()

  return (
    <div
      className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5"
      role="group"
      aria-label="Fundo do gráfico"
    >
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = chartBackgroundMode === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setChartBackgroundMode(id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
