import { Link, usePage } from '@inertiajs/react'
import { ArrowRight, Eye, Heart, Hourglass, MessageSquare, UserRound } from 'lucide-react'
import type { Data } from '@generated/data'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { EmptyState } from '~/components/ui/empty-state'
import { ButtonLink } from '~/components/ui/button'
import { TimeAgo } from '~/components/ui/time-ago'
import { SolvedBadge } from '~/components/forum/thread-list'
import { WorkspaceHeader, WorkspaceSectionTitle } from '~/components/dashboard/workspace-header'
import { Readout } from '~/components/dashboard/readout'
import { ReplySummaryList, type ReplySummary } from '~/components/profile/reply-summary-list'
import { cn, formatShortDate, plural } from '~/lib/format'

type Props = {
  stats: {
    published: number
    drafts: number
    views: number
    questions: number
    unsolved: number
    discussions: number
    replies: number
    likes: number
  }
  articles: Data.Article[]
  threads: Data.Thread[]
  discussions: Data.Discussion[]
  activity: ReplySummary[]
}

const QUICK_ACTIONS = [
  {
    href: '/articles/nouveau',
    code: '01',
    title: 'Écrire un article',
    text: 'Tutoriel, retour d’expérience, découverte.',
  },
  {
    href: '/forum/nouveau',
    code: '02',
    title: 'Poser une question',
    text: 'Un bug, un choix technique, une config.',
  },
  {
    href: '/discussions/nouvelle',
    code: '03',
    title: 'Lancer une discussion',
    text: 'Carrière, outils, événements.',
  },
]

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function greeting() {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 4 ? 'Bonsoir' : 'Bonjour'
}

function Metric({ icon: Icon, value, label }: { icon: typeof Eye; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" title={`${value} ${label}`}>
      <Icon size={13} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
      {value}
      <span className="sr-only">{label}</span>
    </span>
  )
}

function ArticleRow({ article }: { article: Data.Article }) {
  const draft = !article.isPublished
  return (
    <li className="group relative grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 border-t border-line py-4 first:border-t-0 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-baseline">
      <span className="pt-0.5">
        {draft ? (
          <span className="mark-full font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">
            Brouillon
          </span>
        ) : (
          <span className="label tabular-nums">{formatShortDate(article.publishedAt)}</span>
        )}
      </span>
      <div className="min-w-0">
        <h3 className="text-[17px] leading-snug font-semibold tracking-[-0.01em]">
          <Link
            href={draft ? `/articles/${article.slug}/modifier` : `/articles/${article.slug}`}
            className="decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </Link>
        </h3>
        {draft && (
          <p className="mt-1 text-[13.5px] text-muted">
            Modifié <TimeAgo date={article.updatedAt ?? article.createdAt} /> ·{' '}
            <span className="text-ink-2 group-hover:text-ink">reprendre l’écriture →</span>
          </p>
        )}
      </div>
      {!draft && (
        <p className="col-start-2 mt-1.5 flex gap-3.5 font-mono text-[12.5px] text-ink-2 sm:col-start-3 sm:mt-0">
          <Metric icon={Eye} value={article.viewsCount} label="vues" />
          <Metric icon={Heart} value={article.likesCount} label="j’aime" />
          <Metric icon={MessageSquare} value={article.commentsCount} label="commentaires" />
        </p>
      )}
    </li>
  )
}

function ThreadRow({ thread }: { thread: Data.Thread }) {
  return (
    <li className="group relative border-t border-line py-4 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        {thread.isSolved ? (
          <SolvedBadge solved />
        ) : (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-xs border border-ink px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-ink uppercase">
            <Hourglass size={11} strokeWidth={2} aria-hidden="true" /> En attente de solution
          </span>
        )}
        {thread.channel && <span className="label">{thread.channel.name}</span>}
      </div>
      <h3 className="mt-2 text-[17px] leading-snug font-semibold tracking-[-0.01em]">
        <Link
          href={`/forum/${thread.slug}`}
          className="decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
        >
          {thread.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-[13.5px] text-muted">
        {plural(thread.repliesCount, 'réponse', 'réponses', 'Aucune réponse')} · actif{' '}
        <TimeAgo date={thread.lastActivityAt} />
      </p>
    </li>
  )
}

function DiscussionRow({ discussion }: { discussion: Data.Discussion }) {
  return (
    <li className="group relative flex items-baseline justify-between gap-4 border-t border-line py-4 first:border-t-0">
      <div className="min-w-0">
        <h3 className="text-[17px] leading-snug font-semibold tracking-[-0.01em]">
          <Link
            href={`/discussions/${discussion.slug}`}
            className="decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {discussion.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-[13.5px] text-muted">
          actif <TimeAgo date={discussion.lastActivityAt} />
        </p>
      </div>
      <span className="shrink-0 font-mono text-[12.5px] text-ink-2 tabular-nums">
        <Metric icon={MessageSquare} value={discussion.repliesCount} label="réponses" />
      </span>
    </li>
  )
}

export default function Dashboard({ stats, articles, threads, discussions, activity }: Props) {
  const { user } = usePage().props
  const firstName = user?.name?.split(/\s+/)[0] || user?.username || ''
  const profileIncomplete = Boolean(user && (!user.bio || !user.avatarUrl))

  const pending: string[] = []
  if (stats.drafts) pending.push(plural(stats.drafts, 'brouillon en cours', 'brouillons en cours'))
  if (stats.unsolved)
    pending.push(
      plural(stats.unsolved, 'question en attente de solution', 'questions en attente de solution')
    )
  const lead = pending.length
    ? `Vous avez ${pending.join(' et ')}.`
    : 'Que voulez-vous partager aujourd’hui ?'

  return (
    <>
      <Seo title="Tableau de bord" noindex />

      <WorkspaceHeader
        kicker={<span suppressHydrationWarning>Tableau de bord · {todayLabel()}</span>}
        title={
          <span suppressHydrationWarning>
            {greeting()}, <span className="mark">{firstName}</span>.
          </span>
        }
        lead={lead}
      />

      {/* Quick actions */}
      <nav aria-label="Publier" className="mt-8">
        <ul className="grid border-t border-l border-ink sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.href} className="border-r border-b border-ink">
              <Link
                href={action.href}
                className="group flex h-full items-start justify-between gap-4 px-5 py-5 transition-colors duration-150 hover:bg-js hover:text-js-ink focus-visible:bg-js focus-visible:text-js-ink focus-visible:outline-none"
              >
                <span>
                  <span className="label group-hover:text-js-ink group-focus-visible:text-js-ink">
                    {action.code}
                  </span>
                  <span className="mt-2 block text-[20px] leading-tight font-bold tracking-[-0.025em]">
                    {action.title}
                  </span>
                  <span className="mt-1 block text-[14px] text-muted group-hover:text-js-ink/75 group-focus-visible:text-js-ink/75">
                    {action.text}
                  </span>
                </span>
                <ArrowRight
                  size={18}
                  className="mt-6 shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Counters */}
      <section aria-labelledby="dash-counters" className="mt-12">
        <h2 id="dash-counters" className="sr-only">
          Mes compteurs
        </h2>
        <Readout
          readings={[
            {
              label: 'Articles publiés',
              value: stats.published,
              note: stats.drafts ? plural(stats.drafts, 'brouillon') : undefined,
            },
            { label: 'Lectures', value: stats.views },
            {
              label: 'Questions',
              value: stats.questions,
              note: stats.unsolved ? `${stats.unsolved} sans solution` : undefined,
            },
            { label: 'Discussions', value: stats.discussions },
            { label: 'Réponses', value: stats.replies },
            { label: 'J’aime reçus', value: stats.likes },
          ]}
        />
      </section>

      <div className="mt-14 grid gap-14 xl:grid-cols-12 xl:gap-12">
        <div className="min-w-0 space-y-14 xl:col-span-7">
          <section aria-labelledby="dash-articles">
            <WorkspaceSectionTitle
              index="01"
              id="dash-articles"
              title="Mes articles"
              action={
                articles.length > 0 && user ? (
                  <Link
                    href={`/@${user.username}?tab=articles`}
                    className="label link-draw text-ink"
                  >
                    Tout voir →
                  </Link>
                ) : undefined
              }
            />
            {articles.length ? (
              <ul>
                {articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-5"
                code="ART"
                title="Aucun article pour l’instant."
                description="Ce que vous avez appris cette semaine intéresse forcément quelqu’un. Commencez par un brouillon, publiez quand vous êtes prêt."
                action={
                  <ButtonLink href="/articles/nouveau">Écrire mon premier article</ButtonLink>
                }
              />
            )}
          </section>

          <section aria-labelledby="dash-threads">
            <WorkspaceSectionTitle
              index="02"
              id="dash-threads"
              title="Mes questions"
              action={
                threads.length > 0 && user ? (
                  <Link
                    href={`/@${user.username}?tab=questions`}
                    className="label link-draw text-ink"
                  >
                    Tout voir →
                  </Link>
                ) : undefined
              }
            />
            {threads.length ? (
              <ul>
                {threads.map((thread) => (
                  <ThreadRow key={thread.id} thread={thread} />
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-5"
                code="FRM"
                title="Pas de question en cours."
                description="Bloqué sur un bug, une config qui résiste, un choix d’architecture ? Demandez au forum."
                action={
                  <ButtonLink href="/forum/nouveau" variant="secondary">
                    Poser une question
                  </ButtonLink>
                }
              />
            )}
          </section>

          <section aria-labelledby="dash-discussions">
            <WorkspaceSectionTitle index="03" id="dash-discussions" title="Mes discussions" />
            {discussions.length ? (
              <ul>
                {discussions.map((discussion) => (
                  <DiscussionRow key={discussion.id} discussion={discussion} />
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-5"
                code="DSC"
                title="Aucune discussion lancée."
                description="Une annonce, un débat, un meetup à organiser : ouvrez la conversation."
                action={
                  <ButtonLink href="/discussions/nouvelle" variant="secondary">
                    Lancer une discussion
                  </ButtonLink>
                }
              />
            )}
          </section>
        </div>

        <aside className="min-w-0 xl:col-span-5" aria-labelledby="dash-activity">
          <div className="xl:sticky xl:top-24">
            <WorkspaceSectionTitle index="04" id="dash-activity" title="Activité récente" />
            <p className="mt-3 text-[14px] text-muted">
              Les dernières réponses des membres à vos questions, discussions et articles.
            </p>
            {activity.length ? (
              <ReplySummaryList replies={activity} showAuthor className="mt-2" />
            ) : (
              <EmptyState
                className="mt-5"
                code="ACT"
                title="Rien de neuf pour l’instant."
                description="Dès qu’un membre répondra à l’une de vos publications, vous le verrez ici."
              />
            )}

            {profileIncomplete && user && (
              <div className={cn('mt-10 rounded-sm border border-dashed border-line-2 p-5')}>
                <p className="label inline-flex items-center gap-1.5 text-ink">
                  <UserRound size={13} aria-hidden="true" /> Profil à compléter
                </p>
                <p className="mt-2 text-[15px] text-ink-2">
                  {!user.avatarUrl && !user.bio
                    ? 'Ajoutez une photo et quelques mots sur vous : on répond plus volontiers à un visage.'
                    : !user.avatarUrl
                      ? 'Ajoutez une photo de profil : on répond plus volontiers à un visage.'
                      : 'Ajoutez une courte bio pour que la communauté sache sur quoi vous travaillez.'}
                </p>
                <Link
                  href="/settings"
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium tracking-[0.06em] uppercase"
                >
                  <span className="link-draw">Compléter mon profil</span> →
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}

Dashboard.layout = [DashboardLayout]
