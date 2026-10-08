import { cn } from '~/lib/format'

export type Availability = 'open_to_work' | 'freelance' | 'hiring'

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  open_to_work: 'Ouvert·e aux opportunités',
  freelance: 'Disponible en freelance',
  hiring: 'Recrute',
}

/** Short labels for dense places (directory filters). */
export const AVAILABILITY_SHORT_LABELS: Record<Availability, string> = {
  open_to_work: 'Ouvert·e aux opportunités',
  freelance: 'Freelance',
  hiring: 'Recrute',
}

/**
 * Availability stamp: green (ok) for members open to work or freelance,
 * JS-yellow for members who are hiring. Renders nothing when unset.
 */
export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Availability | null | undefined
  className?: string
}) {
  if (!availability) return null
  const hiring = availability === 'hiring'
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-xs border px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase',
        hiring ? 'border-ink bg-js text-js-ink' : 'border-ok text-ok',
        className
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', hiring ? 'bg-js-ink' : 'bg-ok')}
        aria-hidden="true"
      />
      {AVAILABILITY_LABELS[availability]}
    </span>
  )
}
