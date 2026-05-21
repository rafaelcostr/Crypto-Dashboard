import { History, Trash2 } from 'lucide-react'
import type { AlertHistoryEntry } from '@/shared/types'

interface AlertHistoryProps {
  history: AlertHistoryEntry[]
  onClear: () => void
}

export function AlertHistory({ history, onClear }: AlertHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)]">
          <History className="h-3.5 w-3.5" />
          Histórico de alertas
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[var(--color-muted)] hover:text-[var(--color-danger)]"
          aria-label="Limpar histórico"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-[var(--color-muted)]">
        {history.slice(0, 10).map((h) => (
          <li key={h.id}>
            {new Date(h.triggeredAt).toLocaleString('pt-BR')} — {h.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
