import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sponsors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 120).notNullable()
      table.string('slug', 140).notNullable().unique()
      table.string('tier', 12).notNullable().defaultTo('community')
      table.string('logo_url', 500).nullable()
      table.string('website_url', 255).nullable()
      table.string('description', 300).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.smallint('position').notNullable().defaultTo(0)
      table.date('starts_on').nullable()
      table.date('ends_on').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
