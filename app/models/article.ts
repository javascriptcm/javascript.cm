import { DateTime } from 'luxon'
import { ArticleSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Tag from '#models/tag'
import Reply from '#models/reply'
import Like from '#models/like'

export default class Article extends ArticleSchema {
  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @manyToMany(() => Tag, { pivotTable: 'article_tag' })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => Reply)
  declare comments: HasMany<typeof Reply>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  static published = scope((query) => {
    query.whereNotNull('published_at').where('published_at', '<=', DateTime.now().toSQL()!)
  })

  get isPublished() {
    return this.publishedAt !== null && this.publishedAt <= DateTime.now()
  }
}
