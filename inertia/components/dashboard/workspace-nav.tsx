import { Link, usePage } from '@inertiajs/react'
import {
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesColumn,
  HandHeart,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CircleUserRound,
  FileText,
  Flag,
  Gauge,
  Hash,
  KeyRound,
  LayoutDashboard,
  MessagesSquare,
  Shield,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Avatar } from '~/components/ui/avatar'
import { cn } from '~/lib/format'

export type WorkspaceVariant = 'member' | 'admin'

type Item = {
  href: string
  label: string
  icon: LucideIcon
  count?: number
  /** Screen-reader suffix of the counter (" non lues" by default). */
  countLabel?: string
}

const MEMBER_ITEMS: Item[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Profil', icon: UserRound },
  { href: '/settings/cv', label: 'CV', icon: FileText },
  { href: '/settings/password', label: 'Mot de passe', icon: KeyRound },
  { href: '/settings/account', label: 'Compte', icon: CircleUserRound },
]

const ADMIN_ITEMS: Item[] = [
  { href: '/admin', label: 'Vue d’ensemble', icon: Gauge },
  { href: '/admin/signalements', label: 'Signalements', icon: Flag, countLabel: ' en attente' },
  { href: '/admin/membres', label: 'Membres', icon: Users },
  { href: '/admin/tags', label: 'Tags', icon: Hash },
  { href: '/admin/canaux', label: 'Canaux', icon: MessagesSquare },
  { href: '/admin/emplois', label: 'Offres d’emploi', icon: BriefcaseBusiness },
  { href: '/admin/evenements', label: 'Événements', icon: CalendarDays },
  { href: '/admin/sponsors', label: 'Sponsors', icon: HandHeart },
  { href: '/admin/statistiques', label: 'Statistiques', icon: ChartNoAxesColumn },
]

function NavItem({ item, index, active }: { item: Item; index?: number; active: boolean }) {
  const Icon = item.icon
  return (
    <li className="shrink-0">
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex h-10 items-center gap-2.5 rounded-sm border px-3 text-[15px] whitespace-nowrap transition-colors duration-150 lg:h-11 lg:border-transparent',
          active
            ? 'border-ink bg-card font-semibold text-ink lg:border-l-ink lg:bg-transparent lg:shadow-[inset_2px_0_0_var(--ink)]'
            : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink lg:hover:border-transparent lg:hover:bg-paper-2'
        )}
      >
        {index !== undefined && (
          <span
            className={cn(
              'hidden font-mono text-[11px] tabular-nums lg:inline',
              active ? 'text-ink' : 'text-muted'
            )}
          >
            {String(index).padStart(2, '0')}
          </span>
        )}
        <Icon
          size={16}
          strokeWidth={1.75}
          className={cn('shrink-0 lg:hidden', active ? 'text-ink' : 'text-muted')}
          aria-hidden="true"
        />
        <span className={cn(active && 'mark')}>{item.label}</span>
        {item.count ? (
          <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-xs bg-js px-1.5 font-mono text-[11px] leading-none font-bold text-js-ink tabular-nums">
            {item.count > 99 ? '99+' : item.count}
            <span className="sr-only">{item.countLabel ?? ' non lues'}</span>
          </span>
        ) : null}
      </Link>
    </li>
  )
}

/**
 * Section navigation of the signed-in workspace: a vertical index on
 * desktop, a horizontally scrollable strip on small screens.
 */
export function WorkspaceNav({ variant }: { variant: WorkspaceVariant }) {
  const { url, props } = usePage()
  const user = props.user
  const path = url.split('?')[0].replace(/\/$/, '') || '/'
  const unread = props.unreadNotifications ?? 0
  // Moderation queue size, on the back-office pages that provide it.
  const queue = (props as { reportQueueCount?: unknown }).reportQueueCount
  const items =
    variant === 'admin'
      ? ADMIN_ITEMS.map((item) =>
          item.href === '/admin/signalements' && typeof queue === 'number'
            ? { ...item, count: queue }
            : item
        )
      : MEMBER_ITEMS.map((item) =>
          item.href === '/notifications' ? { ...item, count: unread } : item
        )

  return (
    <div className="lg:sticky lg:top-24 lg:py-12">
      {user && (
        <div className="hidden border-b border-line pb-6 lg:block">
          <Link href={`/@${user.username}`} className="group flex items-center gap-3">
            <Avatar user={user} size="md" />
            <span className="min-w-0">
              <span className="block truncate text-[15px] leading-tight font-semibold group-hover:underline">
                {user.displayName}
              </span>
              <span className="mt-0.5 flex min-w-0 items-center gap-1 font-mono text-[12px] text-muted group-hover:text-ink">
                <span className="truncate">@{user.username}</span>
                <ArrowUpRight size={12} className="shrink-0" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </div>
      )}

      <nav
        aria-label={variant === 'admin' ? 'Administration' : 'Espace membre'}
        className="lg:pt-6"
      >
        <p className="label mb-3 hidden lg:block">
          {variant === 'admin' ? 'Administration' : 'Espace membre'}
        </p>
        <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:py-0">
          {items.map((item, i) => (
            <NavItem key={item.href} item={item} index={i + 1} active={path === item.href} />
          ))}
          {variant === 'member' && user?.isModerator && (
            <>
              <li className="hidden lg:mt-6 lg:mb-3 lg:block" aria-hidden="true">
                <span className="label">Équipe</span>
              </li>
              <NavItem
                item={{ href: '/admin', label: 'Administration', icon: Shield }}
                active={false}
              />
            </>
          )}
          {variant === 'admin' && (
            <>
              <li className="hidden lg:mt-6 lg:mb-3 lg:block" aria-hidden="true">
                <span className="label">Mon espace</span>
              </li>
              <NavItem
                item={{ href: '/dashboard', label: 'Tableau de bord', icon: ArrowLeft }}
                active={false}
              />
            </>
          )}
        </ul>
      </nav>
    </div>
  )
}
