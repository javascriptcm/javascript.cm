import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Reply from '#models/reply'

export default class User extends compose(
  UserSchema,
  withAuthFinder(hash, { uids: ['email', 'username'], passwordColumnName: 'password' })
) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  @hasMany(() => Article)
  declare articles: HasMany<typeof Article>

  @hasMany(() => Thread)
  declare threads: HasMany<typeof Thread>

  @hasMany(() => Discussion)
  declare discussions: HasMany<typeof Discussion>

  @hasMany(() => Reply)
  declare replies: HasMany<typeof Reply>

  get displayName() {
    return this.name || this.username
  }

  get initials() {
    const parts = this.displayName.trim().split(/\s+/)
    const [first, last] = parts
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return this.displayName.slice(0, 2).toUpperCase()
  }

  get isAdmin() {
    return this.role === 'admin'
  }

  get isModerator() {
    return this.role === 'admin' || this.role === 'moderator'
  }

  get isBanned() {
    return this.bannedAt !== null
  }

  /**
   * Drafts and other non-public content: visible to their owner and staff.
   */
  canSeeDraftsOf(ownerId: number) {
    return this.id === ownerId || this.isModerator
  }

  /**
   * Edit/delete rights on content owned by "ownerId": the owner, admins,
   * and moderators on regular members' content (never on other staff's).
   */
  async canManageContent(ownerId: number) {
    if (this.id === ownerId || this.isAdmin) return true
    if (!this.isModerator) return false
    const owner = await User.query().select('role').where('id', ownerId).first()
    return owner?.role === 'member'
  }
}
