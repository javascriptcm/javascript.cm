import { Link, router, usePage } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { ButtonLink } from '~/components/ui/button'
import { EmptyState } from '~/components/ui/empty-state'
import { Pagination, type PaginationMeta } from '~/components/ui/pagination'
import { ThreadList } from '~/components/forum/thread-list'
import { ChannelNav } from '~/components/forum/channel-nav'
import { SearchBox } from '~/components/forum/search-box'
import { withQuery } from '~/components/forum/url'
import { cn, formatNumber, plural } from '~/lib/format'

type Filter = 'sans-reponse' | 'non-resolues' | 'resolues'

type Props = {
  threads: { data: Data.Thread.Variants['forList'][]; metadata: PaginationMeta }
  channels: Data.Channel[]
  filters: { channel: string | null; filter: Filter | null; q: string }
  stats: {
    total: number
    solved: number
    unanswered: number
    unsolved: number
    solvedRate: number
    allThreads: number
  }
}

export default function ForumIndex({ threads, channels, filters, stats }: Props) {
  const { user } = usePage().props
  const channel = channels.find((c) => c.slug === filters.channel) ?? null

  const url = (overrides: Partial<Props['filters']>) => {
    const next = { ...filters, ...overrides }
    return withQuery('/forum', { channel: next.channel, filter: next.filter, q: next.q })
  }

  const tabs: { value: Filter | null; label: string; count: number }[] = [
    { value: null, label: 'Toutes', count: stats.total },
    { value: 'sans-reponse', label: 'Sans réponse', count: stats.unanswered },
    { value: 'non-resolues', label: 'Non résolues', count: stats.unsolved },
    { value: 'resolues', label: 'Résolues', count: stats.solved },
  ]

  const askHref = channel ? `/forum/nouveau?channel=${channel.slug}` : '/forum/nouveau'
  const where = channel ? `dans « ${channel.name} »` : 'sur le forum'

  const empty = (() => {
    if (filters.q) {
      return {
        code: 'FRM-Q',
        title: `Aucun résultat pour « ${filters.q} ».`,
        description:
          'Essayez avec d’autres mots-clés (le message d’erreur, le nom de la librairie…), ou posez directement la question.',
        action: (
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={url({ q: '' })} variant="secondary" preserveScroll>
              Effacer la recherche
            </ButtonLink>
            <ButtonLink href={askHref}>Poser la question</ButtonLink>
          </div>
        ),
      }
    }
    if (filters.filter === 'sans-reponse') {
      return {
        code: 'FRM-0',
        title: 'Toutes les questions ont reçu une réponse.',
        description: `Aucune question n’attend sa première réponse ${where}. Bravo à la communauté.`,
        action: null,
      }
    }
    if (filters.filter === 'non-resolues') {
      return {
        code: 'FRM-?',
        title: 'Aucune question en attente de solution.',
        description: `Tout ce qui a été demandé ${where} a trouvé sa réponse acceptée.`,
        action: null,
      }
    }
    if (filters.filter === 'resolues') {
      return {
        code: 'FRM-✓',
        title: 'Aucune question résolue pour l’instant.',
        description:
          'Quand l’auteur d’une question marque une réponse comme solution, elle apparaît ici.',
        action: (
          <ButtonLink href={url({ filter: 'non-resolues' })} variant="secondary" preserveScroll>
            Voir les questions à résoudre
          </ButtonLink>
        ),
      }
    }
    return {
      code: 'FRM',
      title: channel
        ? `Pas encore de question dans « ${channel.name} ».`
        : 'Le forum attend sa première question.',
      description:
        'Une erreur, un blocage, un doute : lancez-vous, quelqu’un est sûrement déjà passé par là.',
      action: <ButtonLink href={askHref}>Poser une question</ButtonLink>,
    }
  })()

  return (
    <>
      <Seo
        title={channel ? `${channel.name} — Forum d’entraide` : 'Forum d’entraide'}
        description={
          channel?.description ??
          'Le forum d’entraide de JavaScript Cameroun : posez vos questions sur JavaScript, TypeScript, React, Node.js et l’écosystème, la communauté vous répond.'
        }
        path={channel ? `/forum?channel=${channel.slug}` : '/forum'}
        noindex={Boolean(filters.q || filters.filter)}
      />

      <PageHeader
        kicker={
          <>
            <span className="mr-2 text-muted">[FRM]</span>Forum d’entraide ·{' '}
            {plural(stats.allThreads, 'question')}
          </>
        }
        title={
          <>
            Forum d’<span className="mark">entraide</span>
          </>
        }
        lead="Une erreur que vous ne comprenez pas, une config qui résiste, un choix d’architecture : posez la question, la communauté du 237 répond. La bonne réponse est marquée comme solution pour ceux qui passeront après vous."
        actions={
          <ButtonLink
            href={user ? askHref : `/login?redirect=${encodeURIComponent(askHref)}`}
            size="lg"
          >
            Poser une question
          </ButtonLink>
        }
      />

      <div className="shell grid gap-8 pt-8 pb-24 lg:grid-cols-12 lg:gap-10 lg:pt-12">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <ChannelNav
              channels={channels}
              active={filters.channel}
              allCount={stats.allThreads}
              hrefFor={(slug) => url({ channel: slug })}
            />
          </div>
        </aside>

        <section aria-labelledby="forum-selection" className="min-w-0 lg:col-span-9">
          <div className="flex flex-col gap-5 border-b border-ink pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="label">{channel ? 'Canal' : 'Tous les canaux'}</p>
              <h2
                id="forum-selection"
                className="mt-1.5 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.05] font-bold tracking-[-0.03em]"
              >
                {channel ? channel.name : 'Toutes les questions'}
              </h2>
              {channel?.description && (
                <p className="mt-2 max-w-xl text-[15px] text-ink-2">{channel.description}</p>
              )}
            </div>
            <SolvedRate rate={stats.solvedRate} total={stats.total} solved={stats.solved} />
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav aria-label="Filtrer par statut">
              <ul className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => {
                  const current = tab.value === filters.filter
                  return (
                    <li key={tab.label}>
                      <Link
                        href={url({ filter: tab.value })}
                        preserveScroll
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          'inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-[14px] font-medium transition-colors duration-150',
                          current
                            ? 'border-ink bg-ink text-paper'
                            : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                        )}
                      >
                        {tab.label}
                        <span
                          className={cn(
                            'font-mono text-[12px] tabular-nums',
                            current ? 'rounded-xs bg-js px-1 text-js-ink' : 'text-muted'
                          )}
                        >
                          {formatNumber(tab.count)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <SearchBox
              id="forum-search"
              label="Rechercher une question"
              placeholder="Rechercher une question…"
              value={filters.q}
              onSearch={(term) => router.visit(url({ q: term }), { preserveScroll: true })}
              className="md:w-72"
            />
          </div>

          {filters.q && threads.data.length > 0 && (
            <p className="label mt-5">
              {plural(threads.metadata.total, 'résultat')} pour{' '}
              <span className="text-ink">« {filters.q} »</span> ·{' '}
              <Link
                href={url({ q: '' })}
                preserveScroll
                className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink"
              >
                effacer
              </Link>
            </p>
          )}

          <div className="mt-3">
            {threads.data.length ? (
              <ThreadList threads={threads.data} showExcerpt highlight={filters.q} />
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

          <Pagination meta={threads.metadata} className="mt-6" />
        </section>
      </div>
    </>
  )
}

/**
 * Solved rate of the current selection: a mono readout + hairline gauge.
 */
function SolvedRate({ rate, total, solved }: { rate: number; total: number; solved: number }) {
  return (
    <div className="shrink-0 sm:text-right">
      <p className="font-mono text-[13px] text-ink">
        <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums">
          {total ? `${rate}%` : '—'}
        </span>{' '}
        <span className="text-muted">résolues</span>
      </p>
      <div
        className="mt-1.5 h-1 w-full bg-line sm:ml-auto sm:w-40"
        role="img"
        aria-label={`${solved} questions résolues sur ${total}`}
      >
        <div className="h-full bg-ok" style={{ width: `${rate}%` }} />
      </div>
      <p className="label mt-1.5">
        {formatNumber(solved)} / {formatNumber(total)} questions
      </p>
    </div>
  )
}
