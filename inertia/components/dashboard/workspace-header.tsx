import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

/**
 * Page heading inside the workspace layout (the layout already provides
 * the container, so this is lighter than PageHeader).
 */
export function WorkspaceHeader({
  kicker,
  title,
  lead,
  actions,
  className,
}: {
  kicker?: ReactNode
  title: ReactNode
  lead?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('border-b border-line pb-8', className)}>
      {kicker && <p className="label text-ink-2">{kicker}</p>}
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl min-w-0">
          <h1 className="text-[clamp(2.3rem,5.2vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em]">
            {title}
          </h1>
          {lead && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">{lead}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  )
}

/**
 * Small section title used inside workspace pages: "[01] Label" + optional link.
 */
export function WorkspaceSectionTitle({
  index,
  title,
  id,
  action,
}: {
  index?: string
  title: string
  id?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-ink pb-3">
      <h2 id={id} className="text-[21px] leading-tight font-semibold tracking-[-0.02em]">
        {index && (
          <span className="mr-2 align-[0.15em] font-mono text-[12px] font-medium text-muted">
            [{index}]
          </span>
        )}
        {title}
      </h2>
      {action}
    </div>
  )
}
