import { useEffect, useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Search,
  LogOut,
  Menu as MenuIcon,
  PenLine,
  Settings,
  Shield,
  UserRound,
  X,
} from 'lucide-react'
import Logo from '~/components/logo'
import CreateContentModal from '~/components/create-content-modal'
import ThemeToggle from '~/components/theme-toggle'
import { Avatar } from '~/components/ui/avatar'
import { ButtonLink, buttonClasses } from '~/components/ui/button'
import { Menu, MenuDivider, MenuHeader, MenuLink } from '~/components/ui/menu'
import { cn } from '~/lib/format'

export const NAV: { href: string; label: string; code: string; secondary?: boolean }[] = [
  { href: '/articles', label: 'Articles', code: 'ART' },
  { href: '/forum', label: 'Forum', code: 'FRM' },
  { href: '/discussions', label: 'Discussions', code: 'DSC' },
  { href: '/emplois', label: 'Emplois', code: 'JOB' },
  // Grouped under "Plus" between lg and xl (not enough room for all).
  { href: '/evenements', label: 'Événements', code: 'EVT', secondary: true },
  { href: '/apprendre', label: 'Apprendre', code: 'LRN', secondary: true },
  { href: '/membres', label: 'Membres', code: 'MBR', secondary: true },
]

function isActive(url: string, href: string) {
  const path = url.split('?')[0]
  return path === href || path.startsWith(`${href}/`)
}

export default function Navbar() {
  const { url, props } = usePage()
  const user = props.user
  const unread = props.unreadNotifications ?? 0
  const [open, setOpen] = useState(false)
  const [writeOpen, setWriteOpen] = useState(false)

  useEffect(() => router.on('navigate', () => setOpen(false)), [])
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-saturate-150 supports-backdrop-filter:bg-paper/85 supports-backdrop-filter:backdrop-blur-md">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-js focus:px-3 focus:py-2 focus:text-js-ink"
        >
          Aller au contenu
        </a>
        <div className="shell flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-6 xl:gap-8">
            <Logo />
            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = isActive(url, item.href)
                  return (
                    <li key={item.href} className={cn(item.secondary && 'hidden xl:block')}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative inline-flex h-10 items-center px-2.5 text-[15.5px] font-medium transition-colors',
                          active ? 'text-ink' : 'text-ink-2 hover:text-ink'
                        )}
                      >
                        <span className={cn(active && 'mark')}>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
                <li className="xl:hidden">
                  <Menu
                    anchor="bottom start"
                    buttonLabel="Plus de rubriques"
                    buttonClassName={cn(
                      'inline-flex h-10 items-center gap-1 px-2.5 text-[15.5px] font-medium transition-colors',
                      NAV.some((item) => item.secondary && isActive(url, item.href))
                        ? 'text-ink'
                        : 'text-ink-2 hover:text-ink'
                    )}
                    button={
                      <>
                        Plus <ChevronDown size={15} strokeWidth={2} />
                      </>
                    }
                  >
                    {NAV.filter((item) => item.secondary).map((item) => (
                      <MenuLink key={item.href} href={item.href}>
                        {item.label}
                      </MenuLink>
                    ))}
                  </Menu>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/recherche"
              aria-label="Rechercher"
              title="Rechercher"
              className={cn(
                'grid size-10 place-items-center rounded-sm border border-transparent text-ink-2 transition-colors hover:border-line-2 hover:text-ink',
                isActive(url, '/recherche') && 'border-line-2 text-ink'
              )}
            >
              <Search size={18} strokeWidth={1.75} />
            </Link>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {user && (
              <Link
                href="/notifications"
                aria-label={unread ? `Notifications (${unread} non lues)` : 'Notifications'}
                title="Notifications"
                className="relative grid size-10 place-items-center rounded-sm border border-transparent text-ink-2 transition-colors hover:border-line-2 hover:text-ink"
              >
                <Bell size={18} strokeWidth={1.75} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-xs bg-js px-1 font-mono text-[10px] leading-none font-bold text-js-ink">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <>
                {/* Wrapper controls visibility: "hidden" on the button itself would
                    compete with the button's own "inline-flex". */}
                <div className="ml-1 hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setWriteOpen(true)}
                    className={buttonClasses({ variant: 'primary', size: 'sm' })}
                  >
                    <PenLine size={15} strokeWidth={2} /> Écrire
                  </button>
                </div>
                <Menu
                  buttonLabel="Menu du compte"
                  buttonClassName="ml-1.5 rounded-sm transition-transform hover:-translate-y-0.5"
                  button={<Avatar user={user} size="sm" />}
                >
                  <MenuHeader>
                    <p className="text-[15px] font-semibold leading-tight">{user.displayName}</p>
                    <p className="label mt-1 normal-case tracking-normal">@{user.username}</p>
                  </MenuHeader>
                  <MenuDivider />
                  <MenuLink href={`/@${user.username}`} icon={<UserRound size={16} />}>
                    Mon profil
                  </MenuLink>
                  <MenuLink href="/dashboard" icon={<LayoutDashboard size={16} />}>
                    Tableau de bord
                  </MenuLink>
                  <MenuLink href="/settings" icon={<Settings size={16} />}>
                    Paramètres
                  </MenuLink>
                  {user.isModerator && (
                    <MenuLink href="/admin" icon={<Shield size={16} />}>
                      Administration
                    </MenuLink>
                  )}
                  <MenuDivider />
                  <MenuLink href="/logout" method="post" icon={<LogOut size={16} />}>
                    Se déconnecter
                  </MenuLink>
                </Menu>
              </>
            ) : (
              <div className="hidden items-center gap-1.5 sm:flex">
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Se connecter
                </ButtonLink>
                <ButtonLink href="/register" variant="primary" size="sm">
                  Rejoindre
                </ButtonLink>
              </div>
            )}
            <button
              type="button"
              className="grid size-10 place-items-center rounded-sm text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </header>
      <CreateContentModal isOpen={writeOpen} onClose={() => setWriteOpen(false)} />

      {/* Mobile: the navigation becomes a full-screen typographic moment. */}
      <div
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-ink bg-paper lg:hidden"
      >
        <nav
          aria-label="Navigation mobile"
          className="shell flex min-h-full flex-col justify-between py-8"
        >
          <ul className="flex flex-col">
            {NAV.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  className="flex items-baseline justify-between py-4 text-[clamp(2.5rem,12vw,4rem)] leading-none font-bold tracking-[-0.045em]"
                >
                  <span className={cn(isActive(url, item.href) && 'mark')}>{item.label}</span>
                  <span className="label">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-2">
            <div className="mb-4 flex items-center justify-between border-y border-line py-3">
              <span className="label">Thème</span>
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <ButtonLink href="/articles/nouveau" size="lg" block>
                  Écrire un article
                </ButtonLink>
                <ButtonLink href="/forum/nouveau" variant="secondary" size="lg" block>
                  Poser une question
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/register" size="lg" block>
                  Rejoindre la communauté
                </ButtonLink>
                <ButtonLink href="/login" variant="secondary" size="lg" block>
                  Se connecter
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
