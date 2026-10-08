import { NotificationSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Article from '#models/article'
import Reply from '#models/reply'

export type NotificationType = Notification['type']

export default class Notification extends NotificationSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'actorId' })
  declare actor: BelongsTo<typeof User>

  @belongsTo(() => Thread)
  declare thread: BelongsTo<typeof Thread>

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>

  @belongsTo(() => Article)
  declare article: BelongsTo<typeof Article>

  @belongsTo(() => Reply)
  declare reply: BelongsTo<typeof Reply>

  get isRead() {
    return this.readAt !== null
  }
}
