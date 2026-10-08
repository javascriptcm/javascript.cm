import { LearningStepSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LearningPath from '#models/learning_path'
import Article from '#models/article'

export default class LearningStep extends LearningStepSchema {
  @belongsTo(() => LearningPath, { foreignKey: 'pathId' })
  declare path: BelongsTo<typeof LearningPath>

  @belongsTo(() => Article)
  declare article: BelongsTo<typeof Article>
}
