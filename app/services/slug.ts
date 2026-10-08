import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'

/**
 * Generate a URL slug for "title" that is unique within "table". When
 * the base slug is taken, a short random suffix is appended.
 */
export async function uniqueSlug(table: string, title: string, ignoreId?: number) {
  const base = string.slug(title, { lower: true, strict: true }).slice(0, 180) || 'sujet'

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${string.random(6).toLowerCase()}`
    const query = db.from(table).where('slug', candidate)
    if (ignoreId) query.whereNot('id', ignoreId)
    const taken = await query.first()
    if (!taken) return candidate
  }

  return `${base}-${Date.now().toString(36)}`
}
