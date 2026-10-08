import { EventRegistrationSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Event from '#models/event'

export default class EventRegistration extends EventRegistrationSchema {
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
