import { Link } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { Tag } from '~/components/ui/tag'
import { TimeAgo } from '~/components/ui/time-ago'
import { cn, formatShortDate } from '~/lib/format'

type Article = Data.Article

function Byline({ article, className }: { article: Article; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[14px] text-muted', className)}>
      {article.author && (
        <Link href={`/@${article.author.username}`} className="inline-flex items-center gap-2 text-ink-2 hover:text-ink">
          <Avatar user={article.author} size="xs" />
          <span className="font-medium">{article.author.displayName}</span>
        </Link>
      )}
      <span aria-hidden="true">·</span>
      <TimeAgo date={article.publishedAt ?? article.createdAt} />
      <span aria-hidden="true">·</span>
      <span>{article.readingMinutes} min de lecture</span>
    </div>
  )
}

/**
 * The lead story: large title, excerpt, tags.
 */
export function ArticleFeature({ article }: { article: Article }) {
  return (
    <article className="group relative flex h-full flex-col">
      {article.tags && article.tags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((tag) => (
            <Tag key={tag.id} name={tag.name} href={`/articles?tag=${tag.slug}`} />
          ))}
        </div>
      )}
      <h3 className="text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.02] font-bold tracking-[-0.035em]">
        <Link href={`/articles/${article.slug}`} className="decoration-js decoration-[0.14em] underline-offset-[0.12em] group-hover:underline">
          {article.title}
        </Link>
      </h3>
      {article.excerpt && <p className="mt-5 max-w-2xl text-[17.5px] leading-relaxed text-ink-2">{article.excerpt}</p>}
      <Byline article={article} className="mt-auto pt-8" />
    </article>
  )
}

/**
 * Dense row with an index number, for lists and the home page.
 */
export function ArticleRow({ article, index, showExcerpt = true }: { article: Article; index?: number; showExcerpt?: boolean }) {
  return (
    <article className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 border-t border-line py-6 first:border-t-0">
      <span className="label pt-1.5 tabular-nums">{index !== undefined ? String(index).padStart(2, '0') : formatShortDate(article.publishedAt ?? article.createdAt)}</span>
      <div className="min-w-0">
        <h3 className="text-[21px] leading-[1.18] font-semibold tracking-[-0.02em]">
          <Link href={`/articles/${article.slug}`} className="decoration-js decoration-2 underline-offset-4 group-hover:underline">
            {article.title}
          </Link>
        </h3>
        {showExcerpt && article.excerpt && <p className="mt-2 line-clamp-2 text-[15.5px] text-ink-2">{article.excerpt}</p>}
        <Byline article={article} className="mt-3" />
      </div>
    </article>
  )
}

export function ArticleList({ articles, numbered = false, showExcerpt = true }: { articles: Article[]; numbered?: boolean; showExcerpt?: boolean }) {
  return (
    <div>
      {articles.map((article, i) => (
        <ArticleRow key={article.id} article={article} index={numbered ? i + 1 : undefined} showExcerpt={showExcerpt} />
      ))}
    </div>
  )
}
