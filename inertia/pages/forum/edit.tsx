import { Link } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { ThreadForm } from '~/components/forum/thread-form'
import { AskingTips } from '~/components/forum/asking-tips'

type Props = {
  thread: Data.Thread.Variants['forEdit']
  channels: Data.Channel[]
}

export default function ForumEdit({ thread, channels }: Props) {
  const href = `/forum/${thread.slug}`

  return (
    <>
      <Seo title={`Modifier : ${thread.title}`} path={`${href}/modifier`} noindex />

      <PageHeader
        kicker={
          <>
            <span className="mr-2 text-muted">[FRM]</span>
            <Link href={href} className="link-draw hover:text-ink">
              Retour à la question
            </Link>
          </>
        }
        title="Modifier la question"
        lead="Précisez, corrigez, ajoutez ce que vous avez découvert depuis. L’adresse de la question reste la même : les liens partagés continuent de fonctionner."
      />

      <div className="shell grid gap-8 pt-8 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <div className="lg:hidden">
          <AskingTips variant="disclosure" />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <ThreadForm
            channels={channels}
            initial={{ title: thread.title, channelId: thread.channelId, body: thread.body }}
            action={href}
            method="put"
            submitLabel="Enregistrer les modifications"
            cancelHref={href}
          />
        </div>
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="lg:sticky lg:top-24">
            <AskingTips variant="aside" />
          </div>
        </aside>
      </div>
    </>
  )
}
