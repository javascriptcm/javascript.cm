import { ChannelSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Thread from '#models/thread'

export default class Channel extends ChannelSchema {
  @hasMany(() => Thread)
  declare threads: HasMany<typeof Thread>
}
