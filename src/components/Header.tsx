import { Activity, Bitcoin, Moon, Sun } from 'lucide-react'
import type { WsStatus } from '../api/binance'
import { useTheme } from '../context/ThemeContext'

interface HeaderProps {
  wsStatus: WsStatus
  wsDetail?: string
  lastUpdate?: string
}

function statusLabel(status: WsStatus, detail?: string): { text: string; live: boolean } {
  if (detail?.startsWith('Reconectando')) {
    return { text: detail, live: false }
  }
  switch (status) {
    case 'live':
      return { text: 'Ao vivo', live: true }
    case 'connected':
      return { text: 'Sincronizando...', live: false }
    case 'connecting':
      return { text: 'Conectando...', live: false }
    case 'error':
      return { text: detail ?? 'Erro', live: false }
    default:
      return { text: 'Offline', live: false }
  }
}

export function Header({ wsStatus, wsDetail, lastUpdate }: HeaderProps) {
  const { text, live } = statusLabel(wsStatus, wsDetail)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
          <Bitcoin className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crypto Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Portfólio · Alertas ·{' '}
            <a href="#noticias" className="text-[var(--color-accent)] hover:underline">
              Notícias PT-BR
            </a>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-2 transition hover:bg-[var(--color-panel-hover)]"
          aria-label={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
          <Activity
            className={`h-4 w-4 ${live ? 'text-[var(--color-accent)]' : wsStatus === 'error' ? 'text-[var(--color-danger)]' : 'text-[var(--color-muted)]'}`}
          />
          <span>
            Binance:{' '}
            <span
              className={
                live
                  ? 'text-[var(--color-accent)]'
                  : wsStatus === 'error'
                    ? 'text-[var(--color-danger)]'
                    : 'text-[var(--color-muted)]'
              }
            >
              {text}
            </span>
          </span>
        </div>
        {lastUpdate && (
          <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[var(--color-muted)]">
            Ranking {lastUpdate}
          </span>
        )}
      </div>
    </header>
  )
}
