import { Activity, Bitcoin } from 'lucide-react'

interface HeaderProps {
  wsConnected: boolean
  lastUpdate?: string
}

export function Header({ wsConnected, lastUpdate }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
          <Bitcoin className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crypto Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Preços em tempo real · Ranking · Alertas · Notícias
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
          <Activity
            className={`h-4 w-4 ${wsConnected ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}`}
          />
          <span>
            Binance WS:{' '}
            <span className={wsConnected ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}>
              {wsConnected ? 'Conectado' : 'Reconectando...'}
            </span>
          </span>
        </div>
        {lastUpdate && (
          <span className="text-[var(--color-muted)]">Ranking: {lastUpdate}</span>
        )}
      </div>
    </header>
  )
}
