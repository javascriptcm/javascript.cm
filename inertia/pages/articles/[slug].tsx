import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Pencil, Send, Settings2, Star, StarOff, Trash2 } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Button, ButtonLink } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { EmptyState } from '~/components/ui/empty-state'
import { Menu, MenuAction, MenuDivider, MenuLink } from '~/components/ui/menu'
import { Prose } from '~/components/ui/prose'
import { Tag } from '~/components/ui/tag'
import { ReplyList } from '~/components/replies/reply-list'
import { ReplyForm } from '~/components/replies/reply-form'
import { AuthorCard, LikeButton, ShareLinks } from '~/components/articles/article-aside'
import { ReportButton } from '~/components/reports/report-dialog'
import { formatDate, formatShortDate, plural } from '~/lib/format'

type Article = Data.Article.Variants['forDetail']

type Props = {
  article: Article
  author: Data.User.Variants['forProfile']
  authorArticlesCount: number
  comments: Data.Reply[]
  related: Data.Article[]
  likedByMe: boolean
  canManage: boolean
}

/**
 * schema.org Article, for search engines. "<" is escaped so the JSON can
 * never close the script tag.
 */
function jsonLd(article: Article, author: Props['author'], url: string) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt ?? undefined,
    'image': article.coverUrl ?? undefined,
    'datePublished': article.publishedAt ?? undefined,
    'dateModified': article.updatedAt ?? article.publishedAt ?? undefined,
    'mainEntityOfPage': url,
    'author': {
      '@type': 'Person',
      'name': author.displayName,
      'url': url.replace(/\/articles\/.*$/, `/@${author.username}`),
    },
    'publisher': { '@type': 'Organization', 'name': 'JavaScript Cameroun' },
  }
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function ManageMenu({ article }: { article: Article }) {
  const { user } = usePage().props
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function toggleFeature() {
    router.post(`/articles/${article.slug}/feature`, {}, { preserveScroll: true })
  }

  function destroy() {
    router.delete(`/articles/${article.slug}`, {
      onStart: () => setDeleting(true),
      onFinish: () => {
        setDeleting(false)
        setConfirming(false)
      },
    })
  }

  return (
    <>
      <Menu
        buttonLabel="Gérer l’article"
        buttonClassName="inline-flex h-9 items-center gap-2 rounded-sm border border-line-2 px-3 font-mono text-[12px] font-medium tracking-[0.06em] text-ink-2 uppercase transition-colors hover:border-ink hover:text-ink data-open:border-ink data-open:bg-ink data-open:text-paper"
        button={
          <>
            <Settings2 size={14} strokeWidth={1.75} aria-hidden="true" /> Gérer
          </>
        }
      >
        <MenuLink href={`/articles/${article.slug}/modifier`} icon={<Pencil size={15} />}>
          Modifier
        </MenuLink>
        {user?.isModerator && article.isPublished && (
          <MenuAction
            onClick={toggleFeature}
            icon={article.featuredAt ? <StarOff size={15} /> : <Star size={15} />}
          >
            {article.featuredAt ? 'Retirer de la une' : 'Mettre à la une'}
          </MenuAction>
        )}
        <MenuDivider />
        <MenuAction onClick={() => setConfirming(true)} icon={<Trash2 size={15} />} danger>
          Supprimer
        </MenuAction>
      </Menu>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={destroy}
        processing={deleting}
        title="Supprimer cet article ?"
        description="L’article, ses commentaires et ses mentions « J’aime » disparaîtront définitivement."
      />
    </>
  )
}

function DraftBanner({ article, isOwner }: { article: Article; isOwner: boolean }) {
  const [publishing, setPublishing] = useState(false)

  function publish() {
    router.post(
      `/articles/${article.slug}/publish`,
      {},
      { onStart: () => setPublishing(true), onFinish: () => setPublishing(false) }
    )
  }

  return (
    <div role="status" className="border-b border-ink bg-paper-2">
      <div className="shell flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink">
          <span className="label mark-full px-1.5 py-0.5 font-semibold text-js-ink">Brouillon</span>
          <span>
            {isOwner
              ? 'Visible uniquement par vous.'
              : 'Visible uniquement par l’auteur et l’équipe de modération.'}
          </span>
        </p>
        <div className="flex gap-2">
          <ButtonLink href={`/articles/${article.slug}/modifier`} variant="secondary" size="sm">
            <Pencil size={14} strokeWidth={1.75} /> Modifier
          </ButtonLink>
          <Button size="sm" onClick={publish} loading={publishing}>
            <Send size={14} strokeWidth={1.75} /> {publishing ? 'Publication…' : 'Publier'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ArticleShow({
  article,
  author,
  authorArticlesCount,
  comments,
  related,
  likedByMe,
  canManage,
}: Props) {
  const { user, site } = usePage().props
  const isDraft = !article.isPublished
  const path = `/articles/${article.slug}`
  const url = `${site.url}${path}`
  const tags = article.tags ?? []

  return (
    <>
      <Seo
        title={article.title}
        description={article.excerpt}
        path={path}
        image={article.coverUrl}
        type="article"
        publishedTime={article.publishedAt}
        noindex={isDraft}
      />
      {!isDraft && (
        <Head>
          <script
            head-key="article-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(article, author, url) }}
          />
        </Head>
      )}

      {isDraft && canManage && <DraftBanner article={article} isOwner={user?.id === author.id} />}

      <article aria-labelledby="article-title">
        <header className="shell pt-8 sm:pt-12">
          <nav aria-label="Fil d’Ariane" className="label flex flex-wrap items-center gap-2">
            <Link href="/articles" className="link-draw hover:text-ink">
              Articles
            </Link>
            <span aria-hidden="true">/</span>
            {article.featuredAt && !isDraft ? (
              <span className="mark-full text-js-ink">À la une</span>
            ) : (
              <span>{formatShortDate(article.publishedAt ?? article.createdAt)}</span>
            )}
          </nav>

          {tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="Sujets">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Tag name={tag.name} href={`/articles?tag=${tag.slug}`} />
                </li>
              ))}
            </ul>
          )}

          <h1
            id="article-title"
            className="mt-6 max-w-[22ch] text-[clamp(2.4rem,6.6vw,5.4rem)] leading-[0.95] font-bold tracking-[-0.045em] [overflow-wrap:anywhere] sm:[overflow-wrap:normal]"
          >
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-7 max-w-3xl text-[clamp(1.15rem,1.9vw,1.45rem)] leading-[1.45] text-ink-2">
              {article.excerpt}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <Link
                href={`/@${author.username}`}
                aria-hidden="true"
                tabIndex={-1}
                className="shrink-0"
              >
                <Avatar user={author} size="md" />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/@${author.username}`}
                  className="text-[16px] font-semibold text-ink decoration-js decoration-2 underline-offset-4 hover:underline"
                >
                  {author.displayName}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[14px] text-muted">
                  {article.publishedAt && !isDraft ? (
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  ) : (
                    <span>Créé le {formatDate(article.createdAt)}</span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{article.readingMinutes} min de lecture</span>
                  {!isDraft && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{plural(article.viewsCount, 'lecture')}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            {canManage && <ManageMenu article={article} />}
          </div>
        </header>

        {article.coverUrl && (
          <figure className="shell mt-10">
            <img
              src={article.coverUrl}
              alt=""
              decoding="async"
              className="aspect-[16/9] w-full rounded-sm border border-line bg-paper-2 object-cover sm:aspect-[21/9]"
            />
          </figure>
        )}

        <div className="shell mt-10 grid gap-14 sm:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8">
            <Prose html={article.bodyHtml} className="[overflow-wrap:anywhere]" />
            <div className="mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-line pt-5">
              <p className="label">
                Publié par{' '}
                <Link href={`/@${author.username}`} className="text-ink link-draw">
                  {author.displayName}
                </Link>
                {article.publishedAt && !isDraft && <> le {formatDate(article.publishedAt)}</>}
                {article.updatedAt &&
                  article.publishedAt &&
                  !isDraft &&
                  formatDate(article.updatedAt) !== formatDate(article.publishedAt) && (
                    <> · mis à jour le {formatDate(article.updatedAt)}</>
                  )}
              </p>
              {user && user.id !== author.id && !isDraft && (
                <ReportButton target="article" id={article.id} label="Signaler l’article" />
              )}
            </div>
          </div>

          <aside
            className="lg:col-span-4 lg:border-l lg:border-line lg:pl-10"
            aria-label="À propos de cet article"
          >
            <div className="grid gap-10 lg:sticky lg:top-24">
              <div className="grid gap-8">
                <LikeButton article={article} likedByMe={likedByMe} />
                {!isDraft && <ShareLinks title={article.title} url={url} />}
              </div>
              <AuthorCard author={author} articlesCount={authorArticlesCount} />
            </div>
          </aside>
        </div>
      </article>

      <section aria-labelledby="commentaires" className="shell mt-20 sm:mt-28">
        <div className="grid lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-ink pt-5">
              <h2
                id="commentaires"
                className="text-[clamp(1.9rem,3.6vw,2.7rem)] leading-none font-bold tracking-[-0.035em]"
              >
                Commentaires
              </h2>
              <span className="label">
                {plural(comments.length, 'commentaire', 'commentaires', 'aucun commentaire')}
              </span>
            </div>

            {comments.length > 0 ? (
              <div className="mt-4">
                <ReplyList replies={comments} opAuthorId={author.id} />
              </div>
            ) : (
              !isDraft && (
                <EmptyState
                  className="mt-6"
                  code="CMT"
                  title="Pas encore de commentaire."
                  description="Une question, une précision, un retour d’expérience ? Lancez la discussion avec l’auteur."
                />
              )
            )}

            <div className="mt-8">
              {isDraft ? (
                <div className="rounded-sm border border-dashed border-line-2 px-6 py-6">
                  <p className="label">Commentaires fermés</p>
                  <p className="mt-2 text-[15px] text-ink-2">
                    Les lecteurs pourront commenter dès la publication de l’article.
                  </p>
                </div>
              ) : (
                <ReplyForm
                  action={`/articles/${article.slug}/comments`}
                  placeholder="Votre commentaire… (Markdown supporté, blocs de code avec ```js)"
                  submitLabel="Publier le commentaire"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="a-lire-ensuite" className="shell mt-24 pb-6 sm:mt-32">
          <div className="border-t border-ink pt-5">
            <p className="label text-ink">
              <span className="mr-2 text-muted">[→]</span>À lire ensuite
            </p>
            <h2
              id="a-lire-ensuite"
              className="mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[0.98] font-bold tracking-[-0.035em]"
            >
              Continuez <span className="mark">la lecture</span>.
            </h2>
          </div>
          <ol className="mt-10 grid md:grid-cols-3">
            {related.map((item, i) => (
              <li
                key={item.id}
                className="group relative flex flex-col border-t border-line py-6 md:border-t-0 md:border-l md:px-6 md:py-0 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
              >
                <span className="label tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {item.tags && item.tags.length > 0 && (
                  <p className="mt-4 font-mono text-[12px] text-muted">
                    {item.tags
                      .slice(0, 2)
                      .map((tag) => `#${tag.name}`)
                      .join('  ')}
                  </p>
                )}
                <h3 className="mt-2 text-[22px] leading-[1.15] font-semibold tracking-[-0.02em]">
                  <Link
                    href={`/articles/${item.slug}`}
                    className="decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0"
                  >
                    {item.title}
                  </Link>
                </h3>
                {item.excerpt && (
                  <p className="mt-3 line-clamp-3 text-[15px] text-ink-2">{item.excerpt}</p>
                )}
                <p className="mt-auto flex items-center gap-2 pt-5 text-[14px] text-muted">
                  {item.author && <Avatar user={item.author} size="xs" />}
                  <span className="truncate">{item.author?.displayName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">{item.readingMinutes} min</span>
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
