import { TagSchema } from '#database/schema'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Article from '#models/article'
import Discussion from '#models/discussion'

export default class Tag extends TagSchema {
  @manyToMany(() => Article, { pivotTable: 'article_tag' })
  declare articles: ManyToMany<typeof Article>

  @manyToMany(() => Discussion, { pivotTable: 'discussion_tag' })
  declare discussions: ManyToMany<typeof Discussion>
}
