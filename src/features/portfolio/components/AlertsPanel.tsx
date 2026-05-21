import { Bell, BellRing, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AlertCondition, AlertHistoryEntry, PriceAlert } from '@/shared/types'
import { formatPrice } from '@/shared/utils/format'

interface AlertsPanelProps {
  alerts: PriceAlert[]
  notifications: string[]
  onAdd: (
    symbol: string,
    name: string,
    condition: AlertCondition,
    targetPrice: number,
    opts?: { percentChange?: number; windowMinutes?: number; referencePrice?: number },
  ) => void
  history?: AlertHistoryEntry[]
  onClearHistory?: () => void
  onRemove: (id: string) => void
  onClearTriggered: () => void
  onDismissNotification: (index: number) => void
  preset?: { symbol: string; name: string; price: number } | null
  onClearPreset: () => void
  notifEnabled?: boolean
  canNotify?: boolean
  onEnableNotifications?: () => void
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
  notifEnabled,
  canNotify,
  onEnableNotifications,
  history,
  onClearHistory,
}: AlertsPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [condition, setCondition] = useState<AlertCondition>('above')
  const [targetPrice, setTargetPrice] = useState('')
  const [percentChange, setPercentChange] = useState('5')
  const [windowMinutes, setWindowMinutes] = useState('60')

  useEffect(() => {
    if (!preset) return
    setSymbol(preset.symbol.toUpperCase())
    setName(preset.name)
    setTargetPrice(String(preset.price))
  }, [preset])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(targetPrice)
    if (!symbol || !name) return

    if (condition === 'pct_up' || condition === 'pct_down') {
      const pct = parseFloat(percentChange)
      const win = parseInt(windowMinutes, 10)
      if (Number.isNaN(pct) || pct <= 0 || Number.isNaN(win)) return
      onAdd(symbol, name, condition, price || 0, {
        percentChange: pct,
        windowMinutes: win,
        referencePrice: price > 0 ? price : undefined,
      })
    } else {
      if (Number.isNaN(price) || price <= 0) return
      onAdd(symbol, name, condition, price)
    }
    setSymbol('')
    setName('')
    setTargetPrice('')
    onClearPreset()
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--color-warning)]" />
          <h2 className="text-lg font-semibold">Alertas de Preço</h2>
        </div>
        {canNotify && onEnableNotifications && !notifEnabled && (
          <button
            type="button"
            onClick={onEnableNotifications}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-warning)]/40 px-2 py-1 text-xs text-[var(--color-warning)]"
          >
            <BellRing className="h-3.5 w-3.5" />
            Ativar push
          </button>
        )}
        {notifEnabled && (
          <span className="text-xs text-[var(--color-accent)]">Push ativo</span>
        )}
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
            <option value="pct_up">Subiu % em</option>
            <option value="pct_down">Caiu % em</option>
          </select>
          {condition === 'pct_up' || condition === 'pct_down' ? (
            <>
              <input
                type="number"
                step="any"
                placeholder="% (ex: 5)"
                value={percentChange}
                onChange={(e) => setPercentChange(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
              <input
                type="number"
                placeholder="Minutos (ex: 60)"
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(e.target.value)}
                className="col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </>
          ) : (
            <input
              type="number"
              step="any"
              placeholder="Preço USD"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          )}
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
                  {alert.condition === 'above' && `> ${formatPrice(alert.targetPrice)}`}
                  {alert.condition === 'below' && `< ${formatPrice(alert.targetPrice)}`}
                  {alert.condition === 'pct_up' &&
                    `+${alert.percentChange}% em ${alert.windowMinutes}min`}
                  {alert.condition === 'pct_down' &&
                    `-${alert.percentChange}% em ${alert.windowMinutes}min`}
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

      {history && history.length > 0 && onClearHistory && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <div className="mb-2 flex justify-between text-xs text-[var(--color-muted)]">
            <span>Histórico recente</span>
            <button type="button" onClick={onClearHistory} className="hover:underline">
              Limpar
            </button>
          </div>
          <ul className="max-h-24 space-y-1 overflow-y-auto text-xs">
            {history.slice(0, 5).map((h) => (
              <li key={h.id}>{h.message}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
