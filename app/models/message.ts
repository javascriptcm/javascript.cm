import Discussion from '#models/discussion'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare discussionId: number

  @column()
  declare senderId: number

  @column()
  declare type: 'text' | 'image' | 'video' | 'audio' | 'code'

  @column()
  declare content: string | null

  @column()
  declare fileUrl: string | null

  @column({
    prepare: (value: any[]) => JSON.stringify(value ?? []),
    consume: (value: string | null) => {
      if (!value) return []
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch {
        return []
      }
    },
  })
  declare history: any[]

  @column()
  declare status: 'normal' | 'edited' | 'deleted'

  @column()
  declare deletedBy: string | null

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>

  @belongsTo(() => User, { foreignKey: 'senderId' })
  declare sender: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
