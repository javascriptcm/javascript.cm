import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

/**
 * Empty state drawn like a blank form on the page: dashed frame, mono code.
 */
export function EmptyState({
  code = '000',
  title,
  description,
  action,
  className,
}: {
  code?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-sm border border-dashed border-line-2 px-6 py-10 sm:px-10',
        className
      )}
    >
      <span className="label">∅ {code}</span>
      <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">{title}</h3>
      {description && <p className="max-w-md text-[15.5px] text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
