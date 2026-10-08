import { useState } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { ArrowUpRight, Check, EyeOff, Trash2 } from 'lucide-react'
import type { Data } from '@generated/data'
import { AdminLayout } from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { TimeAgo } from '~/components/ui/time-ago'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { RoleBadge } from '~/components/profile/role-badge'
import { ActionDialog } from '~/components/admin/action-dialog'
import { REPORT_REASON_LABELS, type ReportReason } from '~/components/reports/report-dialog'
import { cn, formatNumber, plural } from '~/lib/format'

type Row = Data.Report.Variants['forQueue']
type Tab = 'ouverts' | 'traites' | 'ignores'
type Action = 'resolve' | 'dismiss' | 'delete'

type Props = {
  rows: { data: Row[]; metadata: PaginationMeta }
  tab: Tab
  counts: Record<Tab, number>
}

const TABS: { value: Tab; label: string }[] = [
  { value: 'ouverts', label: 'Ouverts' },
  { value: 'traites', label: 'Traités' },
  { value: 'ignores', label: 'Ignorés' },
]

const TYPE_LABELS: Record<Row['target']['type'], string> = {
  article: 'Article',
  thread: 'Question',
  discussion: 'Discussion',
  reply: 'Réponse',
}

const PARENT_LABELS: Record<'article' | 'thread' | 'discussion', string> = {
  article: 'l’article',
  thread: 'la question',
  discussion: 'la discussion',
}

const NOUNS: Record<Row['target']['type'], string> = {
  article: 'cet article',
  thread: 'cette question',
  discussion: 'cette discussion',
  reply: 'cette réponse',
}

const DELETE_DESCRIPTIONS: Record<Row['target']['type'], string> = {
  article: 'L’article, ses commentaires et ses mentions « J’aime » disparaîtront définitivement.',
  thread: 'La question et toutes ses réponses disparaîtront définitivement, solution comprise.',
  discussion: 'La discussion et toutes ses réponses disparaîtront définitivement.',
  reply: 'La réponse disparaîtra définitivement de la conversation.',
}

/**
 * Row title: the content's title, or where a reply lives.
 */
function heading(target: Row['target']) {
  if (target.type === 'reply') {
    if (!target.parent) return 'Réponse supprimée'
    const where = target.parent.type ? `${PARENT_LABELS[target.parent.type]} ` : ''
    return `Réponse dans ${where}« ${target.parent.title} »`
  }
  return (
    target.title || `${TYPE_LABELS[target.type]} supprimé${target.type === 'article' ? '' : 'e'}`
  )
}

function tabHref(tab: Tab) {
  return tab === 'ouverts' ? '/admin/signalements' : `/admin/signalements?statut=${tab}`
}

/**
 * "Spam ×2 · Hors sujet": each reason once, with its count.
 */
function reasonCounts(row: Row) {
  const counts = new Map<ReportReason, number>()
  for (const report of row.reports) {
    counts.set(report.reason, (counts.get(report.reason) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

function QueueRow({
  row,
  tab,
  onAction,
}: {
  row: Row
  tab: Tab
  onAction: (row: Row, action: Action) => void
}) {
  const { target, owner } = row
  const titleId = `signalement-${row.key}`
  const blockedId = `signalement-${row.key}-bloque`

  return (
    <li className="border-t border-line py-7 first:border-t-0">
      <article
        aria-labelledby={titleId}
        className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_15.5rem]"
      >
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="label rounded-xs border border-ink px-1.5 py-0.5 text-[10.5px] text-ink">
              {TYPE_LABELS[target.type]}
            </span>
            {target.deleted && (
              <span className="label rounded-xs border border-dashed border-ink-2 px-1.5 py-0.5 text-[10.5px] text-ink-2">
                Contenu supprimé
              </span>
            )}
            {target.isDraft && (
              <span className="label mark-full px-1.5 py-0.5 text-[10.5px] font-semibold">
                Brouillon
              </span>
            )}
            {reasonCounts(row).map(([reason, count]) => (
              <span
                key={reason}
                className="label rounded-xs border border-line-2 px-1.5 py-0.5 text-[10.5px] text-ink-2"
              >
                {REPORT_REASON_LABELS[reason]}
                {count > 1 && <span className="ml-1 text-muted">×{count}</span>}
              </span>
            ))}
          </p>

          <h2
            id={titleId}
            className={cn(
              'mt-3.5 text-[19px] leading-snug font-semibold tracking-[-0.015em] break-words',
              target.deleted && 'text-ink-2'
            )}
          >
            {target.href ? (
              <Link
                href={target.href}
                className="group decoration-js decoration-2 underline-offset-4 hover:underline focus-visible:underline"
              >
                {heading(target)}
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.75}
                  className="ml-1 inline-block align-[-0.1em] text-muted transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              heading(target)
            )}
          </h2>

          {target.parent && target.title && (
            <blockquote className="mt-3 border-l-2 border-line-2 pl-4 text-[15px] leading-relaxed break-words text-ink-2">
              <p className="line-clamp-4">{target.title}</p>
            </blockquote>
          )}

          {owner && (
            <p className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
              <span>Par</span>
              <Avatar user={owner} size="xs" />
              <Link
                href={`/@${owner.username}`}
                className="font-medium text-ink-2 hover:text-ink hover:underline"
              >
                {owner.displayName}
              </Link>
              <span className="font-mono text-[12.5px]">@{owner.username}</span>
              <RoleBadge role={owner.role} className="h-5" />
            </p>
          )}

          <div className="mt-5 rounded-sm border border-line bg-paper-2/50">
            <p className="label border-b border-line px-4 py-2.5">
              {row.reportsCount > 1
                ? `${formatNumber(row.reportsCount)} signalements`
                : '1 signalement'}
            </p>
            <ul>
              {row.reports.map((report) => (
                <li
                  key={report.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-t border-line px-4 py-3 first:border-t-0"
                >
                  {report.reporter ? (
                    <Avatar user={report.reporter} size="xs" className="mt-0.5" />
                  ) : (
                    <span className="size-6" />
                  )}
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[14px]">
                      {report.reporter ? (
                        <Link
                          href={`/@${report.reporter.username}`}
                          className="font-medium text-ink hover:underline"
                        >
                          @{report.reporter.username}
                        </Link>
                      ) : (
                        <span className="text-muted">Compte supprimé</span>
                      )}
                      <span className="text-ink-2">{REPORT_REASON_LABELS[report.reason]}</span>
                      <span className="text-[13px] text-muted">
                        <TimeAgo date={report.createdAt} />
                      </span>
                    </p>
                    {report.details && (
                      <p className="mt-1 text-[14px] leading-relaxed break-words whitespace-pre-line text-ink-2">
                        « {report.details} »
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside
          aria-label="Décision"
          className="flex flex-col gap-4 border-t border-dashed border-line-2 pt-5 lg:border-t-0 lg:border-l lg:border-solid lg:border-line lg:pt-0 lg:pl-8"
        >
          {tab === 'ouverts' ? (
            <>
              <p className="label">
                Dernier signalement{' '}
                <span className="text-ink normal-case tracking-normal">
                  <TimeAgo date={row.createdAt} />
                </span>
              </p>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="justify-start"
                  onClick={() => onAction(row, 'resolve')}
                >
                  <Check size={15} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />{' '}
                  Marquer comme traité
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => onAction(row, 'dismiss')}
                >
                  <EyeOff size={15} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />{' '}
                  Ignorer
                </Button>
                {!row.target.deleted && (
                  <Button
                    size="sm"
                    variant="danger"
                    className="justify-start"
                    disabled={!row.canDelete}
                    aria-describedby={row.canDelete ? undefined : blockedId}
                    onClick={() => onAction(row, 'delete')}
                  >
                    <Trash2 size={15} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />{' '}
                    Supprimer le contenu
                  </Button>
                )}
              </div>
              {row.target.deleted ? (
                <p className="text-[13px] leading-snug text-muted">
                  Ce contenu n’existe plus&nbsp;: il ne reste qu’à clore le signalement.
                </p>
              ) : (
                !row.canDelete && (
                  <p id={blockedId} className="text-[13px] leading-snug text-muted">
                    Contenu d’un membre de l’équipe&nbsp;: seul un administrateur peut le supprimer.
                  </p>
                )
              )}
            </>
          ) : (
            <div>
              <p className={cn('label', tab === 'traites' ? 'text-ok' : 'text-ink-2')}>
                {tab === 'traites' ? 'Traité' : 'Ignoré'}
              </p>
              <p className="mt-2 text-[14.5px] text-ink-2">
                {row.resolvedBy ? (
                  <>
                    par{' '}
                    <Link
                      href={`/@${row.resolvedBy.username}`}
                      className="font-medium text-ink hover:underline"
                    >
                      @{row.resolvedBy.username}
                    </Link>
                  </>
                ) : (
                  'par un ancien membre de l’équipe'
                )}
              </p>
              <p className="mt-0.5 text-[13.5px] text-muted">
                <TimeAgo date={row.resolvedAt} />
              </p>
            </div>
          )}
        </aside>
      </article>
    </li>
  )
}

export default function AdminReports({ rows, tab, counts }: Props) {
  const viewer = usePage().props.user!
  const [pending, setPending] = useState<{ row: Row; action: Action } | null>(null)
  const [processing, setProcessing] = useState(false)

  function confirm() {
    if (!pending) return
    const { row, action } = pending
    const base = `/admin/signalements/${row.target.type}/${row.target.id}`
    const options = {
      preserveScroll: true,
      onStart: () => setProcessing(true),
      onFinish: () => {
        setProcessing(false)
        setPending(null)
      },
    }
    if (action === 'delete') router.delete(`${base}/contenu`, options)
    else router.post(`${base}/${action === 'resolve' ? 'traiter' : 'ignorer'}`, {}, options)
  }

  const close = () => !processing && setPending(null)
  const count = pending?.row.reportsCount ?? 0
  const lead =
    tab === 'ouverts'
      ? counts.ouverts
        ? `${plural(counts.ouverts, 'contenu signalé attend', 'contenus signalés attendent')} une décision. Les auteurs ne savent pas qui les a signalés.`
        : 'Aucun signalement en attente. Les membres signalent un contenu depuis son menu « Signaler ».'
      : tab === 'traites'
        ? 'Les signalements clos après une action de l’équipe : contenu corrigé, auteur averti…'
        : 'Les signalements classés sans suite : le contenu est resté en ligne.'

  return (
    <>
      <Seo title="Signalements — administration" noindex />
      <WorkspaceHeader
        kicker="Administration · Signalements"
        title={
          <>
            La file de <span className="mark">modération</span>.
          </>
        }
        lead={lead}
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Statut des signalements" className="flex flex-wrap gap-1">
          {TABS.map((item) => {
            const active = tab === item.value
            return (
              <Link
                key={item.value}
                href={tabHref(item.value)}
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
        {!viewer.isAdmin && tab === 'ouverts' && counts.ouverts > 0 && (
          <p className="max-w-sm text-[13.5px] text-muted sm:text-right">
            Le contenu de l’équipe ne peut être supprimé que par un administrateur.
          </p>
        )}
      </div>

      {rows.data.length ? (
        <>
          <ol className="mt-6 border-y border-line">
            {rows.data.map((row) => (
              <QueueRow
                key={row.key}
                row={row}
                tab={tab}
                onAction={(item, action) => setPending({ row: item, action })}
              />
            ))}
          </ol>
          <Pagination meta={rows.metadata} className="mt-8 border-t-0" />
        </>
      ) : (
        <EmptyState
          className="mt-8"
          code="MOD"
          title={
            tab === 'ouverts'
              ? 'Rien à examiner.'
              : tab === 'traites'
                ? 'Aucun signalement traité.'
                : 'Aucun signalement ignoré.'
          }
          description={
            tab === 'ouverts'
              ? 'La file est vide : aucun contenu n’a été signalé depuis la dernière revue.'
              : undefined
          }
        />
      )}

      <ActionDialog
        open={pending !== null && pending.action !== 'delete'}
        onClose={close}
        onConfirm={confirm}
        processing={processing}
        tone="neutral"
        kicker={pending?.action === 'dismiss' ? 'Classement sans suite' : 'Signalement traité'}
        confirmLabel={pending?.action === 'dismiss' ? 'Ignorer' : 'Marquer comme traité'}
        title={
          pending?.action === 'dismiss'
            ? count > 1
              ? `Ignorer ces ${count} signalements ?`
              : 'Ignorer ce signalement ?'
            : count > 1
              ? `Marquer ces ${count} signalements comme traités ?`
              : 'Marquer ce signalement comme traité ?'
        }
        description={
          pending?.action === 'dismiss'
            ? 'Le contenu reste en ligne, tel quel. Le signalement passe dans l’onglet « Ignorés ».'
            : 'À utiliser quand le problème est réglé autrement : contenu corrigé, auteur averti… Le contenu reste en ligne.'
        }
      />

      <ConfirmDialog
        open={pending?.action === 'delete'}
        onClose={close}
        onConfirm={confirm}
        processing={processing}
        confirmLabel="Supprimer le contenu"
        title={pending ? `Supprimer ${NOUNS[pending.row.target.type]} ?` : ''}
        description={
          pending
            ? `${DELETE_DESCRIPTIONS[pending.row.target.type]} Ses signalements seront clos.`
            : ''
        }
      />
    </>
  )
}

AdminReports.layout = [AdminLayout]
