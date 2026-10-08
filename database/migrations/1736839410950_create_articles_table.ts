import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

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
      table.string('title', 160).notNullable()
      table.string('slug', 200).notNullable().unique()
      table.string('excerpt', 300).nullable()
      table.text('body').notNullable()
      table.text('body_html').notNullable()
      table.string('cover_url', 500).nullable()
      table.smallint('reading_minutes').notNullable().defaultTo(1)
      table.integer('views_count').notNullable().defaultTo(0)
      table.timestamp('published_at', { useTz: true }).nullable().index()
      table.timestamp('featured_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
