import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Generic notifications (job moderation, event reminders…) carry their own
 * sentence and link instead of a forum/article subject.
 */
export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('title', 200).nullable()
      table.string('url', 500).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title')
      table.dropColumn('url')
    })
  }
}
