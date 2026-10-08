import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { SlidersHorizontal } from 'lucide-react'
import type { Data } from '@generated/data'
import SlideOver from '~/components/slide-over'
import { cn, formatNumber } from '~/lib/format'
import { withQuery } from '~/components/forum/url'

type Props = {
  channels: Data.Channel[]
  active: string | null
  allCount: number
  /** Builds the URL of a channel (null = every channel), keeping the other filters. */
  hrefFor: (slug: string | null) => string
  onNavigate?: () => void
}

function ChannelLinks({ channels, active, allCount, hrefFor, onNavigate }: Props) {
  const rows = [
    { slug: null, name: 'Tous les canaux', count: allCount, index: '00' },
    ...channels.map((channel, i) => ({
      slug: channel.slug,
      name: channel.name,
      count: channel.threadsCount,
      index: String(i + 1).padStart(2, '0'),
    })),
  ]

  return (
    <ul className="border-t border-ink">
      {rows.map((row) => {
        const current = row.slug === active
        return (
          <li key={row.slug ?? 'all'} className="border-b border-line">
            <Link
              href={hrefFor(row.slug)}
              preserveScroll
              onClick={onNavigate}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'group flex items-baseline gap-3 px-2 py-2.5 text-[15px] transition-colors duration-150 focus-visible:outline-offset-0',
                current
                  ? 'bg-js font-semibold text-js-ink'
                  : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
              )}
            >
              <span
                className={cn(
                  'font-mono text-[11px] tabular-nums',
                  current ? 'text-js-ink' : 'text-muted'
                )}
              >
                {row.index}
              </span>
              <span className="min-w-0 flex-1 truncate">{row.name}</span>
              <span
                className={cn(
                  'font-mono text-[12.5px] tabular-nums',
                  current ? 'text-js-ink' : 'text-muted group-hover:text-ink'
                )}
              >
                {formatNumber(row.count)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Channel index of the forum: a ruled list on desktop, a slide-over on mobile.
 */
export function ChannelNav(props: Props) {
  const [open, setOpen] = useState(false)
  const current = props.channels.find((c) => c.slug === props.active)

  return (
    <>
      <nav aria-label="Canaux du forum" className="hidden lg:block">
        <p className="label mb-3 text-ink">
          <span className="mr-2 text-muted">[—]</span>Canaux
        </p>
        <ChannelLinks {...props} />
        <p className="mt-5 text-[13.5px] leading-relaxed text-muted">
          Un sujet qui n’entre dans aucune case ?{' '}
          <Link
            href={withQuery('/discussions', {})}
            className="text-ink-2 underline decoration-line-2 underline-offset-4 hover:decoration-ink"
          >
            Ouvrez plutôt une discussion
          </Link>
          .
        </p>
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex h-11 w-full items-center justify-between gap-3 rounded-sm border border-line-2 bg-card px-3.5 text-left text-[15px] transition-colors hover:border-ink focus-visible:border-ink"
        >
          <span className="min-w-0 truncate">
            <span className="label mr-2">Canal</span>
            <span className="font-medium">{current?.name ?? 'Tous les canaux'}</span>
          </span>
          <SlidersHorizontal
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="shrink-0 text-muted"
          />
        </button>
        <SlideOver open={open} onClose={() => setOpen(false)} title="Canaux du forum">
          <nav aria-label="Canaux du forum">
            <ChannelLinks {...props} onNavigate={() => setOpen(false)} />
          </nav>
        </SlideOver>
      </div>
    </>
  )
}
