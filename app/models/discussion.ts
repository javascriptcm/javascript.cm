import BannedUser from '#models/banned_user'
import Message from '#models/message'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Discussion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare banner: string | null

  @column()
  declare authorId: number

  @column()
  declare isPublic: boolean

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => BannedUser)
  declare bans: HasMany<typeof BannedUser>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
