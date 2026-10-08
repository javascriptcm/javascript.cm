import { Link } from '@inertiajs/react'
import { Check, Heart } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { cn } from '~/lib/format'

/**
 * Mirrors `replySummary()` in app/controllers/profile_controller.ts.
 */
export type ReplySummary = {
  id: number
  excerpt: string
  createdAt: string
  likesCount: number
  isSolution: boolean
  parent: {
    type: 'thread' | 'discussion' | 'article'
    title: string
    url: string
    anchor: string
  } | null
  author: Data.User | null
}

const PARENT_LABEL = { thread: 'Forum', discussion: 'Discussion', article: 'Article' } as const

/**
 * Compact list of replies: where it was posted, an excerpt, a link to the
 * exact reply. With `showAuthor`, reads as an activity feed.
 */
export function ReplySummaryList({
  replies,
  showAuthor = false,
  className,
}: {
  replies: ReplySummary[]
  showAuthor?: boolean
  className?: string
}) {
  return (
    <ol className={className}>
      {replies.map((reply) => (
        <li key={reply.id} className="border-t border-line first:border-t-0">
          <article
            className={cn(
              'group relative grid gap-x-4 py-5',
              showAuthor && reply.author && 'grid-cols-[auto_minmax(0,1fr)]'
            )}
          >
            {showAuthor && reply.author && <Avatar user={reply.author} size="sm" />}
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
                {showAuthor && reply.author ? (
                  <span>
                    <span className="font-semibold text-ink">{reply.author.displayName}</span>{' '}
                    {reply.parent?.type === 'article' ? 'a commenté' : 'a répondu'}
                  </span>
                ) : (
                  reply.parent && (
                    <span className="label text-ink-2">{PARENT_LABEL[reply.parent.type]}</span>
                  )
                )}
                <span aria-hidden="true">·</span>
                <TimeAgo date={reply.createdAt} />
              </p>
              {reply.parent ? (
                <h3 className="mt-1.5 text-[16.5px] leading-snug font-semibold tracking-[-0.01em]">
                  <Link
                    href={reply.parent.anchor}
                    className="decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
                  >
                    {showAuthor && (
                      <span className="label mr-1.5 align-[0.1em] text-ink-2">
                        {PARENT_LABEL[reply.parent.type]}
                      </span>
                    )}
                    <span className="sr-only">Réponse sur </span>« {reply.parent.title} »
                  </Link>
                </h3>
              ) : null}
              {reply.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-relaxed text-ink-2">
                  {reply.excerpt}
                </p>
              )}
              {(reply.isSolution || reply.likesCount > 0) && (
                <p className="mt-2.5 flex flex-wrap items-center gap-2">
                  {reply.isSolution && (
                    <span className="inline-flex h-6 items-center gap-1 rounded-xs border border-ok bg-ok px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-paper uppercase">
                      <Check size={12} strokeWidth={2.5} aria-hidden="true" /> Solution
                    </span>
                  )}
                  {reply.likesCount > 0 && (
                    <span className="inline-flex items-center gap-1 font-mono text-[12.5px] text-muted tabular-nums">
                      <Heart size={12} aria-hidden="true" /> {reply.likesCount}
                      <span className="sr-only">j’aime</span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </article>
        </li>
      ))}
    </ol>
  )
}
