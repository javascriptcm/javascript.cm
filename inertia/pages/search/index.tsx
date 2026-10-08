import { Link, router } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { ButtonLink } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination } from '~/components/ui/pagination'
import { SearchField } from '~/components/search/search-field'
import { SearchTabs } from '~/components/search/search-tabs'
import { ArticleResult, DiscussionResult, QuestionResult } from '~/components/search/result-row'
import {
  ExampleQueries,
  ForumChannels,
  PopularTags,
  SyntaxHelp,
} from '~/components/search/suggestions'
import {
  SECTIONS,
  searchHref,
  type Highlight,
  type SearchCounts,
  type SearchResults,
  type SearchSection,
  type SearchType,
} from '~/components/search/url'
import { formatNumber, plural } from '~/lib/format'

type Status = 'landing' | 'invalid' | 'throttled' | 'results' | 'empty'

type Props = SearchResults & {
  q: string
  type: SearchType
  status: Status
  error: string | null
  /** "prefix": nothing matched exactly, results come from "mot:*" prefixes. */
  mode: 'exact' | 'prefix' | null
  counts: SearchCounts | null
  /** Size of the searchable content (landing state). */
  index: SearchCounts | null
  highlights: Record<string, Highlight>
  /** Landing and empty states: popular topics and forum channels. */
  popularTags: Data.Tag[] | null
  channels: Data.Channel[] | null
}

const NONE: Record<SearchSection, string> = {
  articles: 'Aucun article ne correspond',
  questions: 'Aucune question ne correspond',
  discussions: 'Aucune discussion ne correspond',
}

const ASK_HREF = '/forum/nouveau'

export default function SearchIndex(props: Props) {
  const { q, type, status, error, mode, counts, index, popularTags, channels } = props
  const searched = status === 'results' || status === 'empty'
  const total = counts ? counts.articles + counts.questions + counts.discussions : 0

  function search(term: string) {
    router.get(searchHref({ q: term, type: term ? type : 'tout' }), {}, { preserveState: true })
  }

  return (
    <>
      <Seo
        title={q ? `«\u00a0${q}\u00a0» — Recherche` : 'Recherche'}
        description="Cherchez dans les articles, les questions du forum et les discussions de JavaScript Cameroun : tutoriels, erreurs résolues, retours d’expérience."
        path="/recherche"
        noindex={Boolean(q)}
      />

      <header className="border-b border-line pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="shell">
          <p className="label text-ink-2">
            <span className="mr-2 text-muted">[RCH]</span>Recherche
            {index && (
              <>
                {' '}
                · {plural(index.articles, 'article')}, {plural(index.questions, 'question')},{' '}
                {plural(index.discussions, 'discussion')}
              </>
            )}
          </p>
          {searched ? (
            <h1 className="sr-only">Résultats de recherche pour «&nbsp;{q}&nbsp;»</h1>
          ) : (
            <>
              <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.75rem)] leading-[0.95] font-bold tracking-[-0.04em]">
                Chercher dans les <span className="mark">archives</span>.
              </h1>
              <p className="mt-5 max-w-2xl text-[17.5px] leading-relaxed text-ink-2">
                Articles, questions du forum et discussions&nbsp;: tout ce que la communauté a
                écrit, en une seule recherche. Collez un message d’erreur, un nom de librairie ou
                une idée.
              </p>
            </>
          )}
          <div className={searched ? 'mt-4 max-w-4xl' : 'mt-8 max-w-4xl'}>
            <SearchField
              value={q}
              type={type}
              error={error}
              autoFocus={!searched}
              onSearch={search}
            />
          </div>
        </div>
      </header>

      {status === 'results' && counts ? (
        <>
          <div className="border-b border-line">
            <div className="shell flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <SearchTabs q={q} type={type} counts={counts} />
              <p className="label" aria-live="polite">
                {plural(total, 'résultat')} pour <span className="text-ink">«&nbsp;{q}&nbsp;»</span>
              </p>
            </div>
          </div>
          <div className="shell grid gap-14 pt-8 pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-10">
            <div className="min-w-0 lg:col-span-8">
              {mode === 'prefix' && (
                <p
                  role="status"
                  className="mb-8 border-l-2 border-js bg-paper-2 py-3 pr-4 pl-4 text-[15px] leading-relaxed text-ink-2"
                >
                  Aucun résultat exact pour «&nbsp;<span className="text-ink">{q}</span>&nbsp;».
                  Voici les contenus dont les mots{' '}
                  <strong className="font-semibold text-ink">commencent par</strong> ces lettres.
                </p>
              )}
              {type === 'tout' ? (
                <AllSections {...props} counts={counts} />
              ) : (
                <FilteredSection {...props} type={type} counts={counts} />
              )}
            </div>
            <aside
              aria-label="Aide à la recherche"
              className="grid content-start gap-12 lg:col-span-4"
            >
              <SyntaxHelp />
              <AskCallout />
            </aside>
          </div>
        </>
      ) : status === 'empty' ? (
        <div className="shell grid gap-14 pt-10 pb-20 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8">
            <EmptyState
              code="RCH-0"
              title={`Rien trouvé pour «\u00a0${q}\u00a0».`}
              description="Vérifiez l’orthographe, essayez un terme plus général ou le mot anglais : les messages d’erreur et les noms d’API le sont souvent. Sinon, la communauté peut vous répondre."
              action={
                <div className="flex flex-wrap gap-2">
                  <ButtonLink href={ASK_HREF}>Poser la question au forum</ButtonLink>
                  <ButtonLink href="/recherche" variant="secondary">
                    Nouvelle recherche
                  </ButtonLink>
                </div>
              }
            />
            {popularTags && (
              <PopularTags className="mt-14" tags={popularTags} title="Parcourir par sujet" />
            )}
          </div>
          <aside aria-label="Autres pistes" className="grid content-start gap-12 lg:col-span-4">
            {channels && <ForumChannels channels={channels} />}
            <SyntaxHelp />
          </aside>
        </div>
      ) : (
        <div className="shell grid gap-14 pt-10 pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-14">
          <ExampleQueries className="min-w-0 lg:col-span-7" />
          {(popularTags || channels) && (
            <div className="grid content-start gap-12 lg:col-span-4 lg:col-start-9">
              {popularTags && <PopularTags tags={popularTags} />}
              {channels && <ForumChannels channels={channels} />}
            </div>
          )}
        </div>
      )}
    </>
  )
}

/**
 * Rows of one section, numbered from "startAt".
 */
function Rows({
  section,
  props,
  startAt,
}: {
  section: SearchSection
  props: Props
  startAt: number
}) {
  const key = (id: number) => `${section}:${id}`
  const { highlights } = props
  if (section === 'articles') {
    return (props.articles?.data ?? []).map((article, i) => (
      <ArticleResult
        key={article.id}
        article={article}
        index={startAt + i}
        highlight={highlights[key(article.id)]}
      />
    ))
  }
  if (section === 'questions') {
    return (props.questions?.data ?? []).map((thread, i) => (
      <QuestionResult
        key={thread.id}
        thread={thread}
        index={startAt + i}
        highlight={highlights[key(thread.id)]}
      />
    ))
  }
  return (props.discussions?.data ?? []).map((discussion, i) => (
    <DiscussionResult
      key={discussion.id}
      discussion={discussion}
      index={startAt + i}
      highlight={highlights[key(discussion.id)]}
    />
  ))
}

/**
 * "Tout": the best matches of each kind, with a link to the full tab.
 */
function AllSections(props: Props & { counts: SearchCounts }) {
  const { q, counts } = props
  return (
    <div className="space-y-14">
      {SECTIONS.map((section) => {
        const shown = props[section.value]?.data.length ?? 0
        const count = counts[section.value]
        if (!shown) return null
        return (
          <section key={section.value} aria-labelledby={`results-${section.value}`}>
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-ink pb-3">
              <h2
                id={`results-${section.value}`}
                className="text-[clamp(1.45rem,2.6vw,1.8rem)] leading-none font-bold tracking-[-0.03em]"
              >
                <span className="label mr-2 align-middle">[{section.code}]</span>
                {section.label}
                <span className="ml-2.5 align-middle font-mono text-[14px] font-medium tracking-normal text-muted tabular-nums">
                  {formatNumber(count)}
                </span>
              </h2>
              {count > shown && (
                <Link
                  href={searchHref({ q, type: section.value })}
                  preserveState
                  className="group inline-flex items-center gap-2 font-mono text-[12.5px] font-medium tracking-[0.06em] text-ink uppercase"
                >
                  <span className="link-draw">Voir les {formatNumber(count)} résultats</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              )}
            </div>
            <Rows section={section.value} props={props} startAt={1} />
          </section>
        )
      })}
    </div>
  )
}

/**
 * One content type, paginated.
 */
function FilteredSection(props: Props & { type: SearchSection; counts: SearchCounts }) {
  const { q, type, counts } = props
  const page = props[type]

  if (!page || page.data.length === 0) {
    if (counts[type] > 0 && page) {
      return (
        <EmptyState
          code="404"
          title="Cette page est vide."
          description={`Les résultats s’arrêtent à la page ${page.metadata.lastPage}.`}
          action={
            <ButtonLink href={searchHref({ q, type })} variant="secondary" size="sm">
              Revenir à la première page
            </ButtonLink>
          }
        />
      )
    }
    const elsewhere = SECTIONS.filter((section) => counts[section.value] > 0)
    return (
      <EmptyState
        code="RCH"
        title={`${NONE[type]} à «\u00a0${q}\u00a0».`}
        description="D’autres contenus de la communauté correspondent à votre recherche :"
        action={
          <div className="flex flex-wrap gap-2">
            {elsewhere.map((section) => (
              <ButtonLink
                key={section.value}
                href={searchHref({ q, type: section.value })}
                variant="secondary"
                size="sm"
                preserveState
              >
                {plural(counts[section.value], ...section.noun)}
                <span aria-hidden="true">→</span>
              </ButtonLink>
            ))}
          </div>
        }
      />
    )
  }

  const { currentPage, perPage } = page.metadata
  return (
    <>
      <div className="border-t border-ink">
        <Rows section={type} props={props} startAt={(currentPage - 1) * perPage + 1} />
      </div>
      <Pagination meta={page.metadata} className="mt-6" />
    </>
  )
}

function AskCallout() {
  return (
    <section
      aria-labelledby="search-ask-title"
      className="rounded-sm border border-ink bg-card p-6"
    >
      <p className="label text-ink">Pas trouvé ?</p>
      <h2
        id="search-ask-title"
        className="mt-3 text-[23px] leading-[1.1] font-bold tracking-[-0.03em]"
      >
        Posez la <span className="mark">question</span>.
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
        Décrivez le problème et collez l’erreur : quelqu’un du 237 est sûrement déjà passé par là,
        et sa réponse servira à ceux qui chercheront après vous.
      </p>
      <Link
        href={ASK_HREF}
        className="group mt-5 inline-flex items-center gap-2 font-mono text-[13px] font-medium tracking-[0.06em] text-ink uppercase"
      >
        <span className="link-draw">Poser une question</span>
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
