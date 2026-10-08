import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username', 40).notNullable().unique()
      table.string('name', 120).nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').nullable()
      table.string('avatar_url', 500).nullable()
      table.string('bio', 280).nullable()
      table.string('location', 100).nullable()
      table.string('website_url', 255).nullable()
      table.string('github_username', 40).nullable()
      table.string('twitter_username', 40).nullable()
      table.string('linkedin_username', 100).nullable()
      table.string('github_id', 40).nullable().unique()
      table.string('role', 20).notNullable().defaultTo('member')
      table.timestamp('banned_at', { useTz: true }).nullable()
      table.timestamp('email_verified_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
