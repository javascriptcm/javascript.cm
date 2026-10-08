import { useState } from 'react'
import { router } from '@inertiajs/react'
import { EyeOff, Trash2 } from 'lucide-react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { Button, ButtonLink } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { ArticleForm } from '~/components/articles/create-form'
import { WritingGuide } from '~/components/articles/writing-guide'
import { cn, formatDate } from '~/lib/format'

type Props = {
  article: Data.Article.Variants['forEdit']
  excerptIsAuto: boolean
  tags: Data.Tag[]
}

export default function ArticleEdit({ article, excerptIsAuto, tags }: Props) {
  const [unpublishing, setUnpublishing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const published = article.isPublished

  function unpublish() {
    router.post(
      `/articles/${article.slug}/unpublish`,
      {},
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setUnpublishing(true),
        onFinish: () => setUnpublishing(false),
      }
    )
  }

  function destroy() {
    router.delete(`/articles/${article.slug}`, {
      onStart: () => setDeleting(true),
      onFinish: () => {
        setDeleting(false)
        setConfirmDelete(false)
      },
    })
  }

  return (
    <>
      <Seo title={`Modifier · ${article.title}`} noindex />
      <PageHeader
        kicker={
          <>
            <span className="text-muted">[ART]</span> Articles / Modifier
          </>
        }
        title="Modifier l’article."
        lead={article.title}
      />
      <div className="shell grid gap-14 pt-10 pb-20 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <ArticleForm article={article} tags={tags} excerptIsAuto={excerptIsAuto} />
        </div>
        <aside className="lg:col-span-4">
          <div className="grid gap-12 lg:sticky lg:top-24">
            <section aria-labelledby="article-status" className="border-t border-ink pt-5">
              <h2 id="article-status" className="label text-ink">
                <span className="mr-2 text-muted">[—]</span>Statut
              </h2>
              <p className="mt-4 flex items-center gap-2.5 text-[22px] leading-none font-bold tracking-[-0.03em]">
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-2.5 rounded-full',
                    published ? 'bg-ok' : 'border border-ink-2'
                  )}
                />
                {published ? 'Publié' : 'Brouillon'}
              </p>
              <p className="mt-2 text-[14.5px] text-muted">
                {published
                  ? `En ligne depuis le ${formatDate(article.publishedAt)}.`
                  : 'Visible uniquement par vous (et l’équipe de modération).'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href={`/articles/${article.slug}`} variant="secondary" size="sm">
                  {published ? 'Voir l’article' : 'Prévisualiser'}
                </ButtonLink>
                {published && (
                  <Button variant="ghost" size="sm" onClick={unpublish} loading={unpublishing}>
                    <EyeOff size={15} strokeWidth={1.75} />
                    {unpublishing ? 'Dépublication…' : 'Dépublier'}
                  </Button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="label mt-6 inline-flex items-center gap-2 text-danger hover:underline focus-visible:underline"
              >
                <Trash2 size={13} strokeWidth={1.75} /> Supprimer l’article
              </button>
            </section>
            <WritingGuide />
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={destroy}
        processing={deleting}
        title="Supprimer cet article ?"
        description="L’article, ses commentaires et ses mentions « J’aime » disparaîtront définitivement."
      />
    </>
  )
}
