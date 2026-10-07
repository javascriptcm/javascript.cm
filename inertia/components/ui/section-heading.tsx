import { Link } from '@inertiajs/react'
import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

/**
 * Editorial section heading: "[01] — Label" index in mono, then a title.
 */
export function SectionHeading({
  index,
  label,
  title,
  description,
  action,
  className,
}: {
  index?: string
  label: string
  title?: ReactNode
  description?: ReactNode
  action?: { href: string; label: string }
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 border-t border-ink pt-5 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="max-w-3xl">
        <p className="label text-ink">
          {index && <span className="mr-2 text-muted">[{index}]</span>}
          {label}
        </p>
        {title && (
          <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            {title}
          </h2>
        )}
        {description && <p className="mt-4 max-w-xl text-[17px] text-ink-2">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 font-mono text-[13px] font-medium uppercase tracking-[0.06em] text-ink"
        >
          <span className="link-draw">{action.label}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}
    </div>
  )
}
