import { ReportSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Article from '#models/article'
import Reply from '#models/reply'

export type ReportReason = Report['reason']
export type ReportStatus = Report['status']

export default class Report extends ReportSchema {
  @belongsTo(() => User, { foreignKey: 'reporterId' })
  declare reporter: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'resolvedById' })
  declare resolvedBy: BelongsTo<typeof User>

  @belongsTo(() => Article)
  declare article: BelongsTo<typeof Article>

  @belongsTo(() => Thread)
  declare thread: BelongsTo<typeof Thread>

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>

  @belongsTo(() => Reply)
  declare reply: BelongsTo<typeof Reply>
}
