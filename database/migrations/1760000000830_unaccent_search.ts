import { BaseSchema } from '@adonisjs/lucid/schema'
import { SEARCH_CONFIG, SEARCH_DOCUMENTS } from '#services/search_documents'

/**
 * Accent-insensitive French search: members often type "evenement" for
 * "événement" (mobile keyboards). Rebuilds the GIN indexes on the new config.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS unaccent')
    this.schema.raw(`DROP TEXT SEARCH CONFIGURATION IF EXISTS ${SEARCH_CONFIG}`)
    this.schema.raw(`CREATE TEXT SEARCH CONFIGURATION ${SEARCH_CONFIG} ( COPY = french )`)
    this.schema.raw(
      `ALTER TEXT SEARCH CONFIGURATION ${SEARCH_CONFIG} ALTER MAPPING FOR hword, hword_part, word WITH unaccent, french_stem`
    )
    for (const [table, document] of Object.entries(SEARCH_DOCUMENTS)) {
      this.schema.raw(`DROP INDEX IF EXISTS ${table}_search_idx`)
      this.schema.raw(`CREATE INDEX ${table}_search_idx ON ${table} USING GIN (${document})`)
    }
  }

  async down() {
    for (const table of Object.keys(SEARCH_DOCUMENTS)) {
      this.schema.raw(`DROP INDEX IF EXISTS ${table}_search_idx`)
    }
    this.schema.raw(`DROP TEXT SEARCH CONFIGURATION IF EXISTS ${SEARCH_CONFIG}`)
  }
}
