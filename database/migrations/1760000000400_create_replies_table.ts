import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A reply belongs to exactly one parent: a forum thread, a discussion
 * or an article (comments). Using one nullable FK per parent keeps real
 * foreign keys (with cascade) and plain hasMany relations in Lucid.
 */
export default class extends BaseSchema {
  protected tableName = 'replies'

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
        .integer('thread_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('threads')
        .onDelete('CASCADE')
      table
        .integer('discussion_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('discussions')
        .onDelete('CASCADE')
      table
        .integer('article_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('articles')
        .onDelete('CASCADE')
      table.text('body').notNullable()
      table.text('body_html').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['thread_id'])
      table.index(['discussion_id'])
      table.index(['article_id'])
      table.index(['user_id'])
    })

    this.schema.raw(
      'ALTER TABLE replies ADD CONSTRAINT replies_single_parent CHECK (num_nonnulls(thread_id, discussion_id, article_id) = 1)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
