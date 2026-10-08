import type { ReactNode } from 'react'
import { cn, formatNumber } from '~/lib/format'

export type Reading = { label: string; value: number; note?: ReactNode; href?: string }

/**
 * Instrument readout: a row of counters separated by hairlines.
 * Values are set in mono so digits line up from one cell to the next.
 */
export function Readout({ readings, className }: { readings: Reading[]; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 border-t border-l border-line sm:grid-cols-3',
        readings.length >= 6 && 'xl:grid-cols-6',
        readings.length === 5 && 'lg:grid-cols-5',
        readings.length === 4 && 'lg:grid-cols-4',
        className
      )}
    >
      {readings.map((reading, i) => (
        <div
          key={reading.label}
          className="flex flex-col border-r border-b border-line px-4 py-5 sm:px-5"
        >
          <dt className="label min-h-[2.8em]">
            <span className="mr-1.5 text-ink">{String(i + 1).padStart(2, '0')}</span>
            {reading.label}
          </dt>
          <dd className="mt-2 font-mono text-[clamp(1.7rem,3.2vw,2.5rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
            {formatNumber(reading.value)}
          </dd>
          {reading.note && <dd className="mt-2 text-[13.5px] text-muted">{reading.note}</dd>}
        </div>
      ))}
    </dl>
  )
}
