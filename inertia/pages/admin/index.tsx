import { Link } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'
import type { Data } from '@generated/data'
import { AdminLayout } from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { EmptyState } from '~/components/ui/empty-state'
import { WorkspaceHeader, WorkspaceSectionTitle } from '~/components/dashboard/workspace-header'
import { Readout } from '~/components/dashboard/readout'
import { RoleBadge } from '~/components/profile/role-badge'
import { plural } from '~/lib/format'

type Member = Data.User.Variants['forModeration'] & { email?: string }

type Props = {
  stats: Record<
    | 'members'
    | 'banned'
    | 'staff'
    | 'signups_week'
    | 'articles'
    | 'drafts'
    | 'threads'
    | 'unsolved'
    | 'discussions'
    | 'replies'
    | 'tags'
    | 'channels',
    number
  >
  members: Member[]
  articles: Data.Article[]
  threads: Data.Thread[]
  discussions: Data.Discussion[]
}

type ContentItem = {
  id: number
  title: string
  href: string
  author?: Data.User
  date: string | null
  meta?: string
}

function ContentColumn({
  index,
  title,
  href,
  items,
  empty,
}: {
  index: string
  title: string
  href: string
  items: ContentItem[]
  empty: string
}) {
  return (
    <section aria-labelledby={`admin-${href}`} className="min-w-0">
      <WorkspaceSectionTitle
        index={index}
        id={`admin-${href}`}
        title={title}
        action={
          <Link href={`/${href}`} className="label link-draw shrink-0 text-ink">
            Sur le site →
          </Link>
        }
      />
      {items.length ? (
        <ol>
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative border-t border-line py-3.5 first:border-t-0"
            >
              <Link
                href={item.href}
                className="text-[15.5px] leading-snug font-semibold decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
              >
                {item.title}
              </Link>
              <p className="mt-1 text-[13px] text-muted">
                {item.author ? `@${item.author.username}` : '—'} · <TimeAgo date={item.date} />
                {item.meta && <> · {item.meta}</>}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-6 text-[14.5px] text-muted">{empty}</p>
      )}
    </section>
  )
}

export default function AdminIndex({ stats, members, articles, threads, discussions }: Props) {
  return (
    <>
      <Seo title="Administration" noindex />
      <WorkspaceHeader
        kicker="Administration · Vue d’ensemble"
        title={
          <>
            La salle des <span className="mark">machines</span>.
          </>
        }
        lead={`${plural(stats.signups_week, 'inscription', 'inscriptions', 'Aucune inscription')} ces 7 derniers jours · ${plural(stats.unsolved, 'question', 'questions', 'aucune question')} sans solution.`}
      />

      <section aria-labelledby="admin-counters" className="mt-8">
        <h2 id="admin-counters" className="sr-only">
          Compteurs
        </h2>
        <Readout
          readings={[
            { label: 'Membres actifs', value: stats.members, note: `${stats.staff} dans l’équipe` },
            { label: 'Suspendus', value: stats.banned },
            {
              label: 'Articles',
              value: stats.articles,
              note: stats.drafts ? plural(stats.drafts, 'brouillon') : undefined,
            },
            { label: 'Questions', value: stats.threads, note: `${stats.unsolved} sans solution` },
            { label: 'Discussions', value: stats.discussions },
            { label: 'Réponses', value: stats.replies },
          ]}
        />
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12.5px] text-muted">
          <Link href="/admin/tags" className="link-draw hover:text-ink">
            {plural(stats.tags, 'tag')} →
          </Link>
          <Link href="/admin/canaux" className="link-draw hover:text-ink">
            {plural(stats.channels, 'canal', 'canaux')} du forum →
          </Link>
        </p>
      </section>

      <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="admin-signups" className="min-w-0">
            <WorkspaceSectionTitle
              index="01"
              id="admin-signups"
              title="Dernières inscriptions"
              action={
                <Link href="/admin/membres" className="label link-draw shrink-0 text-ink">
                  Tout voir →
                </Link>
              }
            />
            {members.length ? (
              <ol>
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-t border-line py-3 first:border-t-0"
                  >
                    <Avatar user={member} size="sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2">
                        <Link
                          href={`/@${member.username}`}
                          className="truncate text-[15px] font-semibold group-hover:underline after:absolute after:inset-0 after:content-['']"
                        >
                          {member.displayName}
                        </Link>
                        <RoleBadge role={member.role} />
                        {member.isBanned && <span className="label text-danger">Suspendu</span>}
                      </p>
                      <p className="truncate font-mono text-[12px] text-muted">
                        {member.email ?? `@${member.username}`}
                      </p>
                    </div>
                    <span className="text-[13px] whitespace-nowrap text-muted">
                      <TimeAgo date={member.createdAt} />
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState className="mt-5" code="MBR" title="Personne pour l’instant." />
            )}
          </section>

          <ContentColumn
            index="02"
            title="Discussions"
            href="discussions"
            empty="Aucune discussion."
            items={discussions.map((d) => ({
              id: d.id,
              title: d.title,
              href: `/discussions/${d.slug}`,
              author: d.author,
              date: d.createdAt,
              meta: plural(d.repliesCount, 'réponse', 'réponses', 'sans réponse'),
            }))}
          />
        </div>

        <div className="min-w-0 space-y-14">
          <ContentColumn
            index="03"
            title="Articles publiés"
            href="articles"
            empty="Aucun article publié."
            items={articles.map((a) => ({
              id: a.id,
              title: a.title,
              href: `/articles/${a.slug}`,
              author: a.author,
              date: a.publishedAt ?? a.createdAt,
              meta: plural(a.viewsCount, 'lecture', 'lectures', 'aucune lecture'),
            }))}
          />
          <ContentColumn
            index="04"
            title="Questions"
            href="forum"
            empty="Aucune question."
            items={threads.map((t) => ({
              id: t.id,
              title: t.title,
              href: `/forum/${t.slug}`,
              author: t.author,
              date: t.createdAt,
              meta: t.isSolved
                ? 'résolue'
                : plural(t.repliesCount, 'réponse', 'réponses', 'sans réponse'),
            }))}
          />
          <section
            aria-label="Raccourcis"
            className="rounded-sm border border-dashed border-line-2 p-5"
          >
            <p className="label">Raccourcis</p>
            <ul className="mt-3 grid gap-1">
              {[
                ['/admin/membres?filtre=suspendus', 'Comptes suspendus'],
                ['/admin/membres?filtre=equipe', 'L’équipe de modération'],
                ['/admin/canaux', 'Organiser les canaux du forum'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 py-1 text-[15px] font-medium"
                  >
                    <span className="link-draw">{label}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

AdminIndex.layout = [AdminLayout]
