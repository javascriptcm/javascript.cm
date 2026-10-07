import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { Hash } from 'lucide-react'
import type { Data } from '@generated/data'
import SlideOver from '~/components/slide-over'
import { cn } from '~/lib/format'

type Props = {
  tags: Data.Tag[]
  active: string | null
  hrefFor: (slug: string | null) => string
  onNavigate?: () => void
}

function TagCloud({ tags, active, hrefFor, onNavigate }: Props) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      <li>
        <Link
          href={hrefFor(null)}
          preserveScroll
          onClick={onNavigate}
          aria-current={active === null ? 'page' : undefined}
          className={cn(
            'inline-flex h-8 items-center rounded-sm border px-2.5 text-[13.5px] font-medium transition-colors duration-150',
            active === null
              ? 'border-ink bg-ink text-paper'
              : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
          )}
        >
          Tous les sujets
        </Link>
      </li>
      {tags.map((tag) => {
        const current = tag.slug === active
        const empty = tag.discussionsCount === 0
        return (
          <li key={tag.id}>
            <Link
              href={hrefFor(tag.slug)}
              preserveScroll
              onClick={onNavigate}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[12.5px] font-medium transition-colors duration-150',
                current
                  ? 'border-ink bg-js text-js-ink'
                  : empty
                    ? 'border-line border-dashed text-muted hover:border-ink hover:text-ink'
                    : 'border-line-2 text-ink-2 hover:border-ink hover:bg-js hover:text-js-ink'
              )}
            >
              <span>
                <span aria-hidden="true" className="opacity-50">
                  #
                </span>
                {tag.name}
              </span>
              <span className={cn('tabular-nums', current ? 'text-js-ink' : 'opacity-60')}>
                {tag.discussionsCount}
                <span className="sr-only"> discussion{tag.discussionsCount > 1 ? 's' : ''}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Tag index of the discussions: a cloud of chips with counts (desktop aside),
 * a slide-over on mobile.
 */
export function TagIndex(props: Props) {
  const [open, setOpen] = useState(false)
  const current = props.tags.find((t) => t.slug === props.active)

  return (
    <>
      <nav aria-label="Sujets des discussions" className="hidden lg:block">
        <p className="label mb-4 flex items-baseline justify-between border-t border-ink pt-4 text-ink">
          <span>
            <span className="mr-2 text-muted">[—]</span>Sujets
          </span>
          <span className="text-muted">{props.tags.length}</span>
        </p>
        <TagCloud {...props} />
      </nav>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex h-11 w-full items-center justify-between gap-3 rounded-sm border border-line-2 bg-card px-3.5 text-left text-[15px] transition-colors hover:border-ink focus-visible:border-ink"
        >
          <span className="min-w-0 truncate">
            <span className="label mr-2">Sujet</span>
            <span className="font-medium">{current ? `#${current.name}` : 'Tous les sujets'}</span>
          </span>
          <Hash size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-muted" />
        </button>
        <SlideOver open={open} onClose={() => setOpen(false)} title="Sujets des discussions">
          <nav aria-label="Sujets des discussions">
            <TagCloud {...props} onNavigate={() => setOpen(false)} />
          </nav>
        </SlideOver>
      </div>
    </>
  )
}
