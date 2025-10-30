import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'banned_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('discussion_id')
        .unsigned()
        .references('id')
        .inTable('discussions')
        .onDelete('CASCADE')
      table.integer('admin_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('reason').nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
