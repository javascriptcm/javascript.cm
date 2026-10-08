import { Link, router } from '@inertiajs/react'
import { useState, type ReactNode } from 'react'
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { TimeAgo } from '~/components/ui/time-ago'
import { cn, formatNumber } from '~/lib/format'

type Notification = Data.Notification
type Kind = Notification['type']

const KIND: Record<Kind, { label: string; icon: LucideIcon }> = {
  thread_reply: { label: 'Forum', icon: MessageSquare },
  discussion_reply: { label: 'Discussion', icon: MessagesSquare },
  article_comment: { label: 'Article', icon: Newspaper },
  solution_accepted: { label: 'Solution', icon: Check },
  job_approved: { label: 'Emploi', icon: BriefcaseBusiness },
  job_rejected: { label: 'Emploi', icon: BriefcaseBusiness },
  event_reminder: { label: 'Événement', icon: CalendarDays },
  event_promoted: { label: 'Événement', icon: CalendarDays },
  event_cancelled: { label: 'Événement', icon: CalendarDays },
}

/**
 * "Aminata Ngono a répondu à votre question « … »", "… et 2 autres membres
 * ont aussi commenté l’article « … »", "Votre réponse a été acceptée…".
 */
function sentence(notification: Notification): ReactNode {
  // Generic notifications (jobs, events) carry their own sentence.
  if (notification.title) return <span className="text-ink">{notification.title}</span>

  const { subject } = notification
  const title = subject ? (
    <span className="text-ink">«&nbsp;{subject.title}&nbsp;»</span>
  ) : (
    <span className="italic">un contenu supprimé</span>
  )

  if (notification.type === 'solution_accepted') {
    return <>Votre réponse a été acceptée comme solution sur {title}</>
  }

  const name = notification.actor?.displayName ?? 'Un membre'
  // Counters are only computed for unread rows (read ones read as a single reply).
  const others = notification.isRead ? 0 : Math.max(0, notification.actorsCount - 1)
  const many = others > 0
  const who = (
    <>
      <span className="font-semibold text-ink">{name}</span>
      {many && (
        <> et {others === 1 ? '1 autre membre' : `${formatNumber(others)} autres membres`}</>
      )}
    </>
  )
  const mine = subject?.isMine ?? false
  const own = !many && (subject?.byActor ?? false)

  switch (notification.type) {
    case 'thread_reply':
      if (mine)
        return (
          <>
            {who} {many ? 'ont répondu' : 'a répondu'} à votre question {title}
          </>
        )
      if (own)
        return (
          <>
            {who} a répondu à sa question {title}
          </>
        )
      return (
        <>
          {who} {many ? 'ont aussi répondu' : 'a aussi répondu'} à la question {title}
        </>
      )
    case 'discussion_reply':
      if (mine)
        return (
          <>
            {who} {many ? 'ont répondu' : 'a répondu'} à votre discussion {title}
          </>
        )
      if (own)
        return (
          <>
            {who} a répondu dans sa discussion {title}
          </>
        )
      return (
        <>
          {who} {many ? 'ont aussi répondu' : 'a aussi répondu'} à la discussion {title}
        </>
      )
    case 'article_comment':
      if (mine)
        return (
          <>
            {who} {many ? 'ont commenté' : 'a commenté'} votre article {title}
          </>
        )
      if (own)
        return (
          <>
            {who} a répondu aux commentaires de son article {title}
          </>
        )
      return (
        <>
          {who} {many ? 'ont aussi commenté' : 'a aussi commenté'} l’article {title}
        </>
      )
  }
}

function newRepliesLabel(notification: Notification) {
  if (notification.isRead || notification.newReplies < 2) return null
  const count = formatNumber(notification.newReplies)
  return notification.type === 'article_comment'
    ? `${count} nouveaux commentaires`
    : `${count} nouvelles réponses`
}

/**
 * One notification: actor, sentence, excerpt of the reply, when. The whole
 * row links to /notifications/:id (marks it read, then opens the reply).
 */
export function NotificationRow({ notification }: { notification: Notification }) {
  const [busy, setBusy] = useState(false)
  const unread = !notification.isRead
  const kind = KIND[notification.type]
  const KindIcon = kind.icon
  const isSolution = notification.type === 'solution_accepted'
  const extra = newRepliesLabel(notification)

  function markRead() {
    setBusy(true)
    router.post(
      `/notifications/${notification.id}/read`,
      {},
      { preserveScroll: true, preserveState: true, onFinish: () => setBusy(false) }
    )
  }

  return (
    <li
      className={cn(
        'group relative grid grid-cols-[auto_minmax(0,1fr)_2rem] gap-x-3.5 border-t border-line py-4 pr-2 pl-3 transition-colors duration-150 first:border-t-0 hover:bg-paper-2 sm:gap-x-4 sm:pl-4',
        unread && 'bg-card shadow-[inset_3px_0_0_var(--js)]'
      )}
    >
      <span className="relative mt-0.5 self-start">
        {notification.actor ? (
          <Avatar user={notification.actor} size="md" />
        ) : (
          <span className="grid size-10 place-items-center rounded-sm border border-line bg-paper-2 text-muted">
            <KindIcon size={16} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
        <span
          className={cn(
            'absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-xs border-2 border-paper',
            isSolution ? 'bg-ok text-paper' : 'bg-ink text-paper'
          )}
          aria-hidden="true"
        >
          <KindIcon size={11} strokeWidth={isSolution ? 3 : 2.25} />
        </span>
      </span>

      <div className="min-w-0">
        <p
          className={cn(
            'text-[15.5px] leading-snug',
            unread ? 'font-medium text-ink' : 'text-ink-2'
          )}
        >
          <Link
            href={notification.href}
            className="decoration-js decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ink"
          >
            {unread && <span className="sr-only">Non lue : </span>}
            {sentence(notification)}
          </Link>
        </p>
        {notification.excerpt && (
          <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-muted sm:line-clamp-1">
            {notification.excerpt}
          </p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-muted">
          <span className={cn('label', isSolution ? 'text-ok' : 'text-ink-2')}>{kind.label}</span>
          {isSolution && notification.actor && (
            <>
              <span aria-hidden="true">·</span>
              <span>par {notification.actor.displayName}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <TimeAgo date={notification.createdAt} />
          {extra && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-ink">{extra}</span>
            </>
          )}
        </p>
      </div>

      <div className="relative z-10 self-start">
        {unread && (
          <button
            type="button"
            onClick={markRead}
            disabled={busy}
            aria-label="Marquer comme lue"
            title="Marquer comme lue"
            className="grid size-8 place-items-center rounded-sm border border-transparent text-muted transition-colors duration-150 hover:border-ink hover:bg-js hover:text-js-ink active:translate-y-px disabled:opacity-45"
          >
            <Check size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  )
}
