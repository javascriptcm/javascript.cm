import { UserTokenSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

/**
 * One-time e-mail token (password reset, e-mail verification). Only the
 * SHA-256 hash of the token is stored.
 */
export default class UserToken extends UserTokenSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
