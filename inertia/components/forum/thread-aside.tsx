import { Link } from '@inertiajs/react'
import type { ReactNode } from 'react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { cn, formatNumber } from '~/lib/format'
import { frenchSpacing } from '~/components/forum/typography'

export function AsideHeading({
  id,
  children,
  count,
}: {
  id: string
  children: ReactNode
  count?: number
}) {
  return (
    <h2
      id={id}
      className="label flex items-baseline justify-between border-t border-ink pt-4 text-ink"
    >
      <span>
        <span className="mr-2 text-muted">[—]</span>
        {children}
      </span>
      {count !== undefined && <span className="tabular-nums">{formatNumber(count)}</span>}
    </h2>
  )
}

/**
 * Index card of a thread / discussion: label → value rows.
 */
export function MetaList({
  id,
  title,
  rows,
}: {
  id: string
  title: string
  rows: { label: string; value: ReactNode }[]
}) {
  return (
    <section aria-labelledby={id}>
      <AsideHeading id={id}>{title}</AsideHeading>
      <dl className="mt-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
          >
            <dt className="label">{row.label}</dt>
            <dd className="min-w-0 truncate text-right text-[14.5px] text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * Avatars of the people who took part, linking to their profiles.
 */
export function ParticipantsGrid({
  id,
  title,
  users,
  total,
  empty,
}: {
  id: string
  title: string
  users: Data.User[]
  total: number
  empty: string
}) {
  return (
    <section aria-labelledby={id}>
      <AsideHeading id={id} count={total}>
        {title}
      </AsideHeading>
      {users.length ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/@${user.username}`}
                title={user.displayName}
                aria-label={user.displayName}
                className="block rounded-sm transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
              >
                <Avatar user={user} size="md" />
              </Link>
            </li>
          ))}
          {total > users.length && (
            <li className="grid size-10 place-items-center rounded-sm border border-dashed border-line-2 font-mono text-[12px] text-muted">
              +{total - users.length}
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-3 text-[14.5px] text-muted">{empty}</p>
      )}
    </section>
  )
}

/**
 * Compact list of related threads (same channel).
 */
export function SimilarThreads({ id, threads }: { id: string; threads: Data.Thread[] }) {
  if (!threads.length) return null
  return (
    <section aria-labelledby={id}>
      <AsideHeading id={id}>Questions similaires</AsideHeading>
      <ul className="mt-1">
        {threads.map((thread) => (
          <li key={thread.id} className="border-b border-line">
            <Link
              href={`/forum/${thread.slug}`}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'font-mono text-[12px] font-semibold',
                  thread.isSolved ? 'text-ok' : 'text-muted'
                )}
              >
                {thread.isSolved ? '✓' : '?'}
              </span>
              <span className="text-[15px] leading-snug text-ink-2 decoration-js decoration-2 underline-offset-4 group-hover:text-ink group-hover:underline">
                {frenchSpacing(thread.title)}
                <span className="sr-only">
                  {' '}
                  ({thread.isSolved ? 'résolue' : 'ouverte'}, {thread.repliesCount} réponse
                  {thread.repliesCount > 1 ? 's' : ''})
                </span>
              </span>
              <span aria-hidden="true" className="font-mono text-[12px] text-muted tabular-nums">
                {thread.repliesCount}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
