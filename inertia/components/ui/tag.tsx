import { Link } from '@inertiajs/react'
import { cn } from '~/lib/format'

/**
 * Mono hashtag chip. Pass `href` to make it a link.
 */
export function Tag({
  name,
  href,
  active = false,
  className,
}: {
  name: string
  href?: string
  active?: boolean
  className?: string
}) {
  const classes = cn(
    'inline-flex h-7 items-center rounded-sm border px-2 font-mono text-[12px] font-medium transition-colors duration-150',
    active
      ? 'border-ink bg-js text-js-ink'
      : 'border-line-2 text-ink-2 hover:border-ink hover:bg-js hover:text-js-ink',
    className
  )
  const label = (
    <>
      <span className="opacity-50">#</span>
      {name}
    </>
  )
  return href ? (
    <Link href={href} className={classes}>
      {label}
    </Link>
  ) : (
    <span className={classes}>{label}</span>
  )
}
