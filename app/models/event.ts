import { EventSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import EventRegistration from '#models/event_registration'

export default class Event extends EventSchema {
  @belongsTo(() => User)
  declare organizer: BelongsTo<typeof User>

  @hasMany(() => EventRegistration)
  declare registrations: HasMany<typeof EventRegistration>
}
