import { formatDate, timeAgo } from '~/lib/format'

/**
 * Relative date ("il y a 3 heures") with the full date as tooltip.
 * Server and client clocks differ slightly, hence suppressHydrationWarning.
 */
export function TimeAgo({ date, className }: { date: string | null | undefined; className?: string }) {
  if (!date) return null
  return (
    <time dateTime={date} title={formatDate(date)} className={className} suppressHydrationWarning>
      {timeAgo(date)}
    </time>
  )
}
