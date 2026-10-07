import { useEffect, useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import {
  LayoutDashboard,
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

export const NAV = [
  { href: '/articles', label: 'Articles', code: 'ART' },
  { href: '/forum', label: 'Forum', code: 'FRM' },
  { href: '/discussions', label: 'Discussions', code: 'DSC' },
  { href: '/membres', label: 'Membres', code: 'MBR' },
]

function isActive(url: string, href: string) {
  const path = url.split('?')[0]
  return path === href || path.startsWith(`${href}/`)
}

export default function Navbar() {
  const { url, props } = usePage()
  const user = props.user
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
          <div className="flex items-center gap-10">
            <Logo />
            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = isActive(url, item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative inline-flex h-10 items-center px-3 text-[15.5px] font-medium transition-colors',
                          active ? 'text-ink' : 'text-ink-2 hover:text-ink'
                        )}
                      >
                        <span className={cn(active && 'mark')}>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setWriteOpen(true)}
                  className={buttonClasses({
                    variant: 'primary',
                    size: 'sm',
                    className: 'ml-1 hidden sm:inline-flex',
                  })}
                >
                  <PenLine size={15} strokeWidth={2} /> Écrire
                </button>
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
