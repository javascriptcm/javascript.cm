import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { CircleCheck, CircleX } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { cn } from '~/lib/format'

/**
 * "Solution acceptée" call-out shown near the top of a solved thread.
 */
export function SolutionCallout({
  reply,
  excerpt,
  href,
}: {
  reply: Data.Reply
  excerpt: string
  href: string
}) {
  return (
    <section
      aria-labelledby="solution-title"
      className="relative mt-9 rounded-sm border border-ok bg-card px-5 py-5 sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="solution-title" className="label inline-flex items-center gap-2 text-ok">
          <CircleCheck size={15} strokeWidth={2} aria-hidden="true" />
          Solution acceptée
        </h2>
        <a
          href={href}
          className="group inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium tracking-[0.06em] text-ink uppercase"
        >
          <span className="link-draw">Lire la solution</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-out-expo group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </a>
      </div>
      {excerpt && (
        <p className="mt-3 line-clamp-3 text-[16px] leading-relaxed text-ink">{excerpt}</p>
      )}
      {reply.author && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
          <Link
            href={`/@${reply.author.username}`}
            className="inline-flex items-center gap-2 font-medium text-ink-2 hover:text-ink"
          >
            <Avatar user={reply.author} size="xs" />
            {reply.author.displayName}
          </Link>
          <span aria-hidden="true">·</span>
          <span>
            a répondu <TimeAgo date={reply.createdAt} />
          </span>
        </p>
      )}
    </section>
  )
}

/**
 * Green badge on the accepted reply.
 */
export function SolutionBadge() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-xs border border-ok bg-ok px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-paper uppercase">
      <span aria-hidden="true">✓</span> Solution
    </span>
  )
}

/**
 * Accept / withdraw the solution (thread author or moderators).
 */
export function SolutionToggle({
  threadSlug,
  replyId,
  isSolution,
}: {
  threadSlug: string
  replyId: number
  isSolution: boolean
}) {
  const [processing, setProcessing] = useState(false)

  function toggle() {
    setProcessing(true)
    const options = { preserveScroll: true, onFinish: () => setProcessing(false) }
    if (isSolution) router.delete(`/forum/${threadSlug}/solution`, options)
    else router.post(`/forum/${threadSlug}/solution`, { replyId }, options)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={processing}
      aria-busy={processing || undefined}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-50',
        isSolution
          ? 'border-line-2 text-muted hover:border-danger hover:text-danger'
          : 'border-line-2 text-ink-2 hover:border-ok hover:bg-ok hover:text-paper'
      )}
    >
      {isSolution ? (
        <CircleX size={14} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <CircleCheck size={14} strokeWidth={1.75} aria-hidden="true" />
      )}
      {isSolution ? 'Retirer la solution' : 'Marquer comme solution'}
    </button>
  )
}
