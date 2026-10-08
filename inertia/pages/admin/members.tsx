import { Link, router, usePage } from '@inertiajs/react'
import { useState, type FormEvent } from 'react'
import { Ban, RotateCcw, Search, X } from 'lucide-react'
import type { Data } from '@generated/data'
import { AdminLayout } from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { Select } from '~/components/ui/field'
import { TimeAgo } from '~/components/ui/time-ago'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { RoleBadge } from '~/components/profile/role-badge'
import { ActionDialog } from '~/components/admin/action-dialog'
import { cn, formatDate, formatNumber } from '~/lib/format'

type Member = Data.User.Variants['forModeration'] & { email?: string }
type Filter = 'tous' | 'equipe' | 'suspendus'
type Role = 'member' | 'moderator' | 'admin'

type Props = {
  members: { data: Member[]; metadata: PaginationMeta }
  filters: { q: string; filter: Filter }
  counts: Record<Filter, number>
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'equipe', label: 'Équipe' },
  { value: 'suspendus', label: 'Suspendus' },
]

const ROLES: { value: Role; label: string }[] = [
  { value: 'member', label: 'Membre' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'admin', label: 'Administrateur' },
]

const RANK: Record<Role, number> = { member: 0, moderator: 1, admin: 2 }

function href(q: string, filter: Filter) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (filter !== 'tous') params.set('filtre', filter)
  const qs = params.toString()
  return qs ? `/admin/membres?${qs}` : '/admin/membres'
}

export default function AdminMembers({ members, filters, counts }: Props) {
  const viewer = usePage().props.user!
  const [q, setQ] = useState(filters.q)
  const [target, setTarget] = useState<{ member: Member; action: 'ban' | 'unban' } | null>(null)
  const [processing, setProcessing] = useState(false)
  const [roleBusy, setRoleBusy] = useState<number | null>(null)
  // Keep the search box in sync when the URL changes (back button, "Effacer").
  const [syncedQ, setSyncedQ] = useState(filters.q)
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    setQ(filters.q)
  }

  function search(event: FormEvent) {
    event.preventDefault()
    router.get(href(q.trim(), filters.filter), {}, { preserveState: true })
  }

  function changeRole(member: Member, role: Role) {
    setRoleBusy(member.id)
    router.put(
      `/admin/membres/${member.id}/role`,
      { role },
      { preserveScroll: true, onFinish: () => setRoleBusy(null) }
    )
  }

  function moderate() {
    if (!target) return
    setProcessing(true)
    const url = `/admin/membres/${target.member.id}/ban`
    const options = {
      preserveScroll: true,
      onFinish: () => {
        setProcessing(false)
        setTarget(null)
      },
    }
    if (target.action === 'ban') router.post(url, {}, options)
    else router.delete(url, options)
  }

  // Mirrors AdminMembersController#cannotModerate.
  const canModerate = (member: Member) =>
    member.id !== viewer.id && RANK[member.role] < RANK[viewer.role as Role]

  return (
    <>
      <Seo title="Membres — administration" noindex />
      <WorkspaceHeader
        kicker="Administration · Membres"
        title="Les membres."
        lead={
          viewer.isAdmin
            ? 'Cherchez un compte, ajustez son rôle, suspendez-le en cas d’abus. Une suspension déconnecte le membre et masque son profil.'
            : 'Cherchez un compte et suspendez-le en cas d’abus. Seuls les administrateurs modifient les rôles et modèrent l’équipe.'
        }
      />

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrer les membres" className="flex flex-wrap gap-1">
          {FILTERS.map((item) => {
            const active = filters.filter === item.value
            return (
              <Link
                key={item.value}
                href={href(filters.q, item.value)}
                aria-current={active ? 'page' : undefined}
                preserveScroll
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-sm border px-3 font-mono text-[12px] font-medium tracking-[0.06em] uppercase transition-colors duration-150',
                  active
                    ? 'border-ink bg-js text-js-ink'
                    : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                )}
              >
                {item.label}
                <span className={cn('tabular-nums', !active && 'text-muted')}>
                  {formatNumber(counts[item.value])}
                </span>
              </Link>
            )
          })}
        </nav>
        <form role="search" onSubmit={search} className="flex w-full gap-2 lg:max-w-md">
          <label htmlFor="admin-member-search" className="sr-only">
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
              id="admin-member-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={viewer.isAdmin ? 'Nom, @pseudo ou e-mail' : 'Nom ou @pseudo'}
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-sm border border-line-2 bg-card pr-3 pl-10 text-[15px] text-ink placeholder:text-muted/80 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-10">
            Chercher
          </Button>
        </form>
      </div>

      {filters.q && (
        <p className="mt-4 flex flex-wrap items-center gap-3">
          <span className="label">
            {formatNumber(members.metadata.total)} résultat{members.metadata.total > 1 ? 's' : ''}{' '}
            pour <span className="text-ink normal-case">« {filters.q} »</span>
          </span>
          <Link
            href={href('', filters.filter)}
            className="label inline-flex items-center gap-1 text-ink hover:underline"
          >
            <X size={12} aria-hidden="true" /> Effacer
          </Link>
        </p>
      )}

      {members.data.length ? (
        <>
          <div className="mt-6 hidden grid-cols-[minmax(0,1fr)_9rem_10rem_11rem] gap-x-5 border-b border-ink pb-2.5 xl:grid">
            <span className="label">Membre</span>
            <span className="label">Inscription</span>
            <span className="label">Rôle</span>
            <span className="label text-right">Statut</span>
          </div>
          <ul className="border-b border-line">
            {members.data.map((member) => {
              const moderatable = canModerate(member)
              const isSelf = member.id === viewer.id
              return (
                <li
                  key={member.id}
                  className={cn(
                    'grid grid-cols-[minmax(0,1fr)] gap-x-5 gap-y-3 border-t border-line py-4 first:border-t-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[minmax(0,1fr)_9rem_10rem_11rem]',
                    member.isBanned && 'bg-paper-2/60'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      user={member}
                      size="md"
                      className={cn(member.isBanned && 'opacity-50')}
                    />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/@${member.username}`}
                          className="truncate text-[15.5px] font-semibold hover:underline"
                        >
                          {member.displayName}
                        </Link>
                        {isSelf && <span className="label">(vous)</span>}
                        {!viewer.isAdmin && <RoleBadge role={member.role} />}
                      </p>
                      <p className="truncate font-mono text-[12.5px] text-muted">
                        @{member.username}
                        {member.email && <> · {member.email}</>}
                      </p>
                      <p className="mt-0.5 font-mono text-[11.5px] text-muted">
                        {member.articlesCount} art. · {member.threadsCount} quest. ·{' '}
                        {member.repliesCount} rép.
                      </p>
                    </div>
                  </div>

                  <p
                    className="hidden text-[14px] text-ink-2 xl:block"
                    title={formatDate(member.createdAt)}
                  >
                    <TimeAgo date={member.createdAt} />
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pl-[3.25rem] md:justify-end md:pl-0 xl:contents">
                    <div className="min-w-0">
                      {viewer.isAdmin ? (
                        <>
                          <label htmlFor={`role-${member.id}`} className="sr-only">
                            Rôle de {member.displayName}
                          </label>
                          <Select
                            id={`role-${member.id}`}
                            value={member.role}
                            disabled={isSelf || member.isBanned || roleBusy === member.id}
                            title={
                              isSelf
                                ? 'Vous ne pouvez pas modifier votre propre rôle'
                                : member.isBanned
                                  ? 'Réactivez le compte avant de changer son rôle'
                                  : undefined
                            }
                            onChange={(e) => changeRole(member, e.target.value as Role)}
                            className="h-9! w-44 text-[14px] xl:w-full"
                          >
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </Select>
                        </>
                      ) : (
                        <span className="hidden text-[14px] text-ink-2 xl:inline">
                          {ROLES.find((r) => r.value === member.role)?.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 xl:justify-end">
                      {member.isBanned && (
                        <span
                          className="label text-danger"
                          title={
                            member.bannedAt ? `Depuis le ${formatDate(member.bannedAt)}` : undefined
                          }
                        >
                          Suspendu
                        </span>
                      )}
                      {moderatable ? (
                        member.isBanned ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setTarget({ member, action: 'unban' })}
                          >
                            <RotateCcw size={14} aria-hidden="true" /> Réactiver
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setTarget({ member, action: 'ban' })}
                          >
                            <Ban size={14} aria-hidden="true" /> Suspendre
                          </Button>
                        )
                      ) : (
                        !member.isBanned && (
                          <span className={cn('label', isSelf && 'hidden xl:inline')}>
                            {isSelf ? '—' : 'Équipe'}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <Pagination meta={members.metadata} className="mt-8 border-t-0" />
        </>
      ) : (
        <EmptyState
          className="mt-8"
          code="MBR"
          title={
            filters.q
              ? `Aucun compte ne correspond à « ${filters.q} ».`
              : filters.filter === 'suspendus'
                ? 'Aucun compte suspendu.'
                : 'Aucun membre.'
          }
          description={
            filters.filter === 'suspendus' && !filters.q
              ? 'Tout le monde se tient bien. Pourvu que ça dure.'
              : undefined
          }
        />
      )}

      <ActionDialog
        open={target !== null}
        onClose={() => !processing && setTarget(null)}
        onConfirm={moderate}
        processing={processing}
        tone={target?.action === 'unban' ? 'neutral' : 'danger'}
        kicker={target?.action === 'unban' ? 'Levée de suspension' : 'Modération'}
        confirmLabel={target?.action === 'unban' ? 'Réactiver le compte' : 'Suspendre le compte'}
        title={
          target?.action === 'unban'
            ? `Réactiver @${target.member.username} ?`
            : `Suspendre @${target?.member.username} ?`
        }
        description={
          target?.action === 'unban'
            ? 'Le membre pourra de nouveau se connecter, et son profil redeviendra public.'
            : 'Le membre sera déconnecté, ne pourra plus se connecter et son profil disparaîtra du site. Ses contenus restent en ligne. Vous pourrez annuler à tout moment.'
        }
      />
    </>
  )
}

AdminMembers.layout = [AdminLayout]
