import type { Data } from '@generated/data'
import { AdminLayout } from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { TaxonomyManager } from '~/components/admin/taxonomy-manager'
import { plural } from '~/lib/format'

type Channel = Data.Channel & { position: number }

export default function AdminChannels({
  channels,
  nextPosition,
}: {
  channels: Channel[]
  nextPosition: number
}) {
  const items = channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    slug: channel.slug,
    description: channel.description,
    position: channel.position,
    usageCount: channel.threadsCount,
    usage: plural(channel.threadsCount, 'question', 'questions', 'aucune question'),
  }))

  return (
    <>
      <Seo title="Canaux du forum — administration" noindex />
      <WorkspaceHeader
        kicker={`Administration · ${plural(channels.length, 'canal', 'canaux')}`}
        title="Les canaux du forum."
        lead="Chaque question du forum appartient à un canal. La position fixe l’ordre d’affichage (du plus petit au plus grand)."
      />
      <TaxonomyManager
        items={items}
        emptyTitle="Aucun canal."
        config={{
          baseUrl: '/admin/canaux',
          noun: 'canal',
          createTitle: 'Nouveau canal',
          nameMax: 60,
          slugMax: 70,
          withPosition: true,
          nextPosition,
          publicHref: (item) => `/forum?channel=${item.slug}`,
          deleteBlocker: (item) =>
            item.usageCount
              ? `Ce canal contient ${item.usage}. Déplacez-les vers un autre canal avant de le supprimer : la suppression les effacerait.`
              : null,
          deleteDescription: () =>
            'Ce canal est vide : il disparaîtra simplement de la liste du forum.',
        }}
      />
    </>
  )
}

AdminChannels.layout = [AdminLayout]
