import { useCallback, useEffect, useState } from 'react'
import type { LivePrice } from '../types'
import type { AlertCondition, PriceAlert } from '../types'

const STORAGE_KEY = 'crypto-dashboard-alerts'

function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PriceAlert[]) : []
  } catch {
    return []
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function useAlerts(livePrices: Map<string, LivePrice>) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(loadAlerts)
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  const addAlert = useCallback(
    (symbol: string, name: string, condition: AlertCondition, targetPrice: number) => {
      const alert: PriceAlert = {
        id: crypto.randomUUID(),
        symbol: symbol.toUpperCase(),
        name,
        condition,
        targetPrice,
        createdAt: Date.now(),
      }
      setAlerts((prev) => [alert, ...prev])
    },
    [],
  )

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.triggered))
  }, [])

  useEffect(() => {
    if (livePrices.size === 0) return

    setAlerts((prev) => {
      let changed = false
      const next = prev.map((alert) => {
        if (alert.triggered) return alert
        const live = livePrices.get(alert.symbol)
        if (!live) return alert

        const hit =
          alert.condition === 'above'
            ? live.price >= alert.targetPrice
            : live.price <= alert.targetPrice

        if (hit) {
          changed = true
          const msg = `${alert.name} (${alert.symbol}) ${alert.condition === 'above' ? 'subiu acima' : 'caiu abaixo'} de ${alert.targetPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })} — agora ${live.price.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}`
          setNotifications((n) => [msg, ...n].slice(0, 5))
          return { ...alert, triggered: true, triggeredAt: Date.now() }
        }
        return alert
      })
      return changed ? next : prev
    })
  }, [livePrices])

  const dismissNotification = useCallback((index: number) => {
    setNotifications((n) => n.filter((_, i) => i !== index))
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    notifications,
    dismissNotification,
  }
}
