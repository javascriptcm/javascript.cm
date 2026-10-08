import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Professional profile: headline, availability, skills, extra links and an
 * optional CV (PDF stored outside public/, see app/services/cv_storage.ts).
 *
 * "skills" and "links" are jsonb arrays (validated by the application:
 * at most 12 skills and 4 links). "cv_path" is a storage key, never a URL.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('headline', 120).nullable()
      table.string('availability', 20).nullable()
      table.jsonb('skills').notNullable().defaultTo(this.raw(`'[]'::jsonb`))
      table.string('portfolio_url', 255).nullable()
      table.jsonb('links').notNullable().defaultTo(this.raw(`'[]'::jsonb`))
      table.string('cv_path', 255).nullable()
      table.string('cv_original_name', 150).nullable()
      table.integer('cv_size').nullable()
      table.timestamp('cv_uploaded_at', { useTz: true }).nullable()
      table.string('cv_visibility', 10).notNullable().defaultTo('members')
    })

    this.schema.raw(`
      alter table users
        add constraint users_availability_check
          check (availability is null or availability in ('open_to_work', 'freelance', 'hiring')),
        add constraint users_cv_visibility_check
          check (cv_visibility in ('public', 'members', 'private')),
        add constraint users_skills_array_check
          check (jsonb_typeof(skills) = 'array'),
        add constraint users_links_array_check
          check (jsonb_typeof(links) = 'array')
    `)

    // Directory filter "?disponibilite=…" (partial: most members leave it empty).
    this.schema.raw(
      `create index users_availability_index on users (availability) where availability is not null`
    )
  }

  async down() {
    this.schema.raw(`drop index if exists users_availability_index`)
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('headline')
      table.dropColumn('availability')
      table.dropColumn('skills')
      table.dropColumn('portfolio_url')
      table.dropColumn('links')
      table.dropColumn('cv_path')
      table.dropColumn('cv_original_name')
      table.dropColumn('cv_size')
      table.dropColumn('cv_uploaded_at')
      table.dropColumn('cv_visibility')
    })
  }
}
