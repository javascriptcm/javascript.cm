import { Link } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { DiscussionForm, DiscussionTips } from '~/components/discussions/discussion-form'

type Props = {
  discussion: Data.Discussion.Variants['forEdit']
  tags: Data.Tag[]
}

export default function DiscussionsEdit({ discussion, tags }: Props) {
  const href = `/discussions/${discussion.slug}`

  return (
    <>
      <Seo title={`Modifier : ${discussion.title}`} path={`${href}/modifier`} noindex />

      <PageHeader
        kicker={
          <>
            <span className="mr-2 text-muted">[DSC]</span>
            <Link href={href} className="link-draw hover:text-ink">
              Retour à la discussion
            </Link>
          </>
        }
        title="Modifier la discussion"
        lead="Reformulez, complétez, ajustez les sujets. L’adresse de la discussion ne change pas."
      />

      <div className="shell grid gap-8 pt-8 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <div className="lg:hidden">
          <DiscussionTips variant="disclosure" />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <DiscussionForm
            tags={tags}
            initial={{
              title: discussion.title,
              body: discussion.body,
              tags: (discussion.tags ?? []).map((tag) => tag.id),
            }}
            action={href}
            method="put"
            submitLabel="Enregistrer les modifications"
            cancelHref={href}
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
