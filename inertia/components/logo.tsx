import { Link } from '@inertiajs/react'
import { cn } from '~/lib/format'

/**
 * The mark: a JS-yellow tile (a nod to the unofficial JS logo) stamped with
 * "237", Cameroon's dialing code. Wordmark: javascript.cm
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-block size-9 shrink-0 rounded-xs bg-js text-js-ink transition-transform duration-300 ease-out-expo',
        className
      )}
    >
      <span className="absolute top-[3px] left-[4px] font-mono text-[8px] leading-none font-semibold">
        237
      </span>
      <span className="absolute right-[3px] bottom-[1px] text-[17px] leading-none font-extrabold tracking-[-0.06em]">
        JS
      </span>
    </span>
  )
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="JavaScript Cameroun — accueil"
    >
      <LogoMark className="group-hover:-rotate-6" />
      <span className="text-[19px] font-bold tracking-[-0.04em]">
        javascript<span className="text-muted">.cm</span>
      </span>
    </Link>
  )
}
