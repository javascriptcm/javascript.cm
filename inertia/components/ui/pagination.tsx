import { Link, usePage } from '@inertiajs/react'
import { cn } from '~/lib/format'

export type PaginationMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

function pageHref(url: string, page: number) {
  const [path, query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  if (page <= 1) params.delete('page')
  else params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

function pageWindow(current: number, last: number): (number | '…')[] {
  const pages = new Set([1, last, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push('…')
    result.push(page)
  })
  return result
}

/**
 * Pagination for Lucid paginator metadata. Keeps the current query string.
 */
export function Pagination({ meta, className }: { meta: PaginationMeta; className?: string }) {
  const { url } = usePage()
  if (!meta || meta.lastPage <= 1) return null

  const cell =
    'inline-grid h-10 min-w-10 place-items-center rounded-sm border px-3 font-mono text-[13px] font-medium transition-colors duration-150'

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6',
        className
      )}
    >
      <p className="label">
        Page {meta.currentPage} / {meta.lastPage} · {meta.total} au total
      </p>
      <ul className="flex flex-wrap items-center gap-1.5">
        {meta.currentPage > 1 && (
          <li>
            <Link
              href={pageHref(url, meta.currentPage - 1)}
              className={cn(cell, 'border-line-2 hover:border-ink hover:bg-ink hover:text-paper')}
              rel="prev"
            >
              ← <span className="sr-only">Page précédente</span>
            </Link>
          </li>
        )}
        {pageWindow(meta.currentPage, meta.lastPage).map((page, i) =>
          page === '…' ? (
            <li key={`gap-${i}`} className="px-1 font-mono text-muted">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={pageHref(url, page)}
                aria-current={page === meta.currentPage ? 'page' : undefined}
                className={cn(
                  cell,
                  page === meta.currentPage
                    ? 'border-ink bg-js text-js-ink'
                    : 'border-line-2 hover:border-ink hover:bg-ink hover:text-paper'
                )}
              >
                {page}
              </Link>
            </li>
          )
        )}
        {meta.currentPage < meta.lastPage && (
          <li>
            <Link
              href={pageHref(url, meta.currentPage + 1)}
              className={cn(cell, 'border-line-2 hover:border-ink hover:bg-ink hover:text-paper')}
              rel="next"
            >
              → <span className="sr-only">Page suivante</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
