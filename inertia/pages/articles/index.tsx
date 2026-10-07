import { useEffect, useState, type FormEvent } from 'react'
import { Link, router } from '@inertiajs/react'
import { PenLine, Search, SlidersHorizontal, X } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import SlideOver from '~/components/slide-over'
import { PageHeader } from '~/components/ui/page-header'
import { ButtonLink } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { ArticleFeature, ArticleList } from '~/components/articles/list'
import { TagIndex, WriteCallout } from '~/components/articles/tag-index'
import { cn, plural } from '~/lib/format'

type Sort = 'recents' | 'populaires'

type Filters = { q: string; sort: Sort; tag: string | null }

type Props = {
  articles: { data: Data.Article[]; metadata: PaginationMeta }
  featured: Data.Article | null
  total: number
  tags: Data.Tag[]
  activeTag: Data.Tag | null
  filters: Filters
}

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recents', label: 'Récents' },
  { value: 'populaires', label: 'Populaires' },
]

/**
 * Build an /articles URL from filters, leaving defaults out (page resets).
 */
function articlesHref(filters: Partial<Filters>) {
  const params = new URLSearchParams()
  if (filters.tag) params.set('tag', filters.tag)
  if (filters.q) params.set('q', filters.q)
  if (filters.sort && filters.sort !== 'recents') params.set('sort', filters.sort)
  const qs = params.toString()
  return qs ? `/articles?${qs}` : '/articles'
}

export default function ArticlesIndex({
  articles,
  featured,
  total,
  tags,
  activeTag,
  filters,
}: Props) {
  const [query, setQuery] = useState(filters.q)
  const [syncedQuery, setSyncedQuery] = useState(filters.q)
  const [topicsOpen, setTopicsOpen] = useState(false)

  // Keep the search box in sync with the URL (back/forward, tag links)
  // by adjusting state during render rather than in an effect.
  if (syncedQuery !== filters.q) {
    setSyncedQuery(filters.q)
    setQuery(filters.q)
  }
  useEffect(() => router.on('navigate', () => setTopicsOpen(false)), [])

  const page = articles.metadata.currentPage
  const filtered = Boolean(filters.tag || filters.q || filters.sort !== 'recents')
  const showLead = page === 1 && !filtered
  const lead = showLead ? (featured ?? articles.data[0] ?? null) : null
  const rows = lead && !featured ? articles.data.slice(1) : articles.data
  const isEmpty = !lead && rows.length === 0
  const tagLabel = activeTag?.name ?? filters.tag

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    router.get(articlesHref({ ...filters, q: query.trim() }), {}, { preserveState: true })
  }

  const hrefForTag = (slug: string | null) => articlesHref({ ...filters, tag: slug })

  return (
    <>
      <Seo
        title={tagLabel ? `Articles #${tagLabel}` : 'Articles'}
        description="Tutoriels, retours d’expérience et astuces de production écrits par les développeurs JavaScript du Cameroun : Node.js, React, TypeScript, mobile, Mobile Money…"
        path={filters.tag ? `/articles?tag=${filters.tag}` : '/articles'}
        noindex={Boolean(filters.q)}
      />

      <PageHeader
        kicker={
          <>
            <span className="text-muted">[ART]</span> Articles · tutoriels, retours d’expérience,
            astuces
          </>
        }
        title={
          <>
            Écrit par la <span className="mark">communauté</span>.
          </>
        }
        lead="Ce que les développeurs JavaScript du Cameroun apprennent en production, en formation ou le soir après le travail — et prennent le temps de partager."
        actions={
          <ButtonLink href="/articles/nouveau" size="lg">
            <PenLine size={17} strokeWidth={1.75} /> Écrire un article
          </ButtonLink>
        }
      />

      {/* Filter bar */}
      <div className="border-b border-line">
        <div className="shell flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <form
            role="search"
            action="/articles"
            method="get"
            onSubmit={submitSearch}
            className="relative w-full md:max-w-md"
          >
            <label htmlFor="articles-search" className="sr-only">
              Rechercher un article
            </label>
            <Search
              size={17}
              strokeWidth={1.75}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            />
            <input
              id="articles-search"
              name="q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : hooks, Prisma, MoMo…"
              maxLength={100}
              enterKeyHint="search"
              className="h-11 w-full rounded-sm border border-line-2 bg-card pr-11 pl-10 text-[15px] text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted/80 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
            {filters.sort !== 'recents' && <input type="hidden" name="sort" value={filters.sort} />}
            {filters.q && (
              <Link
                href={articlesHref({ ...filters, q: '' })}
                preserveState
                aria-label="Effacer la recherche"
                className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-xs text-muted hover:bg-paper-2 hover:text-ink"
              >
                <X size={16} strokeWidth={1.75} />
              </Link>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {filters.tag && (
              <Link
                href={hrefForTag(null)}
                className="group inline-flex h-9 items-center gap-1.5 rounded-sm border border-ink bg-js pr-1.5 pl-2.5 font-mono text-[12.5px] font-medium text-js-ink"
                aria-label={`Retirer le filtre #${tagLabel}`}
              >
                <span>
                  <span className="opacity-50">#</span>
                  {tagLabel}
                </span>
                <span className="grid size-5 place-items-center rounded-xs transition-colors group-hover:bg-js-ink group-hover:text-js">
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                </span>
              </Link>
            )}
            <nav
              aria-label="Trier les articles"
              className="inline-flex rounded-sm border border-line-2 p-0.5"
            >
              {SORTS.map((sort) => {
                const active = filters.sort === sort.value
                return (
                  <Link
                    key={sort.value}
                    href={articlesHref({ ...filters, sort: sort.value })}
                    preserveState
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'inline-flex h-8 items-center rounded-xs px-3 font-mono text-[12px] font-medium tracking-[0.06em] uppercase transition-colors duration-150',
                      active ? 'bg-ink text-paper' : 'text-muted hover:bg-paper-2 hover:text-ink'
                    )}
                  >
                    {sort.label}
                  </Link>
                )
              })}
            </nav>
            <button
              type="button"
              onClick={() => setTopicsOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-2 px-3 font-mono text-[12px] font-medium tracking-[0.06em] text-ink-2 uppercase transition-colors hover:border-ink hover:text-ink lg:hidden"
              aria-haspopup="dialog"
            >
              <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden="true" /> Sujets
            </button>
          </div>
        </div>
      </div>

      <div className="shell grid gap-14 pt-8 pb-20 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <p className="label" aria-live="polite">
            {plural(total, 'article', 'articles', 'Aucun article')}
            {filters.q && <> · pour « {filters.q} »</>}
            {tagLabel && <> · #{tagLabel}</>}
            {filters.sort === 'populaires' && <> · les plus appréciés</>}
          </p>

          {isEmpty ? (
            page > 1 && articles.metadata.total > 0 ? (
              <EmptyState
                className="mt-6"
                code="404"
                title="Cette page est vide."
                description={`La liste s’arrête à la page ${articles.metadata.lastPage}.`}
                action={
                  <ButtonLink href={articlesHref(filters)} variant="secondary" size="sm">
                    Revenir à la première page
                  </ButtonLink>
                }
              />
            ) : filtered ? (
              <EmptyState
                className="mt-6"
                code="404"
                title="Aucun article ne correspond."
                description={
                  filters.q
                    ? `Rien pour « ${filters.q} »${tagLabel ? ` dans #${tagLabel}` : ''}. Essayez un autre mot-clé, plus court ou plus général.`
                    : 'Aucun article publié dans ce sujet pour l’instant. Ce pourrait être le vôtre.'
                }
                action={
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href="/articles" variant="secondary" size="sm">
                      Réinitialiser les filtres
                    </ButtonLink>
                    <ButtonLink href="/articles/nouveau" variant="ghost" size="sm">
                      Écrire sur ce sujet →
                    </ButtonLink>
                  </div>
                }
              />
            ) : (
              <EmptyState
                className="mt-6"
                code="ART"
                title="Aucun article publié pour l’instant."
                description="Le premier article de la communauté pourrait être le vôtre : un tutoriel, un retour d’expérience, une astuce."
                action={<ButtonLink href="/articles/nouveau">Écrire le premier article</ButtonLink>}
              />
            )
          ) : (
            <>
              {lead && (
                <section
                  aria-labelledby="articles-lead"
                  className="mt-6 border-t border-ink pt-6 pb-10"
                >
                  <h2 id="articles-lead" className="label mb-6 text-ink">
                    {featured ? <span className="mark-full">À la une</span> : 'Le plus récent'}
                  </h2>
                  <ArticleFeature article={lead} showStats />
                </section>
              )}
              {rows.length > 0 && (
                <section
                  aria-labelledby="articles-list"
                  className={cn(lead ? 'border-t border-ink' : 'mt-6 border-t border-ink')}
                >
                  <h2 id="articles-list" className="sr-only">
                    {lead ? 'Tous les articles' : 'Articles'}
                  </h2>
                  <ArticleList
                    articles={rows}
                    numbered={filters.sort === 'populaires'}
                    startAt={(page - 1) * articles.metadata.perPage + 1}
                    showStats
                  />
                </section>
              )}
              <Pagination meta={articles.metadata} className="mt-6" />
            </>
          )}
        </div>

        <aside
          className="grid content-start gap-12 lg:col-span-4 lg:pt-10"
          aria-label="Sujets et contribution"
        >
          <TagIndex
            tags={tags}
            activeSlug={filters.tag}
            hrefFor={hrefForTag}
            className="hidden lg:block"
          />
          <WriteCallout />
        </aside>
      </div>

      <SlideOver open={topicsOpen} onClose={() => setTopicsOpen(false)} title="Sujets">
        <TagIndex tags={tags} activeSlug={filters.tag} hrefFor={hrefForTag} id="tag-index-mobile" />
      </SlideOver>
    </>
  )
}
