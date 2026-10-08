import { Link, usePage } from '@inertiajs/react'
import { Lock, Pin } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Prose } from '~/components/ui/prose'
import { Tag } from '~/components/ui/tag'
import { TimeAgo } from '~/components/ui/time-ago'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { ReplyList } from '~/components/replies/reply-list'
import { ReplyForm } from '~/components/replies/reply-form'
import { ContentActions } from '~/components/forum/content-actions'
import { AsideHeading, MetaList } from '~/components/forum/thread-aside'
import { AvatarStack, participantsSentence } from '~/components/discussions/participants'
import { formatDate, formatNumber, plural } from '~/lib/format'
import { frenchSpacing } from '~/components/forum/typography'

type Props = {
  discussion: Data.Discussion.Variants['forDetail']
  replies: Data.Reply[]
  repliesMeta: PaginationMeta | null
  participants: Data.User[]
  participantsCount: number
  related: Data.Discussion[]
  relatedByTags: boolean
  can: { manage: boolean; moderate: boolean }
}

function wasEdited(createdAt: string | null, updatedAt: string | null) {
  if (!createdAt || !updatedAt) return false
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000
}

export default function DiscussionsShow({
  discussion,
  replies,
  repliesMeta,
  participants,
  participantsCount,
  related,
  relatedByTags,
  can,
}: Props) {
  const { user } = usePage().props
  const base = `/discussions/${discussion.slug}`
  const locked = Boolean(discussion.lockedAt)
  const tags = discussion.tags ?? []
  const author = discussion.author
  const firstPage = !repliesMeta || repliesMeta.currentPage === 1

  return (
    <>
      <Seo
        title={discussion.title}
        description={discussion.excerpt}
        path={base}
        type="article"
        publishedTime={discussion.createdAt}
      />

      <article className="pb-24">
        <div className="shell">
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-line py-2.5">
            <nav aria-label="Fil d’Ariane" className="label min-w-0 truncate">
              <Link href="/discussions" className="link-draw hover:text-ink">
                Discussions
              </Link>
              {tags[0] && (
                <>
                  <span aria-hidden="true" className="mx-2">
                    /
                  </span>
                  <Link
                    href={`/discussions?tag=${tags[0].slug}`}
                    className="link-draw hover:text-ink"
                  >
                    #{tags[0].name}
                  </Link>
                </>
              )}
            </nav>
            <ContentActions
              basePath={base}
              noun="discussion"
              canManage={can.manage}
              canModerate={can.moderate}
              pinned={Boolean(discussion.pinnedAt)}
              locked={locked}
            />
          </div>
        </div>

        {/* Masthead: tags, title, then the people around the table */}
        <header className="shell pt-10 lg:pt-14">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Tag key={tag.id} name={tag.name} href={`/discussions?tag=${tag.slug}`} />
            ))}
            {discussion.pinnedAt && (
              <span className="label ml-1 inline-flex items-center gap-1 text-ink">
                <Pin size={11} aria-hidden="true" /> Épinglée
              </span>
            )}
            {locked && (
              <span className="label ml-1 inline-flex items-center gap-1 text-ink">
                <Lock size={11} aria-hidden="true" /> Verrouillée
              </span>
            )}
          </div>

          <h1 className="mt-6 max-w-5xl text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[0.98] font-bold tracking-[-0.045em] break-words">
            {frenchSpacing(discussion.title)}
          </h1>

          <div className="mt-9 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <AvatarStack users={participants.slice(0, 8)} size="sm" linked />
              <p className="min-w-0 text-[14.5px] text-ink-2">
                <span className="label mr-1.5 align-[1px]">Autour de la table</span>{' '}
                {participantsSentence(participants, participantsCount)}
              </p>
            </div>
            <p className="label shrink-0">
              {plural(discussion.repliesCount, 'réponse')} · {plural(discussion.viewsCount, 'vue')}{' '}
              · active <TimeAgo date={discussion.lastActivityAt} />
            </p>
          </div>
        </header>

        <div className="shell grid gap-14 pt-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8">
            {/* The conversation: one thread line runs through every voice */}
            <div className="relative before:absolute before:top-3 before:bottom-0 before:left-5 before:w-px before:bg-line-2">
              {firstPage && (
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 pb-10 sm:gap-x-5">
                  {author ? (
                    <Link
                      href={`/@${author.username}`}
                      aria-label={author.displayName}
                      className="self-start"
                    >
                      <Avatar user={author} size="md" />
                    </Link>
                  ) : (
                    <span />
                  )}
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px]">
                      {author && (
                        <Link
                          href={`/@${author.username}`}
                          className="font-semibold text-ink hover:underline"
                        >
                          {author.displayName}
                        </Link>
                      )}
                      <span className="text-muted">a lancé la discussion</span>
                      <span className="text-muted" aria-hidden="true">
                        ·
                      </span>
                      <TimeAgo date={discussion.createdAt} className="text-muted" />
                      {wasEdited(discussion.createdAt, discussion.updatedAt) && (
                        <>
                          <span className="text-muted" aria-hidden="true">
                            ·
                          </span>
                          <span
                            className="text-muted"
                            title={`Modifiée le ${formatDate(discussion.updatedAt)}`}
                          >
                            modifiée
                          </span>
                        </>
                      )}
                    </p>
                    <Prose html={discussion.bodyHtml} className="mt-4" />
                  </div>
                </div>
              )}

              <section aria-labelledby="reponses">
                <h2
                  id="reponses"
                  className="label relative ml-14 scroll-mt-28 border-t border-ink pt-4 pb-1 text-ink sm:ml-[60px]"
                >
                  <span className="mr-2 text-muted">[—]</span>
                  {discussion.repliesCount
                    ? `La conversation · ${plural(discussion.repliesCount, 'réponse')}`
                    : 'La conversation'}
                </h2>
                {replies.length ? (
                  <ReplyList replies={replies} opAuthorId={author?.id} />
                ) : (
                  <div className="ml-14 py-7 sm:ml-[60px]">
                    <p className="text-[17px] font-semibold tracking-[-0.015em]">
                      Le silence avant le débat.
                    </p>
                    <p className="mt-1 text-[15px] text-muted">
                      {user?.id === author?.id
                        ? 'Votre sujet est lancé. Partagez-le pour faire venir les premières voix.'
                        : 'Personne n’a encore répondu. Donnez le ton : votre avis compte.'}
                    </p>
                  </div>
                )}
              </section>
            </div>

            {repliesMeta && <Pagination meta={repliesMeta} className="mt-4" />}

            <div id="repondre" className="mt-10 scroll-mt-28 border-t border-line pt-8">
              {locked && can.moderate && (
                <p className="mb-4 flex items-center gap-2 rounded-sm border border-dashed border-line-2 px-4 py-3 text-[14px] text-ink-2">
                  <Lock size={14} strokeWidth={1.75} aria-hidden="true" />
                  Discussion verrouillée. En tant que modérateur, vous pouvez encore répondre.
                </p>
              )}
              <ReplyForm
                action={`${base}/replies`}
                locked={locked && !can.moderate}
                placeholder="Votre point de vue… (Markdown supporté)"
                submitLabel="Prendre la parole"
              />
            </div>
          </div>

          <aside className="flex flex-col gap-12 lg:col-span-4">
            <MetaList
              id="fiche"
              title="Fiche"
              rows={[
                { label: 'Lancée le', value: formatDate(discussion.createdAt) },
                { label: 'Activité', value: <TimeAgo date={discussion.lastActivityAt} /> },
                {
                  label: 'Participants',
                  value: (
                    <span className="font-mono tabular-nums">
                      {formatNumber(participantsCount)}
                    </span>
                  ),
                },
                {
                  label: 'Réponses',
                  value: (
                    <span className="font-mono tabular-nums">
                      {formatNumber(discussion.repliesCount)}
                    </span>
                  ),
                },
                {
                  label: 'Vues',
                  value: (
                    <span className="font-mono tabular-nums">
                      {formatNumber(discussion.viewsCount)}
                    </span>
                  ),
                },
              ]}
            />

            {related.length > 0 && (
              <section aria-labelledby="dans-la-meme-veine">
                <AsideHeading id="dans-la-meme-veine">
                  {relatedByTags ? 'Dans la même veine' : 'Autres conversations'}
                </AsideHeading>
                <ul className="mt-1">
                  {related.map((item) => (
                    <li key={item.id} className="border-b border-line">
                      <Link
                        href={`/discussions/${item.slug}`}
                        className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 py-3.5"
                      >
                        {item.author ? (
                          <Avatar user={item.author} size="xs" className="mt-0.5" />
                        ) : (
                          <span />
                        )}
                        <span className="min-w-0">
                          <span className="block text-[15px] leading-snug text-ink-2 decoration-js decoration-2 underline-offset-4 group-hover:text-ink group-hover:underline">
                            {frenchSpacing(item.title)}
                          </span>
                          <span className="label mt-1 block">
                            {plural(item.repliesCount, 'réponse', 'réponses', 'aucune réponse')} ·{' '}
                            <TimeAgo date={item.lastActivityAt} />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="rounded-sm border border-dashed border-line-2 px-5 py-5">
              <p className="label text-ink">Une question technique ?</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                Pour une erreur précise, le forum d’entraide permet de marquer la bonne réponse
                comme solution.
              </p>
              <Link
                href="/forum/nouveau"
                className="mt-4 inline-flex items-center gap-2 font-mono text-[12.5px] font-medium tracking-[0.06em] text-ink uppercase"
              >
                <span className="link-draw">Poser une question</span>{' '}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </>
  )
}
