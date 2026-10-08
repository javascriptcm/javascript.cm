import { Link, usePage } from '@inertiajs/react'
import { CalendarDays, FileDown, Lock, MapPin, PenLine, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { ButtonLink, buttonClasses } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { ArticleList } from '~/components/articles/list'
import { ThreadList } from '~/components/forum/thread-list'
import { DiscussionList } from '~/components/discussions/discussion-list'
import { RoleBadge } from '~/components/profile/role-badge'
import { AvailabilityBadge } from '~/components/profile/availability'
import { ProfileLinkList, profileLinks } from '~/components/profile/profile-links'
import { ReplySummaryList, type ReplySummary } from '~/components/profile/reply-summary-list'
import { cn, formatNumber } from '~/lib/format'

type Tab = 'articles' | 'questions' | 'discussions' | 'reponses'
type Paginated<T> = { data: T[]; metadata: PaginationMeta }

type Props = {
  profile: Data.User.Variants['forProfile']
  banned: boolean
  isOwner: boolean
  /** Computed for the viewer by ProfileController (never the file path). */
  cv: {
    available: boolean
    loginRequired: boolean
    url: string | null
    visibility: 'public' | 'members' | 'private' | null
  }
  stats: {
    articles: number
    questions: number
    discussions: number
    replies: number
    solutions: number
    likes: number
  }
  tab: Tab
  articles: Paginated<Data.Article> | null
  threads: Paginated<Data.Thread> | null
  discussions: Paginated<Data.Discussion> | null
  replies: Paginated<ReplySummary> | null
}

// Hairlines of the 5 counters on a 2 / 3 / 5 column grid (mobile / tablet / desktop).
const READOUT_CELLS = [
  '',
  'border-l pl-4 sm:pl-6',
  'border-t sm:border-t-0 sm:border-l sm:pl-6',
  'border-t border-l pl-4 sm:border-l-0 sm:pl-0 lg:border-t-0 lg:border-l lg:pl-6',
  'border-t sm:border-l sm:pl-6 lg:border-t-0',
]

const monthYear = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

function FicheRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-t border-line py-3 first:border-t-0">
      <dt className="label pt-0.5">{term}</dt>
      <dd className="min-w-0 text-[15px] break-words text-ink-2">{children}</dd>
    </div>
  )
}

const CV_VISIBILITY_NOTE = {
  public: 'visible par tout le monde',
  members: 'réservé aux membres connectés',
  private: 'visible par vous seul·e',
} as const

export default function ProfileShow(props: Props) {
  const { profile, banned, isOwner, stats, tab, cv } = props
  const { url } = usePage()
  const firstName = profile.name?.split(/\s+/)[0] || profile.username
  const since = profile.createdAt ? monthYear.format(new Date(profile.createdAt)) : ''
  const base = `/@${profile.username}`

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'articles', label: 'Articles', count: stats.articles },
    { key: 'questions', label: 'Questions', count: stats.questions },
    { key: 'discussions', label: 'Discussions', count: stats.discussions },
    { key: 'reponses', label: 'Réponses', count: stats.replies },
  ]

  const readings = [
    { label: 'Articles publiés', value: stats.articles },
    { label: 'Questions', value: stats.questions },
    { label: 'Réponses', value: stats.replies },
    { label: 'Solutions acceptées', value: stats.solutions },
    { label: 'J’aime reçus', value: stats.likes },
  ]

  const links = profileLinks(profile)
  const loginHref = `/login?redirect=${encodeURIComponent(cv.url ?? base)}`

  return (
    <>
      <Seo
        title={`${profile.displayName} (@${profile.username})`}
        description={
          [profile.headline, profile.bio].filter(Boolean).join(' — ') ||
          `${profile.displayName} est membre de JavaScript Cameroun depuis ${since} : articles, questions et réponses sur JavaScript et son écosystème.`
        }
        path={base}
        image={profile.avatarUrl}
        type="profile"
        noindex={banned}
      />

      {banned && (
        <div className="border-b border-danger bg-paper-2">
          <p
            className="shell flex items-center gap-2 py-3 text-[14.5px] font-medium text-danger"
            role="status"
          >
            <ShieldAlert size={16} aria-hidden="true" /> Compte suspendu — ce profil n’est visible
            que par l’équipe de modération.
          </p>
        </div>
      )}

      {/* Identity */}
      <header className="border-b border-line">
        <div className="shell pt-10 pb-10 sm:pt-14">
          <p className="label">
            Fiche membre <span className="text-ink">N° {String(profile.id).padStart(4, '0')}</span>
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Avatar
              user={profile}
              size="2xl"
              className="size-24 text-[28px] sm:size-32 sm:text-[38px]"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="font-mono text-[14px] text-muted">@{profile.username}</p>
                <RoleBadge role={profile.role} />
                <AvailabilityBadge availability={profile.availability} />
              </div>
              <h1 className="mt-2 text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.92] font-bold tracking-[-0.045em] break-words">
                {profile.displayName}
              </h1>
              {profile.headline && (
                <p className="mt-3 max-w-3xl text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug font-medium tracking-[-0.015em] text-ink">
                  {profile.headline}
                </p>
              )}
              {profile.bio && (
                <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">
                  {profile.bio}
                </p>
              )}
              {profile.skills.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Compétences">
                  {profile.skills.map((skill) => (
                    <li key={skill}>
                      <Link
                        href={`/membres?competence=${encodeURIComponent(skill)}`}
                        title={`Les membres qui maîtrisent ${skill}`}
                        className="inline-flex h-8 items-center rounded-sm border border-line-2 bg-card px-2.5 text-[14px] font-medium text-ink-2 transition-colors duration-150 hover:border-ink hover:bg-js hover:text-js-ink active:translate-y-px"
                      >
                        {skill}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {(isOwner || cv.available || cv.loginRequired) && (
              <div className="flex flex-col items-start gap-2.5 sm:col-span-2 lg:col-span-1 lg:w-64 lg:items-stretch lg:self-end">
                {cv.available && cv.url && (
                  <a
                    href={cv.url}
                    download={`CV-${profile.username}.pdf`}
                    className={buttonClasses({ variant: isOwner ? 'secondary' : 'primary' })}
                  >
                    <FileDown size={16} strokeWidth={1.75} aria-hidden="true" /> Télécharger le CV
                  </a>
                )}
                {cv.loginRequired && (
                  <Link
                    href={loginHref}
                    className="group inline-flex min-h-11 items-start gap-2.5 rounded-sm border border-ink px-4 py-2.5 text-[15px] leading-snug font-medium text-ink transition-colors duration-200 hover:bg-ink hover:text-paper active:translate-y-px"
                  >
                    <Lock
                      size={15}
                      strokeWidth={1.75}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      CV réservé aux membres —{' '}
                      <span className="underline decoration-js decoration-2 underline-offset-4">
                        connectez-vous
                      </span>
                    </span>
                  </Link>
                )}
                {isOwner && (
                  <>
                    <ButtonLink href="/settings" variant="secondary">
                      <PenLine size={15} strokeWidth={1.75} aria-hidden="true" /> Modifier mon
                      profil
                    </ButtonLink>
                    <p className="label tracking-[0.04em] normal-case lg:text-right">
                      {cv.visibility ? (
                        <>
                          Votre CV est {CV_VISIBILITY_NOTE[cv.visibility]} ·{' '}
                          <Link href="/settings/cv" className="text-ink hover:underline">
                            gérer
                          </Link>
                        </>
                      ) : (
                        <Link href="/settings/cv" className="text-ink hover:underline">
                          Ajouter votre CV
                        </Link>
                      )}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Counters */}
        <div className="border-t border-line">
          <dl className="shell grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {readings.map((reading, i) => (
              <div key={reading.label} className={cn('border-line py-5', READOUT_CELLS[i])}>
                <dt className="label">{reading.label}</dt>
                <dd className="mt-2 font-mono text-[clamp(1.75rem,3.4vw,2.6rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                  {formatNumber(reading.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="shell mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        {/* Fiche: details and links */}
        <aside
          className="lg:col-span-4 lg:col-start-9 lg:row-start-1"
          aria-label={`À propos de ${firstName}`}
        >
          <div className="border-t border-ink pt-4 lg:sticky lg:top-24">
            <p className="label text-ink">À propos</p>
            <dl className="mt-3">
              <FicheRow term="Membre">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-muted" aria-hidden="true" /> depuis{' '}
                  {since}
                </span>
              </FicheRow>
              {profile.location && (
                <FicheRow term="Ville">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-muted" aria-hidden="true" />{' '}
                    {profile.location}
                  </span>
                </FicheRow>
              )}
            </dl>
            {links.length > 0 && (
              <>
                <p className="label mt-8 text-ink">Liens</p>
                <ProfileLinkList items={links} className="mt-3" />
              </>
            )}
            {isOwner && links.length === 0 && (
              <p className="mt-4 text-[14px] text-muted">
                Ajoutez votre portfolio, GitHub ou LinkedIn depuis{' '}
                <Link
                  href="/settings"
                  className="font-medium text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js hover:text-js-ink"
                >
                  vos paramètres
                </Link>
                .
              </p>
            )}
          </div>
        </aside>

        {/* Contributions */}
        <section
          className="min-w-0 lg:col-span-8 lg:row-start-1"
          aria-labelledby="profile-tabs-title"
        >
          <h2 id="profile-tabs-title" className="sr-only">
            Contributions de {profile.displayName}
          </h2>
          <nav
            aria-label="Contributions"
            className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            <ul className="flex min-w-max gap-6 border-b border-line">
              {tabs.map((item) => {
                const active = tab === item.key
                return (
                  <li key={item.key}>
                    <Link
                      href={`${base}?tab=${item.key}`}
                      preserveScroll
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        '-mb-px inline-flex h-12 items-center gap-2 border-b-2 text-[16px] font-medium transition-colors duration-150',
                        active
                          ? 'border-ink text-ink'
                          : 'border-transparent text-muted hover:border-line-2 hover:text-ink'
                      )}
                    >
                      <span className={cn(active && 'mark')}>{item.label}</span>
                      <span className="font-mono text-[12px] tabular-nums">
                        {String(item.count).padStart(2, '0')}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mt-2" key={url}>
            {tab === 'articles' && <ArticlesTab {...props} firstName={firstName} />}
            {tab === 'questions' && <QuestionsTab {...props} firstName={firstName} />}
            {tab === 'discussions' && <DiscussionsTab {...props} firstName={firstName} />}
            {tab === 'reponses' && <RepliesTab {...props} firstName={firstName} />}
          </div>
        </section>
      </div>
    </>
  )
}

type TabProps = Props & { firstName: string }

function ArticlesTab({ articles, isOwner, firstName }: TabProps) {
  if (!articles?.data.length) {
    return isOwner ? (
      <EmptyState
        className="mt-6"
        code="ART"
        title="Votre premier article vous attend."
        description="Un tutoriel, un retour d’expérience, une astuce découverte cette semaine : ce que vous savez peut débloquer quelqu’un."
        action={<ButtonLink href="/articles/nouveau">Écrire un article</ButtonLink>}
      />
    ) : (
      <EmptyState
        className="mt-6"
        code="ART"
        title={`${firstName} n’a pas encore publié d’article.`}
      />
    )
  }
  return (
    <>
      <ArticleList articles={articles.data} />
      <Pagination meta={articles.metadata} className="mt-6" />
    </>
  )
}

function QuestionsTab({ threads, isOwner, firstName }: TabProps) {
  if (!threads?.data.length) {
    return isOwner ? (
      <EmptyState
        className="mt-6"
        code="FRM"
        title="Aucune question posée."
        description="Bloqué sur un bug ou un choix technique ? La communauté est là pour ça."
        action={<ButtonLink href="/forum/nouveau">Poser une question</ButtonLink>}
      />
    ) : (
      <EmptyState
        className="mt-6"
        code="FRM"
        title={`${firstName} n’a pas encore posé de question.`}
      />
    )
  }
  return (
    <>
      <ThreadList threads={threads.data} />
      <Pagination meta={threads.metadata} className="mt-6" />
    </>
  )
}

function DiscussionsTab({ discussions, isOwner, firstName }: TabProps) {
  if (!discussions?.data.length) {
    return isOwner ? (
      <EmptyState
        className="mt-6"
        code="DSC"
        title="Aucune discussion lancée."
        description="Un débat, une annonce, un événement à partager : ouvrez la conversation."
        action={<ButtonLink href="/discussions/nouvelle">Lancer une discussion</ButtonLink>}
      />
    ) : (
      <EmptyState
        className="mt-6"
        code="DSC"
        title={`${firstName} n’a pas encore lancé de discussion.`}
      />
    )
  }
  return (
    <>
      <DiscussionList discussions={discussions.data} />
      <Pagination meta={discussions.metadata} className="mt-6" />
    </>
  )
}

function RepliesTab({ replies, isOwner, firstName }: TabProps) {
  if (!replies?.data.length) {
    return isOwner ? (
      <EmptyState
        className="mt-6"
        code="REP"
        title="Vous n’avez encore répondu à personne."
        description="Parcourez les questions ouvertes du forum : votre réponse peut être la solution."
        action={
          <ButtonLink href="/forum" variant="secondary">
            Voir les questions du forum
          </ButtonLink>
        }
      />
    ) : (
      <EmptyState className="mt-6" code="REP" title={`${firstName} n’a pas encore répondu.`} />
    )
  }
  return (
    <>
      <ReplySummaryList replies={replies.data} />
      <Pagination meta={replies.metadata} className="mt-6" />
    </>
  )
}
