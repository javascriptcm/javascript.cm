import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

/**
 * A settings block: title and explanation on the left, fields on the right.
 */
export function FormSection({
  index,
  title,
  description,
  children,
  className,
}: {
  index: string
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'grid gap-6 border-t border-line py-9 first:border-t-0 md:grid-cols-12 md:gap-8',
        className
      )}
    >
      <div className="md:col-span-4">
        <p className="label">[{index}]</p>
        <h2 className="mt-2 text-[21px] leading-tight font-semibold tracking-[-0.02em]">{title}</h2>
        {description && (
          <p className="mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      <div className="grid min-w-0 content-start gap-5 md:col-span-8">{children}</div>
    </section>
  )
}
