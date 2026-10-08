import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Give a member the "admin" or "moderator" role:
 *   node ace user:promote brightky --role=admin
 */
export default class PromoteUser extends BaseCommand {
  static commandName = 'user:promote'
  static description = 'Change the role of a member (admin, moderator or member)'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Username or e-mail of the member' })
  declare user: string

  @flags.string({ description: 'Role to assign', default: 'admin' })
  declare role: string

  async run() {
    const { default: User } = await import('#models/user')
    if (!['admin', 'moderator', 'member'].includes(this.role)) {
      this.logger.error('Role must be one of: admin, moderator, member')
      this.exitCode = 1
      return
    }

    const user = await User.query()
      .where('username', this.user.toLowerCase())
      .orWhere('email', this.user.toLowerCase())
      .first()

    if (!user) {
      this.logger.error(`No member found for "${this.user}"`)
      this.exitCode = 1
      return
    }

    user.role = this.role as 'admin' | 'moderator' | 'member'
    await user.save()
    this.logger.success(`@${user.username} is now ${this.role}`)
  }
}
