import { NavLink, Outlet } from 'react-router-dom'
import { ChartBackgroundToggle } from '../components/charts/ChartBackgroundToggle'
import { ChartPeriodSelector } from '../components/charts/ChartPeriodSelector'
import { ChartThemeProvider } from '../context/ChartThemeContext'
import { ChartPeriodProvider } from '../context/ChartPeriodContext'
import { useChartBackground } from '../context/ChartThemeContext'
import { CHART_CATALOG } from '../data/chartCatalog'
import { CHART_UI } from '../data/chartThemes'

function ChartsLayoutInner() {
  const { chartBackground } = useChartBackground()
  const ui = CHART_UI[chartBackground]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gráficos On-Chain</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Métricas estilo{' '}
            <a
              href="https://www.bitcoinmagazinepro.com/charts/mvrv-zscore/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              Bitcoin Magazine Pro
            </a>{' '}
            · MVRV, hash rate, ETH, medo e ganância
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChartPeriodSelector />
          <ChartBackgroundToggle />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 lg:w-56">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            On-Chain
          </p>
          <ul className="mb-4 space-y-0.5">
            {CHART_CATALOG.filter((c) => c.category === 'on-chain').map((chart) => (
              <li key={chart.id}>
                <NavLink
                  to={`/charts/${chart.id}`}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-[var(--color-accent)]/15 font-medium text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)]'
                    }`
                  }
                >
                  {chart.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Mercado
          </p>
          <ul className="space-y-0.5">
            {CHART_CATALOG.filter((c) => c.category === 'mercado').map((chart) => (
              <li key={chart.id}>
                <NavLink
                  to={`/charts/${chart.id}`}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-[var(--color-accent)]/15 font-medium text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)]'
                    }`
                  }
                >
                  {chart.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <div
          className={`min-w-0 flex-1 rounded-xl border p-5 shadow-sm ${ui.panelBorder} ${ui.panelBg}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export function ChartsLayout() {
  return (
    <ChartThemeProvider>
      <ChartPeriodProvider>
        <ChartsLayoutInner />
      </ChartPeriodProvider>
    </ChartThemeProvider>
  )
}
