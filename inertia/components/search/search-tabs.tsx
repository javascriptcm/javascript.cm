import { Link } from '@inertiajs/react'
import { SECTIONS, searchHref, type SearchCounts, type SearchType } from '~/components/search/url'
import { cn, formatNumber } from '~/lib/format'

/**
 * Content-type tabs with the number of matches of each kind.
 */
export function SearchTabs({
  q,
  type,
  counts,
}: {
  q: string
  type: SearchType
  counts: SearchCounts
}) {
  const total = counts.articles + counts.questions + counts.discussions
  const tabs: { value: SearchType; label: string; count: number }[] = [
    { value: 'tout', label: 'Tout', count: total },
    ...SECTIONS.map((section) => ({
      value: section.value,
      label: section.label,
      count: counts[section.value],
    })),
  ]

  return (
    <nav aria-label="Type de contenu">
      <ul className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const current = tab.value === type
          return (
            <li key={tab.value}>
              <Link
                href={searchHref({ q, type: tab.value })}
                preserveState
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-[14px] font-medium transition-colors duration-150',
                  current
                    ? 'border-ink bg-ink text-paper'
                    : tab.count
                      ? 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                      : 'border-line text-muted hover:border-line-2 hover:text-ink-2'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'font-mono text-[12px] tabular-nums',
                    current ? 'rounded-xs bg-js px-1 text-js-ink' : 'text-muted'
                  )}
                >
                  {formatNumber(tab.count)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
