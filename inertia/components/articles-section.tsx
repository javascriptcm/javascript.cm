import type { Data } from '@generated/data'
import { ArticleFeature, ArticleRow } from '~/components/articles/list'
import { SectionHeading } from '~/components/ui/section-heading'
import { EmptyState } from '~/components/ui/empty-state'
import { ButtonLink } from '~/components/ui/button'

/**
 * Home: lead story on the left, the next four as a numbered index.
 */
export default function ArticlesSection({ articles }: { articles: Data.Article[] }) {
  const [lead, ...rest] = articles

  return (
    <section aria-labelledby="home-articles" className="shell mt-24 sm:mt-32">
      <SectionHeading
        index="01"
        label="Le fil des articles"
        title={
          <span id="home-articles">
            Ce qui s’écrit <span className="mark">en ce moment</span>.
          </span>
        }
        action={{ href: '/articles', label: 'Tous les articles' }}
      />
      {lead ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 lg:border-r lg:border-line lg:pr-12">
            <ArticleFeature article={lead} />
          </div>
          <div className="lg:col-span-5">
            {rest.map((article, i) => (
              <ArticleRow key={article.id} article={article} index={i + 2} showExcerpt={false} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          className="mt-10"
          code="ART"
          title="Aucun article pour l’instant."
          description="Le premier article de la communauté pourrait être le vôtre : un tutoriel, un retour d’expérience, une astuce."
          action={<ButtonLink href="/articles/nouveau">Écrire le premier article</ButtonLink>}
        />
      )}
    </section>
  )
}
