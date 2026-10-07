import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { DiscussionForm, DiscussionTips } from '~/components/discussions/discussion-form'

type Props = {
  tags: Data.Tag[]
  defaultTagIds: number[]
}

export default function DiscussionsCreate({ tags, defaultTagIds }: Props) {
  return (
    <>
      <Seo title="Lancer une discussion" path="/discussions/nouvelle" noindex />

      <PageHeader
        kicker={
          <>
            <span className="mr-2 text-muted">[DSC]</span>Discussions — Nouveau sujet
          </>
        }
        title={
          <>
            Lancer une <span className="mark">discussion</span>
          </>
        }
        lead="Un retour d’expérience, une annonce, un débat sur l’écosystème : posez le sujet sur la table, la communauté prend la parole."
      />

      <div className="shell grid gap-8 pt-8 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <div className="lg:hidden">
          <DiscussionTips variant="disclosure" />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <DiscussionForm
            tags={tags}
            initial={{ title: '', body: '', tags: defaultTagIds }}
            action="/discussions"
            method="post"
            submitLabel="Lancer la discussion"
            cancelHref="/discussions"
          />
        </div>
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="lg:sticky lg:top-24">
            <DiscussionTips variant="aside" />
          </div>
        </aside>
      </div>
    </>
  )
}
