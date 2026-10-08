import { MediaSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Media extends MediaSchema {
  static table = 'media'

  @belongsTo(() => User)
  declare uploader: BelongsTo<typeof User>

  get url() {
    return `/media/${this.key}`
  }
}
