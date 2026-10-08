import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Stable account identifiers returned by Google ("sub" claim) and Apple
 * ("sub" claim) for social sign-in. GitHub uses the existing "github_id".
 * OpenID Connect allows a "sub" of up to 255 ASCII characters.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('google_id', 255).nullable().unique()
      table.string('apple_id', 255).nullable().unique()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['google_id'])
      table.dropUnique(['apple_id'])
      table.dropColumn('google_id')
      table.dropColumn('apple_id')
    })
  }
}
