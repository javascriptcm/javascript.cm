import { Link } from '@inertiajs/react'
import { Lock, MessageSquare, Pin } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { cn } from '~/lib/format'
import { frenchSpacing } from '~/components/forum/typography'

/**
 * Listing rows accept the plain thread (home page) or the forum index
 * variant, which adds a short excerpt.
 */
type Thread = Data.Thread & { excerpt?: string }

export function SolvedBadge({ solved, className }: { solved: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-xs border px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] uppercase',
        solved ? 'border-ok bg-ok text-paper' : 'border-line-2 text-muted',
        className
      )}
    >
      <span aria-hidden="true">{solved ? '✓' : '?'}</span>
      {solved ? 'Résolu' : 'Ouvert'}
    </span>
  )
}

/**
 * Highlight the searched term in a title with the JS-yellow marker.
 */
export function Highlight({ text, term }: { text: string; term?: string }): ReactNode {
  const needle = term?.trim()
  if (!needle) return text
  const lower = text.toLowerCase()
  const target = needle.toLowerCase()
  const parts: ReactNode[] = []
  let cursor = 0
  let index = lower.indexOf(target)
  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index))
    parts.push(
      <mark key={index} className="mark-full">
        {text.slice(index, index + needle.length)}
      </mark>
    )
    cursor = index + needle.length
    index = lower.indexOf(target, cursor)
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}

export function ThreadRow({
  thread,
  showExcerpt = false,
  highlight,
}: {
  thread: Thread
  showExcerpt?: boolean
  highlight?: string
}) {
  return (
    <article className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-2 border-t border-line py-5 first:border-t-0">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <SolvedBadge solved={thread.isSolved} />
          {thread.channel && (
            <Link href={`/forum?channel=${thread.channel.slug}`} className="label hover:text-ink">
              {thread.channel.name}
            </Link>
          )}
          {thread.pinnedAt && (
            <span className="label inline-flex items-center gap-1 text-ink">
              <Pin size={11} aria-hidden="true" /> Épinglé
            </span>
          )}
          {thread.lockedAt && (
            <span className="label inline-flex items-center gap-1">
              <Lock size={11} aria-hidden="true" /> Verrouillé
            </span>
          )}
        </div>
        <h3 className="text-[19px] leading-snug font-semibold tracking-[-0.015em]">
          <Link
            href={`/forum/${thread.slug}`}
            className="decoration-js decoration-2 underline-offset-4 group-hover:underline"
          >
            <Highlight text={frenchSpacing(thread.title)} term={highlight} />
          </Link>
        </h3>
        {showExcerpt && thread.excerpt && (
          <p className="mt-1.5 line-clamp-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-2">
            {thread.excerpt}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-muted">
          {thread.author && (
            <Link
              href={`/@${thread.author.username}`}
              className="inline-flex items-center gap-2 text-ink-2 hover:text-ink"
            >
              <Avatar user={thread.author} size="xs" />
              {thread.author.displayName}
            </Link>
          )}
          <span aria-hidden="true">·</span>
          <span>
            actif <TimeAgo date={thread.lastActivityAt} />
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end pt-0.5 text-right">
        <span className="sr-only">
          {thread.repliesCount > 1
            ? `${thread.repliesCount} réponses`
            : `${thread.repliesCount} réponse`}
        </span>
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 font-mono text-[15px] font-semibold tabular-nums"
        >
          <MessageSquare size={14} className="text-muted" /> {thread.repliesCount}
        </span>
        <span aria-hidden="true" className="label mt-1 hidden sm:block">
          {thread.repliesCount > 1 ? 'réponses' : 'réponse'}
        </span>
      </div>
    </article>
  )
}

export function ThreadList({
  threads,
  showExcerpt = false,
  highlight,
}: {
  threads: Thread[]
  showExcerpt?: boolean
  highlight?: string
}) {
  return (
    <div>
      {threads.map((thread) => (
        <ThreadRow
          key={thread.id}
          thread={thread}
          showExcerpt={showExcerpt}
          highlight={highlight}
        />
      ))}
    </div>
  )
}
