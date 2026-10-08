import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import type { Data } from '@generated/data'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Button, ButtonLink } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { NotificationRow } from '~/components/notifications/notification-row'
import { cn, formatNumber, plural } from '~/lib/format'

type Filter = 'toutes' | 'non-lues'
type Group = Data.Notification['group']

type Props = {
  notifications: { data: Data.Notification[]; metadata: PaginationMeta }
  filter: Filter
  counts: { toutes: number; nonLues: number }
}

const FILTERS: { value: Filter; label: string; count: keyof Props['counts'] }[] = [
  { value: 'toutes', label: 'Toutes', count: 'toutes' },
  { value: 'non-lues', label: 'Non lues', count: 'nonLues' },
]

const GROUPS: { key: Group; label: string }[] = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'older', label: 'Plus ancien' },
]

export default function NotificationsIndex({ notifications, filter, counts }: Props) {
  const [processing, setProcessing] = useState(false)
  const items = notifications.data

  function readAll() {
    setProcessing(true)
    router.post(
      '/notifications/read-all',
      {},
      { preserveScroll: true, onFinish: () => setProcessing(false) }
    )
  }

  return (
    <>
      <Seo title="Notifications" noindex />

      <WorkspaceHeader
        kicker="Espace membre · Notifications"
        title="Notifications."
        lead={
          counts.nonLues ? (
            <>
              Vous avez{' '}
              <span className="mark text-ink">
                {plural(counts.nonLues, 'notification non lue', 'notifications non lues')}
              </span>
              . Les réponses à vos questions, discussions et articles, et vos réponses acceptées
              comme solution.
            </>
          ) : (
            'Vous êtes à jour. Les réponses à vos questions, discussions et articles, et vos réponses acceptées comme solution arrivent ici.'
          )
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={readAll}
            disabled={!counts.nonLues}
            loading={processing}
          >
            <CheckCheck size={15} strokeWidth={1.75} aria-hidden="true" /> Tout marquer comme lu
          </Button>
        }
      />

      <nav aria-label="Filtrer les notifications" className="mt-8 flex flex-wrap gap-1">
        {FILTERS.map((item) => {
          const active = filter === item.value
          return (
            <Link
              key={item.value}
              href={item.value === 'toutes' ? '/notifications' : '/notifications?filtre=non-lues'}
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
                {formatNumber(counts[item.count])}
              </span>
            </Link>
          )
        })}
      </nav>

      {items.length ? (
        <>
          {GROUPS.map((group) => {
            const rows = items.filter((notification) => notification.group === group.key)
            if (!rows.length) return null
            return (
              <section
                key={group.key}
                aria-labelledby={`notifications-${group.key}`}
                className="mt-10"
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2.5">
                  <h2
                    id={`notifications-${group.key}`}
                    className="text-[17px] leading-tight font-semibold tracking-[-0.015em]"
                  >
                    {group.label}
                  </h2>
                  <span className="label tabular-nums">{formatNumber(rows.length)}</span>
                </div>
                <ol>
                  {rows.map((notification) => (
                    <NotificationRow key={notification.id} notification={notification} />
                  ))}
                </ol>
              </section>
            )
          })}
          <Pagination meta={notifications.metadata} className="mt-10" />
        </>
      ) : filter === 'non-lues' ? (
        <EmptyState
          className="mt-8"
          code="NTF"
          title="Rien de nouveau, vous êtes à jour."
          description="Aucune notification non lue. Les prochaines réponses à vos publications apparaîtront ici."
          action={
            counts.toutes > 0 ? (
              <ButtonLink href="/notifications" variant="secondary" size="sm">
                Voir toutes les notifications
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <EmptyState
          className="mt-8"
          code="NTF"
          title="Aucune notification pour l’instant."
          description="Quand un membre répondra à vos questions ou à vos discussions, commentera vos articles ou acceptera votre réponse comme solution, vous le verrez ici."
          action={
            <ButtonLink href="/forum" variant="secondary" size="sm">
              Aider sur le forum
            </ButtonLink>
          }
        />
      )}
    </>
  )
}

NotificationsIndex.layout = [DashboardLayout]
