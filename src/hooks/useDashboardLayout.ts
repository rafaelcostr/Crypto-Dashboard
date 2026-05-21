import { useCallback, useEffect, useState } from 'react'
import { DASHBOARD_WIDGETS, type DashboardWidgetId } from '../constants'

const KEY = 'crypto-dashboard-widgets'

function load(): DashboardWidgetId[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return [...DASHBOARD_WIDGETS]
    const parsed = JSON.parse(raw) as DashboardWidgetId[]
    return DASHBOARD_WIDGETS.filter((w) => parsed.includes(w))
  } catch {
    return [...DASHBOARD_WIDGETS]
  }
}

export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<DashboardWidgetId[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(widgets))
  }, [widgets])

  const toggle = useCallback((id: DashboardWidgetId) => {
    setWidgets((w) =>
      w.includes(id) ? w.filter((x) => x !== id) : [...w, id],
    )
  }, [])

  const isVisible = useCallback((id: DashboardWidgetId) => widgets.includes(id), [widgets])

  return { widgets, toggle, isVisible }
}
