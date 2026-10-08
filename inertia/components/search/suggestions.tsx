import { Link } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Tag } from '~/components/ui/tag'
import { searchHref } from '~/components/search/url'
import { cn, formatNumber } from '~/lib/format'

/**
 * Example queries, each one teaching a bit of the syntax.
 */
const EXAMPLES: { query: string; hint: string }[] = [
  { query: 'closures', hint: 'les mots de la même famille aussi (closure, closures)' },
  { query: '"mobile money"', hint: 'l’expression exacte, entre guillemets' },
  { query: 'cors -next', hint: 'CORS, mais pas dans un contexte Next.js' },
  { query: 'vite OR webpack', hint: 'l’un ou l’autre' },
  { query: 'Cannot read properties', hint: 'collez directement le message d’erreur' },
  { query: 'freelance', hint: 'les discussions de la communauté' },
]

export function ExampleQueries({ className }: { className?: string }) {
  return (
    <section aria-labelledby="search-examples" className={className}>
      <h2 id="search-examples" className="label border-t border-ink pt-5 text-ink">
        <span className="mr-2 text-muted">[EX]</span>Exemples de recherches
      </h2>
      <ol className="mt-3">
        {EXAMPLES.map((example, i) => (
          <li key={example.query} className="border-t border-line first:border-t-0">
            <Link
              href={searchHref({ q: example.query })}
              preserveState
              className="group grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 py-3.5 sm:grid-cols-[auto_auto_minmax(0,1fr)]"
            >
              <span className="label tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[15px] font-medium text-ink">
                <span className="link-draw group-hover:bg-js group-hover:text-js-ink">
                  {example.query}
                </span>
              </span>
              <span className="col-start-2 text-[14.5px] text-muted sm:col-start-auto">
                {example.hint}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function PopularTags({
  tags,
  className,
  title = 'Sujets populaires',
}: {
  tags: Data.Tag[]
  className?: string
  title?: string
}) {
  if (!tags.length) return null
  return (
    <section aria-labelledby="search-tags" className={className}>
      <h2 id="search-tags" className="label border-t border-ink pt-5 text-ink">
        <span className="mr-2 text-muted">[#]</span>
        {title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag.id}>
            <Tag name={tag.name} href={`/articles?tag=${tag.slug}`} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ForumChannels({
  channels,
  className,
}: {
  channels: Data.Channel[]
  className?: string
}) {
  if (!channels.length) return null
  return (
    <nav aria-labelledby="search-channels" className={className}>
      <h2 id="search-channels" className="label border-t border-ink pt-5 text-ink">
        <span className="mr-2 text-muted">[FRM]</span>Canaux du forum
      </h2>
      <ul className="mt-3">
        {channels.map((channel) => (
          <li key={channel.id} className="border-t border-line first:border-t-0">
            <Link
              href={`/forum?channel=${channel.slug}`}
              className="group flex items-baseline gap-3 py-2.5 text-[15px] text-ink-2 transition-colors hover:text-ink"
            >
              <span className="link-draw">{channel.name}</span>
              <span
                aria-hidden="true"
                className="h-px flex-1 -translate-y-0.75 border-b border-dotted border-line-2 transition-colors group-hover:border-ink"
              />
              <span className="font-mono text-[12.5px] text-muted tabular-nums group-hover:text-ink">
                {formatNumber(channel.threadsCount)}
                <span className="sr-only"> question{channel.threadsCount > 1 ? 's' : ''}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Aside: the syntax cheat sheet.
 */
export function SyntaxHelp({ className }: { className?: string }) {
  const rows: { code: string; text: string }[] = [
    { code: 'hook react', text: 'tous les mots, dans n’importe quel ordre' },
    { code: '"use client"', text: 'l’expression exacte' },
    { code: 'expo -eas', text: 'exclure un mot' },
    { code: 'vue OR svelte', text: 'l’un ou l’autre' },
  ]
  return (
    <section aria-labelledby="search-syntax" className={cn(className)}>
      <h2 id="search-syntax" className="label border-t border-ink pt-5 text-ink">
        <span className="mr-2 text-muted">[?]</span>Chercher comme un pro
      </h2>
      <dl className="mt-3">
        {rows.map((row) => (
          <div key={row.code} className="border-t border-line py-3 first:border-t-0">
            <dt className="font-mono text-[13.5px] font-medium text-ink">{row.code}</dt>
            <dd className="mt-0.5 text-[14.5px] text-muted">{row.text}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        Le pluriel et la conjugaison ne comptent pas&nbsp;: «&nbsp;tester&nbsp;» trouve aussi
        «&nbsp;tests&nbsp;» et «&nbsp;testé&nbsp;». Les accents non plus&nbsp;:
        «&nbsp;evenement&nbsp;» trouve «&nbsp;événement&nbsp;».
      </p>
    </section>
  )
}
