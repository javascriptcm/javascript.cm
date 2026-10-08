import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Meetups and community events, with registrations (RSVP + waitlist).
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('events', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('slug', 200).notNullable().unique()
      table.string('title', 160).notNullable()
      table.string('summary', 300).nullable()
      table.text('description').notNullable()
      table.text('description_html').notNullable()
      table.timestamp('starts_at', { useTz: true }).notNullable()
      table.timestamp('ends_at', { useTz: true }).nullable()
      table.string('format', 10).notNullable().defaultTo('in_person')
      table.string('city', 80).nullable()
      table.string('venue_name', 120).nullable()
      table.string('address', 255).nullable()
      table.string('map_url', 500).nullable()
      table.string('online_url', 500).nullable()
      table.string('cover_url', 500).nullable()
      table.integer('capacity').nullable()
      table.string('status', 10).notNullable().defaultTo('draft')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['status', 'starts_at'])
    })

    this.schema.createTable('event_registrations', (table) => {
      table.increments('id').notNullable()
      table
        .integer('event_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('events')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('status', 10).notNullable().defaultTo('going')
      table.string('ticket_code', 32).notNullable().unique()
      table.timestamp('checked_in_at', { useTz: true }).nullable()
      table.timestamp('reminded_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['event_id', 'user_id'])
      table.index(['event_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable('event_registrations')
    this.schema.dropTable('events')
  }
}
