import { ThreadSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Channel from '#models/channel'
import Reply from '#models/reply'

export default class Thread extends ThreadSchema {
  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Channel)
  declare channel: BelongsTo<typeof Channel>

  @hasMany(() => Reply)
  declare replies: HasMany<typeof Reply>

  @belongsTo(() => Reply, { foreignKey: 'solutionReplyId' })
  declare solution: BelongsTo<typeof Reply>

  get isSolved() {
    return this.solutionReplyId !== null
  }

  get isLocked() {
    return this.lockedAt !== null
  }
}
