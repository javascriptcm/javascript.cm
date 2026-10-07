import type { Data } from '@generated/data'
import { Seo } from '~/components/seo'
import { PageHeader } from '~/components/ui/page-header'
import { ThreadForm } from '~/components/forum/thread-form'
import { AskingTips } from '~/components/forum/asking-tips'

type Props = {
  channels: Data.Channel[]
  defaultChannelId: number | null
}

export default function ForumCreate({ channels, defaultChannelId }: Props) {
  return (
    <>
      <Seo title="Poser une question" path="/forum/nouveau" noindex />

      <PageHeader
        kicker={
          <>
            <span className="mr-2 text-muted">[FRM]</span>Forum d’entraide — Nouvelle question
          </>
        }
        title={
          <>
            Poser une <span className="mark">question</span>
          </>
        }
        lead="Plus votre question est précise, plus vite vous aurez une réponse utile. Prenez deux minutes pour donner le contexte : c’est le meilleur investissement du jour."
      />

      <div className="shell grid gap-8 pt-8 pb-24 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <div className="lg:hidden">
          <AskingTips variant="disclosure" />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <ThreadForm
            channels={channels}
            initial={{ title: '', channelId: defaultChannelId, body: '' }}
            action="/forum"
            method="post"
            submitLabel="Publier la question"
            cancelHref="/forum"
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
