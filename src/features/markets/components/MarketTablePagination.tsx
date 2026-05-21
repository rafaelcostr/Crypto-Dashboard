import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPaginationRange } from '@/shared/utils/pagination'

interface MarketTablePaginationProps {
  totalItems: number
  page: number
  pageSize: number
  pageSizeOptions: readonly number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function MarketTablePagination({
  totalItems,
  page,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: MarketTablePaginationProps) {
  if (totalItems === 0) return null

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalItems)
  const pageNumbers = getPaginationRange(safePage, totalPages)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] px-5 py-4">
      <p className="text-sm text-[var(--color-muted)]">
        Exibindo{' '}
        <span className="font-medium text-[var(--color-text)]">
          {start} – {end}
        </span>{' '}
        de{' '}
        <span className="font-medium text-[var(--color-text)]">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((item, idx) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-sm text-[var(--color-muted)]"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                item === safePage
                  ? 'bg-[var(--color-accent)] text-[#0a0e17]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]'
              }`}
              aria-label={`Página ${item}`}
              aria-current={item === safePage ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <span className="hidden sm:inline">Mostrar</span>
        <span className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-3 pr-8 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            aria-label="Moedas por página"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        </span>
      </label>
    </div>
  )
}
