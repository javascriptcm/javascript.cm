import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

/**
 * Top of an index/form page: mono kicker, big title, optional lead + actions.
 */
export function PageHeader({
  kicker,
  title,
  lead,
  actions,
  children,
  className,
}: {
  kicker?: ReactNode
  title: ReactNode
  lead?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('border-b border-line pt-10 pb-8 sm:pt-14 sm:pb-10', className)}>
      <div className="shell">
        {kicker && <p className="label text-ink-2">{kicker}</p>}
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-[clamp(2.4rem,6vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              {title}
            </h1>
            {lead && (
              <p className="mt-5 max-w-2xl text-[17.5px] leading-relaxed text-ink-2">{lead}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </header>
  )
}
