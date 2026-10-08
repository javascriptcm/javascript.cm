import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Retention of in-app notifications: delete the READ ones older than N days
 * (unread notifications are always kept). Meant for a daily cron:
 *   node ace notifications:prune --days=90
 */
export default class PruneNotifications extends BaseCommand {
  static commandName = 'notifications:prune'
  static description = 'Delete read notifications older than N days (default 90)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ description: 'Age (in days) beyond which read notifications are deleted' })
  declare days?: number

  async run() {
    const days = this.days ?? 90
    if (!Number.isInteger(days) || days < 1) {
      this.logger.error('--days must be a positive whole number')
      this.exitCode = 1
      return
    }

    const { pruneReadNotifications } = await import('#services/notifications')
    const deleted = await pruneReadNotifications(days)
    this.logger.success(
      `${deleted} read notification${deleted === 1 ? '' : 's'} older than ${days} days deleted`
    )
  }
}
