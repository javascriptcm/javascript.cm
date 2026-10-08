import { Link, router } from '@inertiajs/react'
import { useState, type FormEvent } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { Avatar } from '~/components/ui/avatar'
import { Button, ButtonLink } from '~/components/ui/button'
import { RoleBadge } from '~/components/profile/role-badge'
import { cn, formatNumber, plural } from '~/lib/format'

type Member = Data.User.Variants['forDirectory']
type Sort = 'recents' | 'actifs'

type Props = {
  members: { data: Member[]; metadata: PaginationMeta }
  filters: { q: string; sort: Sort }
  totalMembers: number
}

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recents', label: 'Derniers arrivés' },
  { value: 'actifs', label: 'Les plus actifs' },
]

const sinceFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' })

function href(filters: { q: string; sort: Sort }) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.sort !== 'recents') params.set('sort', filters.sort)
  const qs = params.toString()
  return qs ? `/membres?${qs}` : '/membres'
}

function Counter({ value, label, title }: { value: number; label: string; title: string }) {
  return (
    <span
      title={`${formatNumber(value)} ${title}`}
      className={cn('inline-flex items-baseline gap-1', value === 0 && 'text-muted/70')}
    >
      <span className="font-semibold text-ink tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="text-muted">{label}</span>
      <span className="sr-only">{title}</span>
    </span>
  )
}

function MemberRow({ member, index }: { member: Member; index: number }) {
  return (
    <li className="border-t border-line first:border-t-0">
      <article className="group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 py-5 sm:grid-cols-[2.75rem_auto_minmax(0,1fr)] sm:gap-x-5 lg:grid-cols-[2.75rem_auto_minmax(0,1fr)_11rem_13.5rem] lg:items-center">
        <span className="label hidden pt-1 tabular-nums sm:block lg:pt-0">
          {String(index).padStart(3, '0')}
        </span>
        <Avatar
          user={member}
          size="lg"
          className="transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5"
        />
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Link
              href={`/@${member.username}`}
              className="text-[19px] leading-tight font-semibold tracking-[-0.02em] decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
            >
              {member.displayName}
            </Link>
            <RoleBadge role={member.role} />
          </h2>
          <p className="mt-0.5 font-mono text-[13px] text-muted">@{member.username}</p>
          {member.bio ? (
            <p className="mt-1.5 line-clamp-1 text-[15px] text-ink-2">{member.bio}</p>
          ) : (
            <p className="mt-1.5 text-[15px] text-muted/80 italic">Pas encore de bio.</p>
          )}
        </div>

        <div className="col-start-2 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 sm:col-start-3 lg:col-span-1 lg:col-start-auto lg:mt-0 lg:block">
          {member.location ? (
            <p className="inline-flex min-w-0 items-center gap-1.5 text-[14px] text-ink-2 lg:flex">
              <MapPin
                size={14}
                strokeWidth={1.75}
                className="shrink-0 text-muted"
                aria-hidden="true"
              />
              <span className="truncate">{member.location}</span>
            </p>
          ) : (
            <p className="hidden text-[14px] text-muted lg:block" aria-hidden="true">
              —
            </p>
          )}
          <p className="label normal-case tracking-normal lg:mt-1">
            depuis {member.createdAt ? sinceFmt.format(new Date(member.createdAt)) : '—'}
          </p>
        </div>

        <p className="col-start-2 mt-2 flex gap-4 font-mono text-[12.5px] sm:col-start-3 lg:col-span-1 lg:col-start-auto lg:mt-0 lg:justify-end">
          <Counter value={member.articlesCount} label="art." title="articles publiés" />
          <Counter value={member.threadsCount} label="quest." title="questions" />
          <Counter value={member.repliesCount} label="rép." title="réponses" />
        </p>
      </article>
    </li>
  )
}

export default function MembersIndex({ members, filters, totalMembers }: Props) {
  const [q, setQ] = useState(filters.q)
  // Keep the search box in sync when the URL changes (back button, "Effacer").
  const [syncedQ, setSyncedQ] = useState(filters.q)
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    setQ(filters.q)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    router.get(href({ q: q.trim(), sort: filters.sort }), {}, { preserveState: true })
  }

  const meta = members.metadata
  const offset = (meta.currentPage - 1) * meta.perPage

  return (
    <>
      <Seo
        title={filters.q ? `Membres — « ${filters.q} »` : 'Les membres'}
        description={`L’annuaire des ${formatNumber(totalMembers)} membres de JavaScript Cameroun : développeuses et développeurs JavaScript, TypeScript, React, Node.js du 237.`}
        path="/membres"
        noindex={Boolean(filters.q) || meta.currentPage > 1}
      />

      <PageHeader
        kicker={
          <>
            Annuaire · <span className="text-ink">{plural(totalMembers, 'membre')}</span>
          </>
        }
        title={
          <>
            Les gens du <span className="mark">237</span>.
          </>
        }
        lead="Celles et ceux qui écrivent, demandent, répondent. Trouvez une personne, découvrez ce qu’elle publie, apprenez de ses réponses."
      >
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <form role="search" onSubmit={submit} className="flex w-full max-w-xl gap-2">
            <label htmlFor="member-search" className="sr-only">
              Chercher un membre
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                strokeWidth={1.75}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="member-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nom ou @pseudo"
                autoComplete="off"
                spellCheck={false}
                maxLength={60}
                className="h-11 w-full rounded-sm border border-line-2 bg-card pr-3.5 pl-10 text-[15px] text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted/80 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
            <Button type="submit" variant="secondary">
              Chercher
            </Button>
          </form>

          <nav aria-label="Trier les membres" className="flex shrink-0 gap-1">
            {SORTS.map((sort) => {
              const active = filters.sort === sort.value
              return (
                <Link
                  key={sort.value}
                  href={href({ q: filters.q, sort: sort.value })}
                  aria-current={active ? 'page' : undefined}
                  preserveScroll
                  className={cn(
                    'inline-flex h-9 items-center rounded-sm border px-3 font-mono text-[12px] font-medium tracking-[0.06em] uppercase transition-colors duration-150',
                    active
                      ? 'border-ink bg-js text-js-ink'
                      : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                  )}
                >
                  {sort.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </PageHeader>

      <section className="shell pt-8" aria-label="Liste des membres">
        {filters.q && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="label">
              {plural(meta.total, 'résultat', 'résultats', 'Aucun résultat')} pour{' '}
              <span className="text-ink normal-case">« {filters.q} »</span>
            </p>
            <Link
              href={href({ q: '', sort: filters.sort })}
              className="label inline-flex items-center gap-1 text-ink hover:underline"
            >
              <X size={12} aria-hidden="true" /> Effacer
            </Link>
          </div>
        )}

        {members.data.length ? (
          <>
            <div className="hidden grid-cols-[2.75rem_3.5rem_minmax(0,1fr)_11rem_13.5rem] gap-x-5 border-b border-ink pb-2.5 lg:grid">
              <span className="label">N°</span>
              <span />
              <span className="label">Membre</span>
              <span className="label">Ville</span>
              <span className="label text-right">Contributions</span>
            </div>
            <ol className="border-b border-line lg:border-t-0">
              {members.data.map((member, i) => (
                <MemberRow key={member.id} member={member} index={offset + i + 1} />
              ))}
            </ol>
            <Pagination meta={meta} className="mt-10 border-t-0" />
          </>
        ) : filters.q ? (
          <EmptyState
            code="MBR"
            title={<>Personne ne répond à « {filters.q} ».</>}
            description="Vérifiez l’orthographe, ou cherchez par nom d’utilisateur (sans le @)."
            action={
              <ButtonLink href={href({ q: '', sort: filters.sort })} variant="secondary">
                Voir tous les membres
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            code="MBR"
            title="L’annuaire est encore vide."
            description="Soyez parmi les premiers à rejoindre la communauté."
            action={<ButtonLink href="/register">Rejoindre la communauté</ButtonLink>}
          />
        )}
      </section>
    </>
  )
}
