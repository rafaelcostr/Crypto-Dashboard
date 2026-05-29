import { Camera, Clock } from 'lucide-react'
import { downloadChartPng } from '@/shared/utils/exportChart'

interface ChartToolbarProps {
  chartContainerRef?: React.RefObject<HTMLDivElement | null>
  exportFilename?: string
  updatedAt?: number | null
  loading?: boolean
}

function formatRelative(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'agora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  return `há ${h}h`
}

export function ChartToolbar({
  chartContainerRef,
  exportFilename = 'gráfico.png',
  updatedAt,
  loading,
}: ChartToolbarProps) {
  function handleExport() {
    const el = chartContainerRef?.current
    if (!el) return
    const ok = downloadChartPng(el, exportFilename)
    if (!ok) alert('Não foi possível exportar. Aguarde o gráfico carregar.')
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex items-center gap-2">
        {updatedAt && !loading && (
          <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
            <Clock className="h-3.5 w-3.5" />
            Atualizado {formatRelative(updatedAt)}
          </span>
        )}
        <button
          type="button"
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] disabled:opacity-50"
          title="Exportar PNG"
        >
          <Camera className="h-3.5 w-3.5" />
          PNG
        </button>
      </div>
    </div>
  )
}
