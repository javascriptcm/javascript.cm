import { Link } from '@inertiajs/react'
import { Pin } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { Tag } from '~/components/ui/tag'
import { TimeAgo } from '~/components/ui/time-ago'
import { plural } from '~/lib/format'

type Discussion = Data.Discussion

export function DiscussionRow({ discussion }: { discussion: Discussion }) {
  return (
    <article className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-line py-5 first:border-t-0">
      {discussion.author ? (
        <Link href={`/@${discussion.author.username}`} aria-label={discussion.author.displayName}>
          <Avatar user={discussion.author} size="md" />
        </Link>
      ) : (
        <span />
      )}
      <div className="min-w-0">
        <h3 className="text-[19px] leading-snug font-semibold tracking-[-0.015em]">
          {discussion.pinnedAt && <Pin size={14} className="mr-1.5 inline -translate-y-0.5" aria-label="Épinglée" />}
          <Link href={`/discussions/${discussion.slug}`} className="decoration-js decoration-2 underline-offset-4 group-hover:underline">
            {discussion.title}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-muted">
          {discussion.author && <span className="text-ink-2">{discussion.author.displayName}</span>}
          <span aria-hidden="true">·</span>
          <TimeAgo date={discussion.lastActivityAt} />
          <span aria-hidden="true">·</span>
          <span>{plural(discussion.repliesCount, 'réponse', 'réponses', 'aucune réponse')}</span>
        </div>
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {discussion.tags.slice(0, 4).map((tag) => (
              <Tag key={tag.id} name={tag.name} href={`/discussions?tag=${tag.slug}`} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export function DiscussionList({ discussions }: { discussions: Discussion[] }) {
  return (
    <div>
      {discussions.map((discussion) => (
        <DiscussionRow key={discussion.id} discussion={discussion} />
      ))}
    </div>
  )
}
