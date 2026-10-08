import { LearningPathSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import LearningStep from '#models/learning_step'

/**
 * Member progress lives in the "learning_progress" table (composite key
 * user_id + step_id): query it with the db query builder.
 */
export default class LearningPath extends LearningPathSchema {
  @hasMany(() => LearningStep, { foreignKey: 'pathId' })
  declare steps: HasMany<typeof LearningStep>
}
