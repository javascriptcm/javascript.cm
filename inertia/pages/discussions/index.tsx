import { Link, router } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { ButtonLink } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { DiscussionList } from '~/components/discussions/discussion-list'
import { TagIndex } from '~/components/discussions/tag-index'
import { SearchBox } from '~/components/forum/search-box'
import { withQuery } from '~/components/forum/url'
import { cn, formatNumber, plural } from '~/lib/format'

type Sort = 'recentes' | 'populaires' | 'sans-reponse'

type Props = {
  discussions: { data: Data.Discussion.Variants['forList'][]; metadata: PaginationMeta }
  tags: Data.Tag[]
  filters: { tag: string | null; sort: Sort; q: string }
  stats: { discussions: number; repliesThisMonth: number; voices: number }
}

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recentes', label: 'Récentes' },
  { value: 'populaires', label: 'Populaires' },
  { value: 'sans-reponse', label: 'Sans réponse' },
]

export default function DiscussionsIndex({ discussions, tags, filters, stats }: Props) {
  const tag = tags.find((t) => t.slug === filters.tag) ?? null

  const url = (overrides: Partial<Props['filters']>) => {
    const next = { ...filters, ...overrides }
    return withQuery('/discussions', {
      tag: next.tag,
      sort: next.sort === 'recentes' ? null : next.sort,
      q: next.q,
    })
  }

  const startHref = tag ? `/discussions/nouvelle?tag=${tag.slug}` : '/discussions/nouvelle'

  const empty = (() => {
    if (filters.q) {
      return {
        code: 'DSC-Q',
        title: `Rien pour « ${filters.q} ».`,
        description:
          'Personne n’en a encore parlé. C’est peut-être le moment de lancer la conversation.',
        action: (
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={url({ q: '' })} variant="secondary" preserveScroll>
              Effacer la recherche
            </ButtonLink>
            <ButtonLink href={startHref}>Lancer une discussion</ButtonLink>
          </div>
        ),
      }
    }
    if (filters.sort === 'sans-reponse') {
      return {
        code: 'DSC-0',
        title: 'Chaque discussion a reçu au moins une réponse.',
        description: 'La communauté est à l’écoute. Revenez plus tard, ou lancez un nouveau sujet.',
        action: null,
      }
    }
    return {
      code: 'DSC',
      title: tag ? `Personne n’a encore parlé de #${tag.name}.` : 'Aucune discussion ouverte.',
      description: 'Un retour d’expérience, une annonce, un débat : ouvrez le premier sujet.',
      action: <ButtonLink href={startHref}>Lancer une discussion</ButtonLink>,
    }
  })()

  const readings = [
    { label: 'Discussions', value: formatNumber(stats.discussions) },
    { label: 'Réponses · 30 jours', value: formatNumber(stats.repliesThisMonth) },
    { label: 'Voix différentes', value: formatNumber(stats.voices) },
  ]

  return (
    <>
      <Seo
        title={tag ? `#${tag.name} — Discussions` : 'Discussions'}
        description={
          tag?.description ??
          'Les discussions de JavaScript Cameroun : carrière, outils, événements, freelance et écosystème local. Des avis, des retours d’expérience, des débats.'
        }
        path={tag ? `/discussions?tag=${tag.slug}` : '/discussions'}
        noindex={Boolean(filters.q || filters.sort !== 'recentes')}
      />

      <PageHeader
        kicker={
          <>
            <span className="mr-2 text-muted">[DSC]</span>Discussions · la place du village
          </>
        }
        title={
          <>
            On en <span className="mark">parle</span>.
          </>
        }
        lead="Carrière, outils, événements, freelance, écosystème local : ici, pas de bonne réponse à accepter. Des avis, des retours d’expérience, des débats — entre développeurs du 237."
        actions={
          <ButtonLink href={startHref} size="lg">
            Lancer une discussion
          </ButtonLink>
        }
      >
        <dl className="mt-10 grid grid-cols-3 border-t border-line">
          {readings.map((reading, i) => (
            <div
              key={reading.label}
              className={cn('pt-4', i > 0 && 'border-l border-line pl-4 sm:pl-6')}
            >
              <dt className="label text-[10.5px] sm:text-[11.5px]">{reading.label}</dt>
              <dd className="mt-1 text-[clamp(1.5rem,3.4vw,2.4rem)] leading-none font-bold tracking-[-0.04em] tabular-nums">
                {reading.value}
              </dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="shell grid gap-8 pt-8 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <section aria-labelledby="discussions-selection" className="min-w-0 lg:col-span-8">
          <h2 id="discussions-selection" className="sr-only">
            {tag ? `Discussions sur #${tag.name}` : 'Toutes les discussions'}
          </h2>

          <div className="lg:hidden">
            <TagIndex tags={tags} active={filters.tag} hrefFor={(slug) => url({ tag: slug })} />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-b border-ink pb-4 md:flex-row md:items-center md:justify-between lg:mt-0">
            <nav aria-label="Trier les discussions">
              <ul className="flex flex-wrap gap-1.5">
                {SORTS.map((sort) => {
                  const current = sort.value === filters.sort
                  return (
                    <li key={sort.value}>
                      <Link
                        href={url({ sort: sort.value })}
                        preserveScroll
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          'inline-flex h-9 items-center rounded-sm border px-3 text-[14px] font-medium transition-colors duration-150',
                          current
                            ? 'border-ink bg-ink text-paper'
                            : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                        )}
                      >
                        {sort.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <SearchBox
              id="discussions-search"
              label="Rechercher une discussion"
              placeholder="Rechercher une discussion…"
              value={filters.q}
              onSearch={(term) => router.visit(url({ q: term }), { preserveScroll: true })}
              className="md:w-72"
            />
          </div>

          {(tag || filters.q) && discussions.data.length > 0 && (
            <p className="label mt-4">
              {plural(discussions.metadata.total, 'discussion')}
              {tag && (
                <>
                  {' '}
                  sur <span className="text-ink">#{tag.name}</span>
                </>
              )}
              {filters.q && (
                <>
                  {' '}
                  pour <span className="text-ink">« {filters.q} »</span>
                </>
              )}{' '}
              ·{' '}
              <Link
                href={url({ tag: null, q: '' })}
                preserveScroll
                className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink"
              >
                tout afficher
              </Link>
            </p>
          )}

          <div className="mt-2">
            {discussions.data.length ? (
              <DiscussionList
                discussions={discussions.data}
                showExcerpt
                highlight={filters.q}
                activeTag={filters.tag}
              />
            ) : (
              <EmptyState
                className="mt-5"
                code={empty.code}
                title={empty.title}
                description={empty.description}
                action={empty.action}
              />
            )}
          </div>

          <Pagination meta={discussions.metadata} className="mt-6" />
        </section>

        <aside className="hidden lg:col-span-4 lg:block">
          <div className="flex flex-col gap-10 lg:sticky lg:top-24">
            <TagIndex tags={tags} active={filters.tag} hrefFor={(slug) => url({ tag: slug })} />
            <div className="rounded-sm border border-dashed border-line-2 px-5 py-5">
              <p className="label text-ink">Bloqué sur un bug ?</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                Les discussions sont faites pour échanger des points de vue. Pour une erreur
                précise, le forum d’entraide vous trouvera une solution.
              </p>
              <Link
                href="/forum/nouveau"
                className="mt-4 inline-flex items-center gap-2 font-mono text-[12.5px] font-medium tracking-[0.06em] text-ink uppercase"
              >
                <span className="link-draw">Poser une question</span>{' '}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
