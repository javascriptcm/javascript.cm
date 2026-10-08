import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One-time tokens sent by e-mail (password reset, address verification),
 * stored hashed, plus each member's e-mail preferences.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('user_tokens', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 24).notNullable()
      table.string('token_hash', 64).notNullable().unique()
      table.string('email', 254).nullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('used_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['user_id', 'type'])
    })

    this.schema.alterTable('users', (table) => {
      table.boolean('email_notifications').notNullable().defaultTo(true)
      table.boolean('weekly_digest').notNullable().defaultTo(true)
      table.string('locale', 5).nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('email_notifications')
      table.dropColumn('weekly_digest')
      table.dropColumn('locale')
    })
    this.schema.dropTable('user_tokens')
  }
}
