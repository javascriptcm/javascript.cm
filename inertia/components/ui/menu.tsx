import { Menu as HMenu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import { Link } from '@inertiajs/react'
import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

/**
 * Dropdown menu (Headless UI): keyboard + screen-reader friendly.
 */
export function Menu({
  button,
  buttonClassName,
  buttonLabel,
  anchor = 'bottom end',
  children,
}: {
  button: ReactNode
  buttonClassName?: string
  buttonLabel?: string
  anchor?: 'bottom end' | 'bottom start'
  children: ReactNode
}) {
  return (
    <HMenu>
      <MenuButton className={buttonClassName} aria-label={buttonLabel}>
        {button}
      </MenuButton>
      <MenuItems
        anchor={{ to: anchor, gap: 8 }}
        transition
        className="z-50 min-w-56 origin-top rounded-sm border border-ink bg-card p-1.5 shadow-[4px_4px_0_var(--ink)] transition duration-150 ease-out-expo focus:outline-none data-closed:-translate-y-1 data-closed:opacity-0"
      >
        {children}
      </MenuItems>
    </HMenu>
  )
}

// Base item; the color pair is chosen separately so "danger" never fights
// the default text color.
const itemBase = 'flex w-full items-center gap-3 rounded-xs px-3 py-2.5 text-left text-[15px]'
const itemTone = 'text-ink-2 data-focus:bg-js data-focus:text-js-ink'
const dangerTone = 'text-danger data-focus:bg-danger data-focus:text-paper'
const itemClasses = cn(itemBase, itemTone)

export function MenuLink({
  href,
  icon,
  children,
  method,
}: {
  href: string
  icon?: ReactNode
  children: ReactNode
  method?: 'post'
}) {
  return (
    <MenuItem>
      <Link href={href} method={method} as={method ? 'button' : 'a'} className={itemClasses}>
        {icon && <span className="shrink-0 opacity-70">{icon}</span>}
        {children}
      </Link>
    </MenuItem>
  )
}

export function MenuAction({
  onClick,
  icon,
  children,
  danger,
}: {
  onClick: () => void
  icon?: ReactNode
  children: ReactNode
  danger?: boolean
}) {
  return (
    <MenuItem>
      <button
        type="button"
        onClick={onClick}
        className={cn(itemBase, danger ? dangerTone : itemTone)}
      >
        {icon && <span className="shrink-0 opacity-70">{icon}</span>}
        {children}
      </button>
    </MenuItem>
  )
}

export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className="px-3 pt-2 pb-2.5">{children}</div>
}

export function MenuDivider() {
  return <MenuSeparator className="my-1.5 h-px bg-line" />
}
