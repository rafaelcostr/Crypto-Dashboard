/** Exporta canvas do gráfico lightweight-charts como PNG */
export function downloadChartPng(container: HTMLElement | null, filename: string): boolean {
  if (!container) return false

  const canvas = container.querySelector('canvas')
  if (!canvas) return false

  try {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    return true
  } catch {
    return false
  }
}
