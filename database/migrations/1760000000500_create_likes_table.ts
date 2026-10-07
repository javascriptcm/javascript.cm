import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'likes'

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

      table.timestamp('created_at', { useTz: true }).notNullable()

      table.unique(['user_id', 'article_id'])
      table.unique(['user_id', 'reply_id'])
      table.index(['article_id'])
      table.index(['reply_id'])
    })

    this.schema.raw(
      'ALTER TABLE likes ADD CONSTRAINT likes_single_target CHECK (num_nonnulls(article_id, reply_id) = 1)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
