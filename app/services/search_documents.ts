/**
 * Full-text "documents" (French stemming) indexed by GIN indexes. Search
 * queries must use these exact expressions for PostgreSQL to use the index.
 * Title words weigh more (A) than the body (B/C).
 */
export const SEARCH_DOCUMENTS = {
  articles: `(setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', coalesce(excerpt, '')), 'B') || setweight(to_tsvector('french', body), 'C'))`,
  threads: `(setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', body), 'C'))`,
  discussions: `(setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', body), 'C'))`,
} as const

export type SearchableTable = keyof typeof SEARCH_DOCUMENTS
