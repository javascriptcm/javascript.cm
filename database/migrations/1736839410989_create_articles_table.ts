import { ARTICLE_STATUS_LIST, ArticleStatus } from '#enums/article_status'
import { BaseSchema } from '@adonisjs/lucid/schema'
export default class extends BaseSchema {
  protected tableName = 'articles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('slug').unique().notNullable()
      table.text('excerpt').notNullable()
      table.text('content').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enu('status', ARTICLE_STATUS_LIST).defaultTo(ArticleStatus.DRAFT)
      table.timestamp('published_at').nullable()
      table.string('cover_image').nullable()
      table.string('canonical_url').nullable()
      table.string('tags', 255).nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
