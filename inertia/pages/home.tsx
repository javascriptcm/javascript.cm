import { Link, usePage } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import ArticlesSection from '~/components/articles-section'
import OpenSourceSection from '~/components/open-source-section'
import { ThreadList } from '~/components/forum/thread-list'
import { DiscussionList } from '~/components/discussions/discussion-list'
import { SectionHeading } from '~/components/ui/section-heading'
import { EmptyState } from '~/components/ui/empty-state'
import { Avatar } from '~/components/ui/avatar'
import { ButtonLink } from '~/components/ui/button'
import { formatNumber } from '~/lib/format'

type Props = {
  stats: { members: number; articles: number; threads: number; replies: number; solvedRate: number }
  articles: Data.Article[]
  threads: Data.Thread[]
  discussions: Data.Discussion[]
  members: Data.User[]
}

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date()
  )
}

export default function Home({ stats, articles, threads, discussions, members }: Props) {
  const { user } = usePage().props

  const readings = [
    { label: 'Membres', value: formatNumber(stats.members) },
    { label: 'Articles publiés', value: formatNumber(stats.articles) },
    { label: 'Questions posées', value: formatNumber(stats.threads) },
    { label: 'Taux de résolution', value: `${stats.solvedRate}%` },
  ]

  return (
    <>
      <Seo title="" path="/" />

      {/* Hero — typographic poster */}
      <section aria-labelledby="hero-title" className="border-b border-line">
        <div className="shell">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line py-3">
            <p className="label" suppressHydrationWarning>
              Édition du {todayLabel()}
            </p>
            <p className="label hidden md:block">Douala · Yaoundé · Buea · Bamenda · Garoua</p>
            <p className="label">4.05° N — 9.70° E</p>
          </div>

          <div className="grid gap-10 pt-12 pb-14 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-20">
            <h1
              id="hero-title"
              className="text-[clamp(4rem,14vw,10rem)] leading-[0.84] font-extrabold tracking-[-0.06em] lg:col-span-9"
            >
              <span className="rise block">Le 237</span>
              <span className="rise rise-1 block pl-[0.08em] font-mono text-[0.3em] leading-[1.5] font-medium tracking-[-0.02em] text-ink-2 sm:pl-[1.4em]">
                code en
              </span>
              <span className="rise rise-2 block">
                <span className="mark mark-sweep">JavaScript.</span>
              </span>
            </h1>

            <div className="rise rise-3 flex flex-col justify-end lg:col-span-3">
              <p className="text-[18px] leading-relaxed text-ink-2">
                La communauté des développeurs JavaScript du Cameroun. Des articles, un forum d’entraide et des
                discussions — de Node.js à React, de TypeScript au mobile.
              </p>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row lg:flex-col">
                {user ? (
                  <>
                    <ButtonLink href="/articles/nouveau" size="lg">
                      Écrire un article
                    </ButtonLink>
                    <ButtonLink href="/forum/nouveau" variant="secondary" size="lg">
                      Poser une question
                    </ButtonLink>
                  </>
                ) : (
                  <>
                    <ButtonLink href="/register" size="lg">
                      Rejoindre la communauté
                    </ButtonLink>
                    <ButtonLink href="/forum" variant="secondary" size="lg">
                      Visiter le forum
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instrument readout */}
        <dl className="shell grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {readings.map((reading, i) => (
            <div
              key={reading.label}
              className={`py-6 ${i % 2 === 1 ? 'border-l border-line pl-5 sm:pl-8' : ''} ${i >= 2 ? 'border-t border-line lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l lg:pl-8' : ''}`}
            >
              <dt className="label">
                <span className="text-ink">{String(i + 1).padStart(2, '0')}</span> {reading.label}
              </dt>
              <dd className="mt-2 text-[clamp(2.2rem,4.5vw,3.4rem)] leading-none font-bold tracking-[-0.04em] tabular-nums">
                {reading.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <ArticlesSection articles={articles} />

      {/* Forum */}
      <section aria-labelledby="home-forum" className="shell mt-24 sm:mt-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                index="02"
                label="Forum d’entraide"
                title={
                  <span id="home-forum">
                    Bloqué ? <span className="mark">Demandez.</span>
                  </span>
                }
                description="Une erreur que vous ne comprenez pas, un choix d’architecture, une config qui résiste : quelqu’un est déjà passé par là."
              />
              <div className="mt-8 flex flex-wrap gap-2">
                <ButtonLink href="/forum/nouveau">Poser une question</ButtonLink>
                <ButtonLink href="/forum" variant="ghost">
                  Tout le forum →
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className="border-t border-ink lg:col-span-8">
            {threads.length ? (
              <ThreadList threads={threads} />
            ) : (
              <EmptyState className="mt-6" code="FRM" title="Aucune question pour l’instant." description="Posez la première question du forum." />
            )}
          </div>
        </div>
      </section>

      {/* Discussions + members */}
      <section className="shell mt-24 grid gap-14 sm:mt-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHeading
            index="03"
            label="Discussions"
            title="Carrière, outils, écosystème."
            action={{ href: '/discussions', label: 'Toutes les discussions' }}
          />
          <div className="mt-4">
            {discussions.length ? (
              <DiscussionList discussions={discussions} />
            ) : (
              <EmptyState className="mt-6" code="DSC" title="Aucune discussion ouverte." description="Lancez le premier sujet." />
            )}
          </div>
        </div>
        <aside className="lg:col-span-5" aria-labelledby="home-members">
          <div className="border-t border-ink pt-5">
            <p className="label text-ink" id="home-members">
              <span className="mr-2 text-muted">[—]</span>Derniers arrivés
            </p>
            <ul className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-4">
              {members.map((member) => (
                <li key={member.id}>
                  <Link href={`/@${member.username}`} className="group flex flex-col items-start gap-2" title={member.displayName}>
                    <Avatar user={member} size="lg" className="transition-transform duration-300 ease-out-expo group-hover:-translate-y-1" />
                    <span className="w-full truncate font-mono text-[11.5px] text-muted group-hover:text-ink">@{member.username}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/membres" className="mt-6 inline-flex items-center gap-2 font-mono text-[13px] font-medium tracking-[0.06em] uppercase">
              <span className="link-draw">L’annuaire des membres</span> →
            </Link>
          </div>
        </aside>
      </section>

      <OpenSourceSection />
    </>
  )
}
