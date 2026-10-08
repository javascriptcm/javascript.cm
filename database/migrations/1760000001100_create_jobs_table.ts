import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Job board: offers and freelance missions, moderated before publication.
 */
export default class extends BaseSchema {
  protected tableName = 'jobs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('slug', 200).notNullable().unique()
      table.string('title', 160).notNullable()
      table.string('company_name', 120).notNullable()
      table.string('company_url', 255).nullable()
      table.string('company_logo_url', 500).nullable()
      table.string('location', 120).nullable()
      table.string('remote', 10).notNullable().defaultTo('onsite')
      table.string('contract', 12).notNullable()
      table.integer('salary_min').nullable()
      table.integer('salary_max').nullable()
      table.string('salary_currency', 3).notNullable().defaultTo('XAF')
      table.string('salary_period', 8).notNullable().defaultTo('month')
      table.text('description').notNullable()
      table.text('description_html').notNullable()
      table.string('apply_url', 500).nullable()
      table.string('apply_email', 254).nullable()
      table.jsonb('skills').notNullable().defaultTo('[]')
      table.string('status', 12).notNullable().defaultTo('pending')
      table.string('rejection_reason', 300).nullable()
      table.timestamp('published_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.timestamp('featured_until', { useTz: true }).nullable()
      table.integer('views_count').notNullable().defaultTo(0)
      table.integer('apply_clicks').notNullable().defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['status', 'published_at'])
      table.index(['user_id'])
    })
    this.schema.raw(
      "ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('pending', 'published', 'rejected', 'expired', 'closed'))"
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
