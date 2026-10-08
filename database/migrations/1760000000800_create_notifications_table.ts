import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * In-app notifications: someone answered your question, commented your
 * article, accepted your answer… The subject columns point at the content
 * (cascade: notifications disappear with it).
 */
export default class extends BaseSchema {
  protected tableName = 'notifications'

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
        .integer('actor_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 40).notNullable()
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
      table
        .integer('reply_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('replies')
        .onDelete('CASCADE')
      table.timestamp('read_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['user_id', 'created_at'])
      table.index(['user_id', 'read_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
