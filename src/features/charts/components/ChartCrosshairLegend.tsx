import type { CrosshairRow } from '@/features/charts/hooks/useChartCrosshair'

interface ChartCrosshairLegendProps {
  dateLabel: string | null
  rows: CrosshairRow[]
  className?: string
}

export function ChartCrosshairLegend({ dateLabel, rows, className = '' }: ChartCrosshairLegendProps) {
  if (!dateLabel && rows.length === 0) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-3 border-t px-4 py-2 text-xs ${className}`}
    >
      {dateLabel && <span className="font-medium">{dateLabel}</span>}
      {rows.map((r) => (
        <span key={r.label} className="flex items-center gap-1.5">
          {r.color && (
            <span
              className="inline-block h-0.5 w-4 rounded"
              style={{ backgroundColor: r.color }}
            />
          )}
          <span className="text-[var(--color-muted)]">{r.label}:</span>
          <span className="font-mono">{r.value}</span>
        </span>
      ))}
    </div>
  )
}
