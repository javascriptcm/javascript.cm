import { BaseSchema } from '@adonisjs/lucid/schema'
import { SEARCH_DOCUMENTS } from '#services/search_documents'

/**
 * French full-text indexes. The expressions come from
 * app/services/search_documents.ts so queries always match the index.
 */
export default class extends BaseSchema {
  async up() {
    for (const [table, document] of Object.entries(SEARCH_DOCUMENTS)) {
      this.schema.raw(`CREATE INDEX ${table}_search_idx ON ${table} USING GIN (${document})`)
    }
  }

  async down() {
    for (const table of Object.keys(SEARCH_DOCUMENTS)) {
      this.schema.raw(`DROP INDEX IF EXISTS ${table}_search_idx`)
    }
  }
}
