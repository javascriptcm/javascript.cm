import { DiscussionSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Tag from '#models/tag'
import Reply from '#models/reply'

export default class Discussion extends DiscussionSchema {
  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @manyToMany(() => Tag, { pivotTable: 'discussion_tag' })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => Reply)
  declare replies: HasMany<typeof Reply>

  get isLocked() {
    return this.lockedAt !== null
  }
}
