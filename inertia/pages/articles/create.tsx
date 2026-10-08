import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { ArticleForm } from '~/components/articles/create-form'
import { WritingGuide } from '~/components/articles/writing-guide'

export default function ArticleCreate({ tags }: { tags: Data.Tag[] }) {
  return (
    <>
      <Seo title="Écrire un article" noindex />
      <PageHeader
        kicker={
          <>
            <span className="text-muted">[ART]</span> Articles / Nouveau
          </>
        }
        title={
          <>
            Écrire un <span className="mark">article</span>.
          </>
        }
        lead="Un tutoriel, un retour d’expérience, une astuce de production : partagez ce que vous avez appris. Écrivez en Markdown, enregistrez un brouillon, publiez quand c’est prêt."
      />
      <div className="shell grid gap-14 pt-10 pb-20 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <ArticleForm tags={tags} />
        </div>
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <WritingGuide />
          </div>
        </aside>
      </div>
    </>
  )
}
