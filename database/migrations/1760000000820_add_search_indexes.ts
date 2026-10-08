import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * French full-text indexes (first version, plain "french" config). Frozen:
 * migration 1760000000830 replaces them with accent-insensitive ones.
 */
const DOCUMENTS = {
  articles: `(setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', coalesce(excerpt, '')), 'B') || setweight(to_tsvector('french', body), 'C'))`,
  threads: `(setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', body), 'C'))`,
  discussions: `(setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', body), 'C'))`,
}

export default class extends BaseSchema {
  async up() {
    for (const [table, document] of Object.entries(DOCUMENTS)) {
      this.schema.raw(`CREATE INDEX ${table}_search_idx ON ${table} USING GIN (${document})`)
    }
  }

  async down() {
    for (const table of Object.keys(DOCUMENTS)) {
      this.schema.raw(`DROP INDEX IF EXISTS ${table}_search_idx`)
    }
  }
}
