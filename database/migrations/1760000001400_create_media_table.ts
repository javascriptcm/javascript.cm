import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Images uploaded by members (articles, replies, event covers, sponsor
 * logos), re-encoded on upload and served from /media/<key>.
 */
export default class extends BaseSchema {
  protected tableName = 'media'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('key', 120).notNullable().unique()
      table.string('mime', 40).notNullable()
      table.integer('width').notNullable()
      table.integer('height').notNullable()
      table.integer('size').notNullable()
      table.string('alt', 200).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
