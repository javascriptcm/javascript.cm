import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Rich tag pages: a markdown presentation (resources, docs, tips).
 */
export default class extends BaseSchema {
  protected tableName = 'tags'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('body').nullable()
      table.text('body_html').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('body')
      table.dropColumn('body_html')
    })
  }
}
