import { Link } from '@inertiajs/react'
import { MessageSquare, Pin } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { cn } from '~/lib/format'

type Thread = Data.Thread

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

export function ThreadRow({ thread }: { thread: Thread }) {
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
              <Pin size={11} /> Épinglé
            </span>
          )}
        </div>
        <h3 className="text-[19px] leading-snug font-semibold tracking-[-0.015em]">
          <Link href={`/forum/${thread.slug}`} className="decoration-js decoration-2 underline-offset-4 group-hover:underline">
            {thread.title}
          </Link>
        </h3>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-muted">
          {thread.author && (
            <Link href={`/@${thread.author.username}`} className="inline-flex items-center gap-2 text-ink-2 hover:text-ink">
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
      <div className="flex flex-col items-end pt-0.5 text-right" aria-label={`${thread.repliesCount} réponses`}>
        <span className="inline-flex items-center gap-1.5 font-mono text-[15px] font-semibold tabular-nums">
          <MessageSquare size={14} className="text-muted" /> {thread.repliesCount}
        </span>
        <span className="label mt-1 hidden sm:block">réponses</span>
      </div>
    </article>
  )
}

export function ThreadList({ threads }: { threads: Thread[] }) {
  return (
    <div>
      {threads.map((thread) => (
        <ThreadRow key={thread.id} thread={thread} />
      ))}
    </div>
  )
}
