import { ArticleStatus } from '#enums/article_status'
import User from '#models/user'
import string from '@adonisjs/core/helpers/string'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Article extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare content: string

  @column()
  declare excerpt: string

  @column()
  declare status: ArticleStatus

  @column()
  declare authorId: number

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column()
  declare coverImage: string | null

  @column()
  declare canonicalUrl: string | null

  @column({
    prepare: (value: string[] | string | null) => (Array.isArray(value) ? value.join(',') : value),
    consume: (value: string | null) => (value ? value.split(',') : []),
  })
  declare tags: string[]

  @column()
  declare banReason: string | null

  // Generate slug before saving
  public static generateSlug(title: string) {
    return string.slug(title)
  }
}
