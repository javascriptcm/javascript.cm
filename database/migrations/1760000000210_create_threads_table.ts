import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'threads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('channel_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')
      table.string('title', 160).notNullable()
      table.string('slug', 200).notNullable().unique()
      table.text('body').notNullable()
      table.text('body_html').notNullable()
      table.integer('views_count').notNullable().defaultTo(0)
      table.integer('replies_count').notNullable().defaultTo(0)
      table.timestamp('pinned_at', { useTz: true }).nullable()
      table.timestamp('locked_at', { useTz: true }).nullable()
      table.timestamp('last_activity_at', { useTz: true }).notNullable().index()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['user_id'])
      table.index(['channel_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
