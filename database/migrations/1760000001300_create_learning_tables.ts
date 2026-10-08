import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Learning paths (JavaScript, React, Node, TypeScript…), ordered steps and
 * each member's progress.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('learning_paths', (table) => {
      table.increments('id').notNullable()
      table.string('slug', 100).notNullable().unique()
      table.string('title', 120).notNullable()
      table.string('summary', 300).notNullable()
      table.text('description').nullable()
      table.text('description_html').nullable()
      table.string('level', 14).notNullable().defaultTo('debutant')
      table.smallint('position').notNullable().defaultTo(0)
      table.boolean('is_published').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })

    this.schema.createTable('learning_steps', (table) => {
      table.increments('id').notNullable()
      table
        .integer('path_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('learning_paths')
        .onDelete('CASCADE')
      table.string('slug', 120).notNullable()
      table.smallint('position').notNullable().defaultTo(0)
      table.string('title', 160).notNullable()
      table.text('body').notNullable()
      table.text('body_html').notNullable()
      table.string('resource_url', 500).nullable()
      table
        .integer('article_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('articles')
        .onDelete('SET NULL')
      table.smallint('estimated_minutes').notNullable().defaultTo(15)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['path_id', 'slug'])
      table.index(['path_id', 'position'])
    })

    this.schema.createTable('learning_progress', (table) => {
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('step_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('learning_steps')
        .onDelete('CASCADE')
      table.timestamp('completed_at', { useTz: true }).notNullable()
      table.primary(['user_id', 'step_id'])
    })
  }

  async down() {
    this.schema.dropTable('learning_progress')
    this.schema.dropTable('learning_steps')
    this.schema.dropTable('learning_paths')
  }
}
