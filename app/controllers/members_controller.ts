import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'

/**
 * Per-member counters as correlated subqueries (one round trip, no N+1).
 */
export const MEMBER_COUNTERS = {
  articles: `(select count(*) from articles where articles.user_id = users.id and articles.published_at is not null and articles.published_at <= now())`,
  threads: `(select count(*) from threads where threads.user_id = users.id)`,
  replies: `(select count(*) from replies where replies.user_id = users.id)`,
}

/**
 * Escape LIKE wildcards typed by the visitor ("100%" must not match everything).
 */
export function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

const AVAILABILITY_FILTERS = ['open_to_work', 'freelance', 'hiring'] as const
type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number]

/**
 * Query-string text filter: trimmed, single-spaced, bounded.
 */
function textFilter(value: unknown, max: number) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export default class MembersController {
  /**
   * GET /membres — searchable directory of the community.
   * Filters: ?q= (name, @username, headline), ?competence= (exact skill,
   * case-insensitive), ?disponibilite=open_to_work|freelance|hiring,
   * ?ville= (accent-insensitive "contains" on the location).
   */
  async index({ request, inertia }: HttpContext) {
    const q = textFilter(request.input('q'), 60)
    const competence = textFilter(request.input('competence'), 30).replace(/^#+/, '')
    const requestedAvailability = request.input('disponibilite')
    const disponibilite: AvailabilityFilter | '' = AVAILABILITY_FILTERS.includes(
      requestedAvailability
    )
      ? requestedAvailability
      : ''
    const ville = textFilter(request.input('ville'), 60)
    const sort: 'recents' | 'actifs' = request.input('sort') === 'actifs' ? 'actifs' : 'recents'
    const page = Math.max(1, Number.parseInt(request.input('page', '1'), 10) || 1)

    const query = User.query()
      .whereNull('banned_at')
      .select('users.*')
      .select(db.raw(`${MEMBER_COUNTERS.articles} as articles_count`))
      .select(db.raw(`${MEMBER_COUNTERS.threads} as threads_count`))
      .select(db.raw(`${MEMBER_COUNTERS.replies} as replies_count`))

    if (q) {
      const pattern = likePattern(q.replace(/^@/, ''))
      query.where((builder) => {
        builder
          .whereILike('users.username', pattern)
          .orWhereILike('users.name', pattern)
          .orWhereILike('users.headline', pattern)
      })
    }
    if (competence) {
      query.whereRaw(
        `exists (select 1 from jsonb_array_elements_text(users.skills) as skill(name) where lower(skill.name) = lower(?))`,
        [competence]
      )
    }
    if (disponibilite) {
      query.where('users.availability', disponibilite)
    }
    if (ville) {
      query.whereRaw(`unaccent(coalesce(users.location, '')) ilike unaccent(?)`, [
        likePattern(ville),
      ])
    }

    if (sort === 'actifs') {
      query.orderByRaw(
        `(${MEMBER_COUNTERS.articles} + ${MEMBER_COUNTERS.threads} + ${MEMBER_COUNTERS.replies}) desc`
      )
    }
    query.orderBy('users.created_at', 'desc').orderBy('users.id', 'desc')

    const [paginator, total, popularSkills] = await Promise.all([
      query.paginate(page, 30),
      db
        .from('users')
        .whereNull('banned_at')
        .count('* as total')
        .first()
        .then((row) => Number(row?.total ?? 0)),
      this.popularSkills(),
    ])

    return inertia.render('members/index', {
      members: UserTransformer.paginate(paginator.all(), paginator.getMeta()).useVariant(
        'forDirectory'
      ),
      filters: { q, sort, competence, disponibilite, ville },
      totalMembers: total,
      popularSkills,
    })
  }

  /**
   * The most declared skills (shortcuts for the "?competence=" filter),
   * each with its most common spelling.
   */
  private async popularSkills() {
    const result = await db.rawQuery(
      `select mode() within group (order by skill.name) as name, count(*)::int as total
       from users, jsonb_array_elements_text(users.skills) as skill(name)
       where users.banned_at is null
       group by lower(skill.name)
       order by total desc, lower(skill.name) asc
       limit 12`
    )
    return (result.rows as { name: string; total: number }[]).map((row) => ({
      name: row.name,
      total: Number(row.total),
    }))
  }
}
