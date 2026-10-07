import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discussion_tag'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('discussion_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('discussions')
        .onDelete('CASCADE')
      table
        .integer('tag_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')
      table.primary(['discussion_id', 'tag_id'])
      table.index(['tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
