import { column } from '@adonisjs/lucid/orm'

/**
 * An extra link on a member profile (YouTube, Dev.to, Behance, Medium…).
 */
export type ProfileLink = { label: string; url: string }

/**
 * Column decorator for a jsonb column holding a JSON array (used by the
 * generated database/schema.ts through database/schema_rules.ts).
 *
 * node-postgres serializes JavaScript arrays as Postgres array literals
 * ("{a,b}"), which is not valid JSON: arrays are stringified on the way in.
 * jsonb values come back already parsed by the driver.
 */
export function jsonArrayColumn() {
  return column({
    prepare: (value: unknown) => JSON.stringify(Array.isArray(value) ? value : []),
    consume: (value: unknown) => {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value
      return Array.isArray(parsed) ? parsed : []
    },
  })
}
