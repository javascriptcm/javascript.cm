import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('discussion_id')
        .unsigned()
        .references('id')
        .inTable('discussions')
        .onDelete('CASCADE')
      table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enu('type', ['text', 'image', 'video', 'audio', 'code']).notNullable().defaultTo('text')
      table.text('content').nullable()
      table.string('file_url').nullable()
      table.json('history').nullable() // historique des versions
      table.enu('status', ['normal', 'edited', 'deleted']).defaultTo('normal')
      table.string('deleted_by').nullable() // 'admin' ou 'sender'
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
