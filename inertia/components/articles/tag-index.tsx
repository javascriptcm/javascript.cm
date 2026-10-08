import { Link } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { cn, formatNumber } from '~/lib/format'

/**
 * Book-style index of topics: "#react ········ 12", linking to ?tag=.
 */
export function TagIndex({
  tags,
  activeSlug,
  hrefFor,
  id = 'tag-index',
  className,
}: {
  tags: Data.Tag[]
  activeSlug: string | null
  hrefFor: (slug: string | null) => string
  /** Unique prefix when the index is rendered twice (aside + mobile panel). */
  id?: string
  className?: string
}) {
  return (
    <nav aria-labelledby={`${id}-title`} className={className}>
      <h2 id={`${id}-title`} className="label border-t border-ink pt-5 text-ink">
        <span className="mr-2 text-muted">[#]</span>Index des sujets
      </h2>
      {tags.length ? (
        <ul className="mt-4">
          <li>
            <Link
              href={hrefFor(null)}
              aria-current={activeSlug === null ? 'page' : undefined}
              className="group flex items-baseline gap-3 py-2.5 text-[15px] font-medium text-ink-2 hover:text-ink"
            >
              <span className={cn('link-draw', activeSlug === null && 'mark text-ink')}>
                Tous les sujets
              </span>
            </Link>
          </li>
          {tags.map((tag) => {
            const active = activeSlug === tag.slug
            return (
              <li key={tag.id} className="border-t border-line">
                <Link
                  href={hrefFor(active ? null : tag.slug)}
                  aria-current={active ? 'page' : undefined}
                  className="group flex items-baseline gap-3 py-2.5 text-ink-2 transition-colors hover:text-ink"
                >
                  <span
                    className={cn('font-mono text-[13.5px] font-medium', active && 'mark text-ink')}
                  >
                    <span className="opacity-50">#</span>
                    {tag.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 translate-y-[-3px] border-b border-dotted border-line-2 transition-colors group-hover:border-ink"
                  />
                  <span className="font-mono text-[12.5px] text-muted tabular-nums group-hover:text-ink">
                    {formatNumber(tag.articlesCount)}
                    <span className="sr-only"> article{tag.articlesCount > 1 ? 's' : ''}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-4 text-[14.5px] text-muted">
          Les sujets apparaîtront avec les premiers articles publiés.
        </p>
      )}
    </nav>
  )
}

/**
 * Call-out inviting members to write.
 */
export function WriteCallout({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="write-callout-title"
      className={cn('rounded-sm border border-ink bg-card p-6', className)}
    >
      <p className="label text-ink">Écrire pour la communauté</p>
      <h2
        id="write-callout-title"
        className="mt-3 text-[23px] leading-[1.1] font-bold tracking-[-0.03em]"
      >
        Vous avez résolu un problème ? <span className="mark">Racontez-le.</span>
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
        Un tutoriel, un retour d’expérience, une astuce de prod : ce que vous avez appris fera
        gagner des heures à quelqu’un, à Douala, à Yaoundé ou ailleurs.
      </p>
      <Link
        href="/articles/nouveau"
        className="group mt-5 inline-flex items-center gap-2 font-mono text-[13px] font-medium tracking-[0.06em] text-ink uppercase"
      >
        <span className="link-draw">Écrire un article</span>
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </section>
  )
}
