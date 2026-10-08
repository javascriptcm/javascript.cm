import type { ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import { Check } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { frenchSpacing } from '~/components/forum/typography'
import { MARKS, type Highlight } from '~/components/search/url'
import { cn, plural } from '~/lib/format'

type Author = Data.User | undefined | null

/**
 * One search result: mono kind label, highlighted title and snippet,
 * byline. Title and snippet are HTML escaped by the server, which only
 * re-inserts <mark> tags around the matches.
 */
function ResultRow({
  index,
  href,
  kind,
  highlight,
  fallbackTitle,
  author,
  children,
}: {
  index: number
  href: string
  kind: ReactNode
  highlight: Highlight | undefined
  fallbackTitle: string
  author: Author
  children: ReactNode
}) {
  // frenchSpacing only swaps whitespace before ; : ? ! » (never inside a tag).
  const titleHtml = highlight ? frenchSpacing(highlight.titleHtml) : null
  return (
    <article className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-line py-6 first:border-t-0 sm:gap-x-6">
      <span className="label min-w-[1.75rem] pt-0.5 tabular-nums" aria-hidden="true">
        {String(index).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="label flex flex-wrap items-center gap-x-2 gap-y-1">{kind}</p>
        <h3
          className={cn(
            'mt-2 text-[19px] leading-snug font-semibold tracking-[-0.015em] sm:text-[20px]',
            MARKS
          )}
        >
          <Link
            href={href}
            className="decoration-js decoration-2 underline-offset-4 group-hover:underline focus-visible:underline"
          >
            {titleHtml ? (
              <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
            ) : (
              frenchSpacing(fallbackTitle)
            )}
          </Link>
        </h3>
        {highlight?.snippetHtml && (
          <p
            className={cn(
              'mt-2 line-clamp-3 max-w-[72ch] text-[15px] leading-relaxed text-ink-2',
              MARKS
            )}
            dangerouslySetInnerHTML={{ __html: highlight.snippetHtml }}
          />
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-muted">
          {author && (
            <>
              <Link
                href={`/@${author.username}`}
                className="inline-flex items-center gap-2 text-ink-2 hover:text-ink"
              >
                <Avatar user={author} size="xs" />
                {author.displayName}
              </Link>
              <span aria-hidden="true">·</span>
            </>
          )}
          {children}
        </div>
      </div>
    </article>
  )
}

const Dot = () => <span aria-hidden="true">·</span>

export function ArticleResult({
  article,
  index,
  highlight,
}: {
  article: Data.Article
  index: number
  highlight: Highlight | undefined
}) {
  return (
    <ResultRow
      index={index}
      href={`/articles/${article.slug}`}
      highlight={highlight}
      fallbackTitle={article.title}
      author={article.author}
      kind={
        <>
          <span className="text-ink">Article</span>
          {article.tags?.slice(0, 3).map((tag) => (
            <span key={tag.id}>
              <span className="opacity-60">#</span>
              {tag.name}
            </span>
          ))}
        </>
      }
    >
      <span>
        publié <TimeAgo date={article.publishedAt ?? article.createdAt} />
      </span>
      <Dot />
      <span>{article.readingMinutes} min de lecture</span>
      {article.commentsCount > 0 && (
        <>
          <Dot />
          <span>{plural(article.commentsCount, 'commentaire')}</span>
        </>
      )}
    </ResultRow>
  )
}

export function QuestionResult({
  thread,
  index,
  highlight,
}: {
  thread: Data.Thread
  index: number
  highlight: Highlight | undefined
}) {
  return (
    <ResultRow
      index={index}
      href={`/forum/${thread.slug}`}
      highlight={highlight}
      fallbackTitle={thread.title}
      author={thread.author}
      kind={
        <>
          <span className="text-ink">Question</span>
          <Dot />
          {thread.isSolved ? (
            <span className="inline-flex items-center gap-1 text-ok">
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              Résolue
            </span>
          ) : (
            <span>Ouverte</span>
          )}
          {thread.channel && (
            <>
              <Dot />
              <span>{thread.channel.name}</span>
            </>
          )}
        </>
      }
    >
      <span>
        actif <TimeAgo date={thread.lastActivityAt} />
      </span>
      <Dot />
      <span>{plural(thread.repliesCount, 'réponse', 'réponses', 'aucune réponse')}</span>
    </ResultRow>
  )
}

export function DiscussionResult({
  discussion,
  index,
  highlight,
}: {
  discussion: Data.Discussion
  index: number
  highlight: Highlight | undefined
}) {
  return (
    <ResultRow
      index={index}
      href={`/discussions/${discussion.slug}`}
      highlight={highlight}
      fallbackTitle={discussion.title}
      author={discussion.author}
      kind={
        <>
          <span className="text-ink">Discussion</span>
          {discussion.tags?.slice(0, 3).map((tag) => (
            <span key={tag.id}>
              <span className="opacity-60">#</span>
              {tag.name}
            </span>
          ))}
        </>
      }
    >
      <span>
        active <TimeAgo date={discussion.lastActivityAt} />
      </span>
      <Dot />
      <span>{plural(discussion.repliesCount, 'réponse', 'réponses', 'aucune réponse')}</span>
    </ResultRow>
  )
}
