import { Link, router } from '@inertiajs/react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { Avatar } from '~/components/ui/avatar'
import { Button, ButtonLink } from '~/components/ui/button'
import { RoleBadge } from '~/components/profile/role-badge'
import {
  AVAILABILITY_LABELS,
  AVAILABILITY_SHORT_LABELS,
  AvailabilityBadge,
  type Availability,
} from '~/components/profile/availability'
import { cn, formatNumber, plural } from '~/lib/format'

type Member = Data.User.Variants['forDirectory']
type Sort = 'recents' | 'actifs'

type Filters = {
  q: string
  sort: Sort
  competence: string
  disponibilite: Availability | ''
  ville: string
}

type Props = {
  members: { data: Member[]; metadata: PaginationMeta }
  filters: Filters
  totalMembers: number
  popularSkills: { name: string; total: number }[]
}

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recents', label: 'Derniers arrivés' },
  { value: 'actifs', label: 'Les plus actifs' },
]

const AVAILABILITIES: (Availability | '')[] = ['', 'open_to_work', 'freelance', 'hiring']

const sinceFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' })

const sameSkill = (a: string, b: string) => a.toLocaleLowerCase('fr') === b.toLocaleLowerCase('fr')

/**
 * Directory URL for a set of filters (page reset to 1).
 */
function href(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.competence) params.set('competence', filters.competence)
  if (filters.disponibilite) params.set('disponibilite', filters.disponibilite)
  if (filters.ville) params.set('ville', filters.ville)
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

function FilterPill({
  href: target,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={target}
      aria-current={active ? 'page' : undefined}
      preserveScroll
      className={cn(
        'inline-flex h-9 shrink-0 items-center rounded-sm border px-3 font-mono text-[12px] font-medium tracking-[0.06em] uppercase transition-colors duration-150',
        active
          ? 'border-ink bg-js text-js-ink'
          : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
      )}
    >
      {children}
    </Link>
  )
}

function MemberRow({
  member,
  index,
  competence,
}: {
  member: Member
  index: number
  competence: string
}) {
  // The skill being filtered on comes first, then the member's own order.
  const skills = competence
    ? [
        ...member.skills.filter((s) => sameSkill(s, competence)),
        ...member.skills.filter((s) => !sameSkill(s, competence)),
      ]
    : member.skills
  const shown = skills.slice(0, 3)
  const more = skills.length - shown.length

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
            <AvailabilityBadge availability={member.availability} className="relative" />
          </h2>
          <p className="mt-0.5 font-mono text-[13px] text-muted">@{member.username}</p>
          {member.headline ? (
            <p className="mt-1.5 line-clamp-2 text-[15px] font-medium text-ink sm:line-clamp-1">
              {member.headline}
            </p>
          ) : member.bio ? (
            <p className="mt-1.5 line-clamp-1 text-[15px] text-ink-2">{member.bio}</p>
          ) : (
            <p className="mt-1.5 text-[15px] text-muted/80 italic">Pas encore de présentation.</p>
          )}
          {shown.length > 0 && (
            <ul
              className="relative mt-2.5 flex flex-wrap items-center gap-1.5"
              aria-label="Compétences"
            >
              {shown.map((skill) => {
                const active = Boolean(competence) && sameSkill(skill, competence)
                return (
                  <li key={skill}>
                    <Link
                      href={`/membres?competence=${encodeURIComponent(skill)}`}
                      className={cn(
                        'inline-flex h-6 items-center rounded-xs border px-1.5 text-[12.5px] font-medium transition-colors duration-150',
                        active
                          ? 'border-ink bg-js text-js-ink'
                          : 'border-line-2 text-ink-2 hover:border-ink hover:bg-js hover:text-js-ink'
                      )}
                    >
                      {skill}
                    </Link>
                  </li>
                )
              })}
              {more > 0 && (
                <li className="font-mono text-[12px] text-muted">
                  +{more}
                  <span className="sr-only"> autres compétences</span>
                </li>
              )}
            </ul>
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
          <p className="label tracking-normal normal-case lg:mt-1">
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

const inputClasses =
  'h-11 w-full rounded-sm border border-line-2 bg-card px-3.5 text-[15px] text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted/80 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none [&::-webkit-search-cancel-button]:hidden'

export default function MembersIndex({ members, filters, totalMembers, popularSkills }: Props) {
  const [draft, setDraft] = useState({
    q: filters.q,
    competence: filters.competence,
    ville: filters.ville,
  })
  // Keep the inputs in sync when the URL changes (back button, "Effacer").
  const [synced, setSynced] = useState(filters)
  if (
    filters.q !== synced.q ||
    filters.competence !== synced.competence ||
    filters.ville !== synced.ville
  ) {
    setSynced(filters)
    setDraft({ q: filters.q, competence: filters.competence, ville: filters.ville })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    router.get(
      href({
        ...filters,
        q: draft.q.trim(),
        competence: draft.competence.trim(),
        ville: draft.ville.trim(),
      }),
      {},
      { preserveState: true }
    )
  }

  const meta = members.metadata
  const offset = (meta.currentPage - 1) * meta.perPage
  const filtered = Boolean(
    filters.q || filters.competence || filters.disponibilite || filters.ville
  )

  type ActiveFilter = { key: 'q' | 'competence' | 'disponibilite' | 'ville'; label: ReactNode }
  const active: ActiveFilter[] = []
  if (filters.q) active.push({ key: 'q', label: <>« {filters.q} »</> })
  if (filters.competence) {
    active.push({ key: 'competence', label: <>compétence « {filters.competence} »</> })
  }
  if (filters.disponibilite) {
    active.push({
      key: 'disponibilite',
      label: AVAILABILITY_LABELS[filters.disponibilite].toLocaleLowerCase('fr'),
    })
  }
  if (filters.ville) active.push({ key: 'ville', label: <>ville « {filters.ville} »</> })

  const title = filters.competence
    ? `Membres — ${filters.competence}`
    : filters.q
      ? `Membres — « ${filters.q} »`
      : 'Les membres'

  return (
    <>
      <Seo
        title={title}
        description={`L’annuaire des ${formatNumber(totalMembers)} membres de JavaScript Cameroun : développeuses et développeurs JavaScript, TypeScript, React, Node.js du 237.`}
        path="/membres"
        noindex={filtered || meta.currentPage > 1}
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
        lead="Celles et ceux qui écrivent, demandent, répondent — et qui recrutent. Trouvez une personne par son nom, ses compétences, sa ville ou sa disponibilité."
      >
        <form
          role="search"
          aria-label="Chercher un membre"
          onSubmit={submit}
          className="mt-10 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end"
        >
          <div>
            <label htmlFor="member-search" className="label mb-1.5 block text-ink-2">
              Nom, @pseudo ou titre
            </label>
            <div className="relative">
              <Search
                size={16}
                strokeWidth={1.75}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="member-search"
                type="search"
                value={draft.q}
                onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                placeholder="Ngono, @ekane, développeuse…"
                autoComplete="off"
                spellCheck={false}
                maxLength={60}
                className={cn(inputClasses, 'pl-10')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="member-skill" className="label mb-1.5 block text-ink-2">
              Compétence
            </label>
            <input
              id="member-skill"
              type="search"
              value={draft.competence}
              onChange={(e) => setDraft({ ...draft, competence: e.target.value })}
              placeholder="React, Node.js…"
              autoComplete="off"
              spellCheck={false}
              maxLength={30}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="member-city" className="label mb-1.5 block text-ink-2">
              Ville
            </label>
            <input
              id="member-city"
              type="search"
              value={draft.ville}
              onChange={(e) => setDraft({ ...draft, ville: e.target.value })}
              placeholder="Douala, Yaoundé…"
              autoComplete="off"
              maxLength={60}
              className={inputClasses}
            />
          </div>
          <Button type="submit" variant="secondary">
            Chercher
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav
            aria-label="Disponibilité"
            className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            <ul className="flex min-w-max gap-1">
              {AVAILABILITIES.map((value) => (
                <li key={value || 'all'}>
                  <FilterPill
                    href={href({ ...filters, disponibilite: value })}
                    active={filters.disponibilite === value}
                  >
                    {value ? AVAILABILITY_SHORT_LABELS[value] : 'Tous'}
                  </FilterPill>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Trier les membres" className="flex shrink-0 gap-1">
            {SORTS.map((sort) => (
              <FilterPill
                key={sort.value}
                href={href({ ...filters, sort: sort.value })}
                active={filters.sort === sort.value}
              >
                {sort.label}
              </FilterPill>
            ))}
          </nav>
        </div>

        {popularSkills.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <span className="label mr-1.5">Compétences fréquentes</span>
            {popularSkills.map((skill) => {
              const current =
                Boolean(filters.competence) && sameSkill(skill.name, filters.competence)
              return (
                <Link
                  key={skill.name}
                  href={href({ ...filters, competence: current ? '' : skill.name })}
                  aria-current={current ? 'true' : undefined}
                  preserveScroll
                  className={cn(
                    'inline-flex h-7 items-center gap-1.5 rounded-sm border px-2 text-[13px] font-medium transition-colors duration-150',
                    current
                      ? 'border-ink bg-js text-js-ink'
                      : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                  )}
                >
                  {skill.name}
                  <span
                    className={cn('font-mono text-[11px]', current ? 'text-js-ink' : 'text-muted')}
                  >
                    {skill.total}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </PageHeader>

      <section className="shell pt-8" aria-label="Liste des membres">
        {filtered && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="label">{plural(meta.total, 'membre', 'membres', 'Aucun membre')} ·</p>
            <ul className="flex flex-wrap items-center gap-1.5">
              {active.map((item) => (
                <li key={item.key}>
                  <Link
                    href={href({ ...filters, [item.key]: '' })}
                    preserveScroll
                    className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-ink px-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
                  >
                    {item.label}
                    <X size={12} strokeWidth={2} aria-hidden="true" />
                    <span className="sr-only">(retirer ce filtre)</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={href({
                q: '',
                competence: '',
                disponibilite: '',
                ville: '',
                sort: filters.sort,
              })}
              className="label inline-flex items-center gap-1 text-ink hover:underline"
            >
              Tout effacer
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
                <MemberRow
                  key={member.id}
                  member={member}
                  index={offset + i + 1}
                  competence={filters.competence}
                />
              ))}
            </ol>
            <Pagination meta={meta} className="mt-10 border-t-0" />
          </>
        ) : filtered ? (
          <EmptyState
            code="MBR"
            title="Personne ne correspond à ces critères."
            description="Retirez un filtre, vérifiez l’orthographe de la compétence ou de la ville, ou cherchez par nom d’utilisateur (sans le @)."
            action={
              <ButtonLink
                href={href({
                  q: '',
                  competence: '',
                  disponibilite: '',
                  ville: '',
                  sort: filters.sort,
                })}
                variant="secondary"
              >
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
