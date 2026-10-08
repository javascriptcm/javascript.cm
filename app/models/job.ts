import { DateTime } from 'luxon'
import { JobSchema } from '#database/schema'
import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Job extends JobSchema {
  @belongsTo(() => User)
  declare poster: BelongsTo<typeof User>

  /**
   * Published and not expired: what the public board shows.
   */
  static visible = scope((query) => {
    query
      .where('status', 'published')
      .where((q) => q.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL()!))
  })

  get isFeatured() {
    return this.featuredUntil !== null && this.featuredUntil > DateTime.now()
  }
}
