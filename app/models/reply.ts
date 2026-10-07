import { ReplySchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Article from '#models/article'
import Like from '#models/like'

/**
 * A reply to a forum thread, a discussion, or a comment on an article.
 * Exactly one of threadId / discussionId / articleId is set (enforced by a
 * CHECK constraint in the database).
 */
export default class Reply extends ReplySchema {
  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Thread)
  declare thread: BelongsTo<typeof Thread>

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>

  @belongsTo(() => Article)
  declare article: BelongsTo<typeof Article>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>
}
