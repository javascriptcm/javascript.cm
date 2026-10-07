import type { Data } from '@generated/data'
import { AdminLayout } from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { TaxonomyManager } from '~/components/admin/taxonomy-manager'
import { plural } from '~/lib/format'

export default function AdminTags({ tags }: { tags: Data.Tag[] }) {
  const items = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    usageCount: tag.articlesCount + tag.discussionsCount,
    usage: `${plural(tag.articlesCount, 'article', 'articles', 'aucun article')} · ${plural(tag.discussionsCount, 'discussion', 'discussions', 'aucune discussion')}`,
  }))

  return (
    <>
      <Seo title="Tags — administration" noindex />
      <WorkspaceHeader
        kicker={`Administration · ${plural(tags.length, 'tag')}`}
        title="Les tags."
        lead="Ils classent les articles et les discussions. Supprimer un tag le retire des contenus, sans les supprimer."
      />
      <TaxonomyManager
        items={items}
        emptyTitle="Aucun tag."
        config={{
          baseUrl: '/admin/tags',
          noun: 'tag',
          createTitle: 'Nouveau tag',
          nameMax: 40,
          slugMax: 50,
          publicHref: (item) => `/articles?tag=${item.slug}`,
          deleteDescription: (item) =>
            item.usageCount
              ? `Il sera retiré de ${item.usage.replace(' · ', ' et de ')}. Les contenus restent en ligne.`
              : 'Ce tag n’est utilisé par aucun contenu.',
        }}
      />
    </>
  )
}

AdminTags.layout = [AdminLayout]
