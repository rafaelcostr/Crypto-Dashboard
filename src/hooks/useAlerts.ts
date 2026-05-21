import { useCallback, useEffect, useRef, useState } from 'react'
import type { LivePrice } from '../types'
import type { AlertCondition, AlertHistoryEntry, PriceAlert } from '../types'

const STORAGE_KEY = 'crypto-dashboard-alerts'
const HISTORY_KEY = 'crypto-dashboard-alert-history'
const NOTIF_KEY = 'crypto-dashboard-notif-enabled'
const MAX_HISTORY = 50

function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PriceAlert[]) : []
  } catch {
    return []
  }
}

function loadHistory(): AlertHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as AlertHistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

function saveHistory(history: AlertHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

function pushBrowserNotification(title: string, body: string) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/vite.svg', tag: 'crypto-alert' })
  } catch {
    /* ignore */
  }
}

type PriceSample = { ts: number; price: number }

export function useAlerts(livePrices: Map<string, LivePrice>) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadAlerts())
  const [history, setHistory] = useState<AlertHistoryEntry[]>(() => loadHistory())
  const [notifications, setNotifications] = useState<string[]>([])
  const [notifEnabled, setNotifEnabled] = useState(
    () => localStorage.getItem(NOTIF_KEY) === 'true',
  )
  const notifiedIds = useRef<Set<string>>(new Set())
  const priceSamples = useRef<Map<string, PriceSample[]>>(new Map())

  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addToHistory = useCallback((entry: Omit<AlertHistoryEntry, 'id'>) => {
    setHistory((h) => [
      { ...entry, id: crypto.randomUUID() },
      ...h,
    ].slice(0, MAX_HISTORY))
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false
    const result = await Notification.requestPermission()
    const ok = result === 'granted'
    setNotifEnabled(ok)
    localStorage.setItem(NOTIF_KEY, String(ok))
    return ok
  }, [])

  const addAlert = useCallback(
    (
      symbol: string,
      name: string,
      condition: AlertCondition,
      targetPrice: number,
      opts?: { percentChange?: number; windowMinutes?: number; referencePrice?: number },
    ) => {
      const alert: PriceAlert = {
        id: crypto.randomUUID(),
        symbol: symbol.toUpperCase(),
        name,
        condition,
        targetPrice,
        percentChange: opts?.percentChange,
        windowMinutes: opts?.windowMinutes ?? 60,
        referencePrice: opts?.referencePrice ?? targetPrice,
        createdAt: Date.now(),
      }
      setAlerts((prev) => [alert, ...prev])
    },
    [],
  )

  const removeAlert = useCallback((id: string) => {
    notifiedIds.current.delete(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.triggered))
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  useEffect(() => {
    if (livePrices.size === 0) return

    const now = Date.now()
    for (const [sym, live] of livePrices) {
      const samples = priceSamples.current.get(sym) ?? []
      samples.push({ ts: now, price: live.price })
      const cutoff = now - 24 * 60 * 60 * 1000
      priceSamples.current.set(
        sym,
        samples.filter((s) => s.ts >= cutoff),
      )
    }

    const newMessages: string[] = []

    setAlerts((prev) => {
      let changed = false
      const next = prev.map((alert) => {
        if (alert.triggered) return alert
        const live = livePrices.get(alert.symbol)
        if (!live) return alert

        let hit = false
        let msg = ''

        if (alert.condition === 'above' || alert.condition === 'below') {
          hit =
            alert.condition === 'above'
              ? live.price >= alert.targetPrice
              : live.price <= alert.targetPrice
          if (hit) {
            msg = `${alert.name} (${alert.symbol}) ${alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })} — agora ${live.price.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}`
          }
        } else if (
          (alert.condition === 'pct_up' || alert.condition === 'pct_down') &&
          alert.percentChange != null
        ) {
          const windowMs = (alert.windowMinutes ?? 60) * 60 * 1000
          const samples = priceSamples.current.get(alert.symbol) ?? []
          const old = samples.find((s) => s.ts <= now - windowMs)
          const base = old?.price ?? alert.referencePrice ?? live.price
          const pct = base > 0 ? ((live.price - base) / base) * 100 : 0

          if (alert.condition === 'pct_up' && pct >= alert.percentChange) {
            hit = true
            msg = `${alert.name} subiu ${pct.toFixed(1)}% em ~${alert.windowMinutes}min (meta +${alert.percentChange}%)`
          }
          if (alert.condition === 'pct_down' && pct <= -alert.percentChange) {
            hit = true
            msg = `${alert.name} caiu ${Math.abs(pct).toFixed(1)}% em ~${alert.windowMinutes}min (meta -${alert.percentChange}%)`
          }
        }

        if (hit && !notifiedIds.current.has(alert.id)) {
          changed = true
          notifiedIds.current.add(alert.id)
          newMessages.push(msg)
          if (notifEnabled) pushBrowserNotification('Alerta Crypto', msg)
          addToHistory({
            message: msg,
            symbol: alert.symbol,
            triggeredAt: Date.now(),
          })
          return { ...alert, triggered: true, triggeredAt: Date.now() }
        }
        return alert
      })
      return changed ? next : prev
    })

    if (newMessages.length > 0) {
      setNotifications((n) => [...newMessages, ...n].slice(0, 5))
    }
  }, [livePrices, notifEnabled, addToHistory])

  const dismissNotification = useCallback((index: number) => {
    setNotifications((n) => n.filter((_, i) => i !== index))
  }, [])

  return {
    alerts,
    history,
    addAlert,
    removeAlert,
    clearTriggered,
    clearHistory,
    notifications,
    dismissNotification,
    notifEnabled,
    requestNotificationPermission,
    canNotify: typeof Notification !== 'undefined',
  }
}
