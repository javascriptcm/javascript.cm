import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'threads'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('solution_reply_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('replies')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('solution_reply_id')
    })
  }
}
