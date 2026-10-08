import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Incremented when the password changes: sessions stamped with an older
 * version are signed out (see SilentAuthMiddleware).
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('session_version').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('session_version')
    })
  }
}
