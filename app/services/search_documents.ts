/**
 * Full-text search configuration: French stemming + accent folding
 * ("evenement" finds "événement"), created by migration 1760000000830.
 */
export const SEARCH_CONFIG = 'french_unaccent'

/**
 * Full-text "documents" indexed by GIN indexes. Search queries must use
 * these exact expressions for PostgreSQL to use the index.
 * Title words weigh more (A) than the body (B/C).
 */
export const SEARCH_DOCUMENTS = {
  articles: `(setweight(to_tsvector('${SEARCH_CONFIG}', coalesce(title, '')), 'A') || setweight(to_tsvector('${SEARCH_CONFIG}', coalesce(excerpt, '')), 'B') || setweight(to_tsvector('${SEARCH_CONFIG}', body), 'C'))`,
  threads: `(setweight(to_tsvector('${SEARCH_CONFIG}', coalesce(title, '')), 'A') || setweight(to_tsvector('${SEARCH_CONFIG}', body), 'C'))`,
  discussions: `(setweight(to_tsvector('${SEARCH_CONFIG}', coalesce(title, '')), 'A') || setweight(to_tsvector('${SEARCH_CONFIG}', body), 'C'))`,
} as const

export type SearchableTable = keyof typeof SEARCH_DOCUMENTS
