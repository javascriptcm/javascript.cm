import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Members flag content for the moderators. Exactly one target is set.
 */
export default class extends BaseSchema {
  protected tableName = 'reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('reporter_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('article_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('articles')
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
        .integer('reply_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('replies')
        .onDelete('CASCADE')
      table.string('reason', 40).notNullable()
      table.string('details', 500).nullable()
      table.string('status', 20).notNullable().defaultTo('open')
      table
        .integer('resolved_by_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('resolved_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['status', 'created_at'])
    })

    this.schema.raw(
      'ALTER TABLE reports ADD CONSTRAINT reports_single_target CHECK (num_nonnulls(article_id, thread_id, discussion_id, reply_id) = 1)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
