import { Link } from '@inertiajs/react'
import { Lock, Pin } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { Tag } from '~/components/ui/tag'
import { TimeAgo } from '~/components/ui/time-ago'
import { Highlight } from '~/components/forum/thread-list'
import { AvatarStack } from '~/components/discussions/participants'
import { plural } from '~/lib/format'
import { frenchSpacing } from '~/components/forum/typography'

/**
 * Listing rows accept the plain discussion (home page) or the index
 * variant, which adds an excerpt and the latest participants.
 */
type Discussion = Data.Discussion & {
  excerpt?: string
  participants?: Data.User[]
  participantsCount?: number
}

export function DiscussionRow({
  discussion,
  showExcerpt = false,
  highlight,
  activeTag,
}: {
  discussion: Discussion
  showExcerpt?: boolean
  highlight?: string
  activeTag?: string | null
}) {
  const others = discussion.participants ?? []
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
          {discussion.pinnedAt && (
            <Pin
              size={14}
              className="mr-1.5 inline -translate-y-0.5"
              role="img"
              aria-label="Épinglée"
            />
          )}
          <Link
            href={`/discussions/${discussion.slug}`}
            className="decoration-js decoration-2 underline-offset-4 group-hover:underline"
          >
            <Highlight text={frenchSpacing(discussion.title)} term={highlight} />
          </Link>
          {discussion.lockedAt && (
            <Lock
              size={13}
              className="ml-1.5 inline -translate-y-0.5 text-muted"
              role="img"
              aria-label="Verrouillée"
            />
          )}
        </h3>
        {showExcerpt && discussion.excerpt && (
          <p className="mt-1.5 line-clamp-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-2">
            {discussion.excerpt}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-muted">
          {discussion.author && <span className="text-ink-2">{discussion.author.displayName}</span>}
          <span aria-hidden="true">·</span>
          <TimeAgo date={discussion.lastActivityAt} />
          <span aria-hidden="true">·</span>
          <span>{plural(discussion.repliesCount, 'réponse', 'réponses', 'aucune réponse')}</span>
          {others.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-2">
                <AvatarStack users={others} />
                <span>
                  {plural(discussion.participantsCount ?? others.length + 1, 'participant')}
                </span>
              </span>
            </>
          )}
        </div>
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {discussion.tags.slice(0, 4).map((tag) => (
              <Tag
                key={tag.id}
                name={tag.name}
                href={`/discussions?tag=${tag.slug}`}
                active={tag.slug === activeTag}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export function DiscussionList({
  discussions,
  showExcerpt = false,
  highlight,
  activeTag,
}: {
  discussions: Discussion[]
  showExcerpt?: boolean
  highlight?: string
  activeTag?: string | null
}) {
  return (
    <div>
      {discussions.map((discussion) => (
        <DiscussionRow
          key={discussion.id}
          discussion={discussion}
          showExcerpt={showExcerpt}
          highlight={highlight}
          activeTag={activeTag}
        />
      ))}
    </div>
  )
}
