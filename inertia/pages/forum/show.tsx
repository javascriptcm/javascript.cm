import { Link, usePage } from '@inertiajs/react'
import { Eye, Lock, MessageSquare, Pin } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Prose } from '~/components/ui/prose'
import { TimeAgo } from '~/components/ui/time-ago'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { ReplyList } from '~/components/replies/reply-list'
import { ReplyForm } from '~/components/replies/reply-form'
import { SolvedBadge } from '~/components/forum/thread-list'
import { ContentActions } from '~/components/forum/content-actions'
import { SolutionBadge, SolutionCallout, SolutionToggle } from '~/components/forum/solution'
import { MetaList, ParticipantsGrid, SimilarThreads } from '~/components/forum/thread-aside'
import { formatDate, formatNumber, plural } from '~/lib/format'
import { frenchSpacing } from '~/components/forum/typography'

type Props = {
  thread: Data.Thread.Variants['forDetail']
  replies: Data.Reply[]
  repliesMeta: PaginationMeta | null
  solution: Data.Reply | null
  solutionExcerpt: string | null
  solutionHref: string | null
  participants: Data.User[]
  participantsCount: number
  similar: Data.Thread[]
  can: { manage: boolean; moderate: boolean }
}

/**
 * Edited more than a minute after creation (pin / lock / solution do not touch updatedAt).
 */
function wasEdited(createdAt: string | null, updatedAt: string | null) {
  if (!createdAt || !updatedAt) return false
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000
}

export default function ForumShow({
  thread,
  replies,
  repliesMeta,
  solution,
  solutionExcerpt,
  solutionHref,
  participants,
  participantsCount,
  similar,
  can,
}: Props) {
  const { user } = usePage().props
  const base = `/forum/${thread.slug}`
  const locked = Boolean(thread.lockedAt)
  const opId = thread.author?.id

  return (
    <>
      <Seo
        title={thread.title}
        description={thread.excerpt}
        path={base}
        type="article"
        publishedTime={thread.createdAt}
      />

      <article className="shell pb-24">
        {/* Top rail: breadcrumb + owner / moderator menu */}
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-line py-2.5">
          <nav aria-label="Fil d’Ariane" className="label min-w-0 truncate">
            <Link href="/forum" className="link-draw hover:text-ink">
              Forum
            </Link>
            {thread.channel && (
              <>
                <span aria-hidden="true" className="mx-2">
                  /
                </span>
                <Link
                  href={`/forum?channel=${thread.channel.slug}`}
                  className="link-draw hover:text-ink"
                >
                  {thread.channel.name}
                </Link>
              </>
            )}
          </nav>
          <ContentActions
            basePath={base}
            noun="question"
            canManage={can.manage}
            canModerate={can.moderate}
            pinned={Boolean(thread.pinnedAt)}
            locked={locked}
          />
        </div>

        <div className="grid gap-14 pt-10 lg:grid-cols-12 lg:gap-12 lg:pt-14">
          <div className="min-w-0 lg:col-span-8">
            <header>
              <div className="flex flex-wrap items-center gap-2.5">
                <SolvedBadge solved={thread.isSolved} />
                {thread.channel && (
                  <Link
                    href={`/forum?channel=${thread.channel.slug}`}
                    className="label hover:text-ink"
                  >
                    {thread.channel.name}
                  </Link>
                )}
                {thread.pinnedAt && (
                  <span className="label inline-flex items-center gap-1 text-ink">
                    <Pin size={11} aria-hidden="true" /> Épinglé
                  </span>
                )}
                {locked && (
                  <span className="label inline-flex items-center gap-1 text-ink">
                    <Lock size={11} aria-hidden="true" /> Verrouillé
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.02] font-bold tracking-[-0.04em] break-words">
                {frenchSpacing(thread.title)}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14.5px] text-muted">
                {thread.author && (
                  <Link
                    href={`/@${thread.author.username}`}
                    className="inline-flex items-center gap-2.5 hover:text-ink"
                  >
                    <Avatar user={thread.author} size="sm" />
                    <span className="font-semibold text-ink">{thread.author.displayName}</span>
                  </Link>
                )}
                <span>
                  a demandé <TimeAgo date={thread.createdAt} />
                </span>
                {wasEdited(thread.createdAt, thread.updatedAt) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span title={`Modifiée le ${formatDate(thread.updatedAt)}`}>modifiée</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[13px] tabular-nums">
                  <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
                  {plural(thread.viewsCount, 'vue')}
                </span>
                <span aria-hidden="true">·</span>
                <a
                  href="#reponses"
                  className="inline-flex items-center gap-1.5 font-mono text-[13px] tabular-nums hover:text-ink"
                >
                  <MessageSquare size={14} strokeWidth={1.75} aria-hidden="true" />
                  {plural(thread.repliesCount, 'réponse')}
                </a>
              </div>
            </header>

            {solution && solutionHref && (
              <SolutionCallout
                reply={solution}
                excerpt={solutionExcerpt ?? ''}
                href={solutionHref}
              />
            )}

            <div className="mt-10 border-t border-line pt-8">
              <Prose html={thread.bodyHtml} />
            </div>

            <section aria-labelledby="reponses" className="mt-16">
              <h2
                id="reponses"
                className="label flex scroll-mt-28 items-baseline justify-between border-t border-ink pt-4 text-ink"
              >
                <span>
                  <span className="mr-2 text-muted">[02]</span>
                  {thread.repliesCount ? plural(thread.repliesCount, 'réponse') : 'Réponses'}
                </span>
                {!thread.isSolved && thread.repliesCount > 0 && can.manage && (
                  <span className="hidden normal-case tracking-normal text-muted sm:inline">
                    Une réponse vous a débloqué ? Marquez-la comme solution.
                  </span>
                )}
              </h2>

              {replies.length ? (
                <ReplyList
                  replies={replies}
                  opAuthorId={opId}
                  highlightedId={thread.solutionReplyId}
                  renderBadge={(reply) =>
                    reply.id === thread.solutionReplyId ? <SolutionBadge /> : null
                  }
                  renderActions={(reply) =>
                    can.manage && reply.author && reply.author.id !== opId ? (
                      <SolutionToggle
                        threadSlug={thread.slug}
                        replyId={reply.id}
                        isSolution={reply.id === thread.solutionReplyId}
                      />
                    ) : null
                  }
                />
              ) : (
                <EmptyState
                  className="mt-6"
                  code="REP"
                  title="Pas encore de réponse."
                  description={
                    user?.id === opId
                      ? 'Votre question est en ligne. Ajoutez des précisions si besoin : un message d’erreur complet aide beaucoup.'
                      : 'Vous avez une piste ? Même partielle, elle peut débloquer quelqu’un.'
                  }
                />
              )}

              {repliesMeta && <Pagination meta={repliesMeta} className="mt-4" />}

              <div id="repondre" className="mt-10 scroll-mt-28">
                {locked && can.moderate && (
                  <p className="mb-4 flex items-center gap-2 rounded-sm border border-dashed border-line-2 px-4 py-3 text-[14px] text-ink-2">
                    <Lock size={14} strokeWidth={1.75} aria-hidden="true" />
                    Sujet verrouillé. En tant que modérateur, vous pouvez encore répondre.
                  </p>
                )}
                <ReplyForm
                  action={`${base}/replies`}
                  locked={locked && !can.moderate}
                  placeholder="Votre réponse… Expliquez le pourquoi, pas seulement le comment. Blocs de code avec ```js"
                />
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-12 lg:col-span-4">
            <MetaList
              id="fiche"
              title="Fiche"
              rows={[
                {
                  label: 'Statut',
                  value: thread.isSolved ? (
                    <span className="font-medium text-ok">Résolue</span>
                  ) : (
                    <span>En attente de solution</span>
                  ),
                },
                ...(thread.channel
                  ? [
                      {
                        label: 'Canal',
                        value: (
                          <Link
                            href={`/forum?channel=${thread.channel.slug}`}
                            className="underline decoration-line-2 underline-offset-4 hover:decoration-ink"
                          >
                            {thread.channel.name}
                          </Link>
                        ),
                      },
                    ]
                  : []),
                { label: 'Posée le', value: formatDate(thread.createdAt) },
                { label: 'Activité', value: <TimeAgo date={thread.lastActivityAt} /> },
                {
                  label: 'Vues',
                  value: (
                    <span className="font-mono tabular-nums">
                      {formatNumber(thread.viewsCount)}
                    </span>
                  ),
                },
                {
                  label: 'Réponses',
                  value: (
                    <span className="font-mono tabular-nums">
                      {formatNumber(thread.repliesCount)}
                    </span>
                  ),
                },
              ]}
            />
            <ParticipantsGrid
              id="participants"
              title="Participants"
              users={participants}
              total={participantsCount}
              empty="Personne n’a encore répondu. Soyez le premier."
            />
            <SimilarThreads id="similaires" threads={similar} />
          </aside>
        </div>
      </article>
    </>
  )
}
