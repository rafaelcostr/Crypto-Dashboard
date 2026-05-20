import { Bell, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AlertCondition, PriceAlert } from '../types'
import { formatPrice } from '../utils/format'

interface AlertsPanelProps {
  alerts: PriceAlert[]
  notifications: string[]
  onAdd: (symbol: string, name: string, condition: AlertCondition, targetPrice: number) => void
  onRemove: (id: string) => void
  onClearTriggered: () => void
  onDismissNotification: (index: number) => void
  preset?: { symbol: string; name: string; price: number } | null
  onClearPreset: () => void
}

export function AlertsPanel({
  alerts,
  notifications,
  onAdd,
  onRemove,
  onClearTriggered,
  onDismissNotification,
  preset,
  onClearPreset,
}: AlertsPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [condition, setCondition] = useState<AlertCondition>('above')
  const [targetPrice, setTargetPrice] = useState('')

  useEffect(() => {
    if (!preset) return
    setSymbol(preset.symbol.toUpperCase())
    setName(preset.name)
    setTargetPrice(String(preset.price))
  }, [preset])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(targetPrice)
    if (!symbol || !name || Number.isNaN(price) || price <= 0) return
    onAdd(symbol, name, condition, price)
    setSymbol('')
    setName('')
    setTargetPrice('')
    onClearPreset()
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-[var(--color-warning)]" />
        <h2 className="text-lg font-semibold">Alertas de Preço</h2>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((msg, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-2 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-sm"
            >
              <span>{msg}</span>
              <button type="button" onClick={() => onDismissNotification(i)} aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Símbolo (ex: BTC)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as AlertCondition)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          >
            <option value="above">Acima de</option>
            <option value="below">Abaixo de</option>
          </select>
          <input
            type="number"
            step="any"
            placeholder="Preço USD"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-accent)] py-2 text-sm font-medium text-[var(--color-surface)] transition hover:bg-[var(--color-accent-dim)]"
        >
          Criar alerta
        </button>
      </form>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)]">
          {alerts.length} alerta(s) · verificação via Binance WS
        </span>
        {alerts.some((a) => a.triggered) && (
          <button
            type="button"
            onClick={onClearTriggered}
            className="text-xs text-[var(--color-muted)] hover:text-white"
          >
            Limpar disparados
          </button>
        )}
      </div>

      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {alerts.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">Nenhum alerta configurado.</li>
        ) : (
          alerts.map((alert) => (
            <li
              key={alert.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                alert.triggered
                  ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5'
                  : 'border-[var(--color-border)]'
              }`}
            >
              <div>
                <span className="font-medium">{alert.name}</span>
                <span className="ml-1 font-mono text-xs text-[var(--color-muted)]">
                  {alert.symbol}
                </span>
                <p className="text-xs text-[var(--color-muted)]">
                  {alert.condition === 'above' ? '>' : '<'} {formatPrice(alert.targetPrice)}
                  {alert.triggered && ' · disparado'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(alert.id)}
                className="text-[var(--color-muted)] hover:text-[var(--color-danger)]"
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
