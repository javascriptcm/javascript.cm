import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { roleValidator } from '#validators/admin_validator'
import { MEMBER_COUNTERS, likePattern } from '#controllers/members_controller'

const FILTERS = ['tous', 'equipe', 'suspendus'] as const
type Filter = (typeof FILTERS)[number]

const RANK = { member: 0, moderator: 1, admin: 2 } as const

export default class AdminMembersController {
  /**
   * GET /admin/membres — search, filter, moderate.
   */
  async index({ request, inertia, auth }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const q = String(request.input('q') ?? '')
      .trim()
      .slice(0, 80)
    const requested = request.input('filtre')
    const filter: Filter = FILTERS.includes(requested) ? requested : 'tous'
    const page = Math.max(1, Number.parseInt(request.input('page', '1'), 10) || 1)

    const query = User.query()
      .select('users.*')
      .select(db.raw(`${MEMBER_COUNTERS.articles} as articles_count`))
      .select(db.raw(`${MEMBER_COUNTERS.threads} as threads_count`))
      .select(db.raw(`${MEMBER_COUNTERS.replies} as replies_count`))

    if (q) {
      const pattern = likePattern(q.replace(/^@/, ''))
      query.where((builder) => {
        builder.whereILike('users.username', pattern).orWhereILike('users.name', pattern)
        // Only admins may look members up by e-mail.
        if (viewer.isAdmin) builder.orWhereILike('users.email', pattern)
      })
    }
    if (filter === 'equipe') query.whereIn('role', ['admin', 'moderator'])
    if (filter === 'suspendus') query.whereNotNull('banned_at')

    const [paginator, counts] = await Promise.all([
      query.orderBy('users.created_at', 'desc').orderBy('users.id', 'desc').paginate(page, 30),
      db
        .rawQuery(
          `select
            (select count(*) from users) as tous,
            (select count(*) from users where role in ('admin', 'moderator')) as equipe,
            (select count(*) from users where banned_at is not null) as suspendus`
        )
        .then((result) => result.rows[0]),
    ])

    const items = paginator.all()
    const meta = paginator.getMeta()

    return inertia.render('admin/members', {
      members: viewer.isAdmin
        ? UserTransformer.paginate(items, meta).useVariant('forAdmin')
        : UserTransformer.paginate(items, meta).useVariant('forModeration'),
      filters: { q, filter },
      counts: {
        tous: Number(counts.tous),
        equipe: Number(counts.equipe),
        suspendus: Number(counts.suspendus),
      },
    })
  }

  /**
   * PUT /admin/membres/:id/role — admins only (see routes).
   */
  async updateRole({ params, request, auth, response, session }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const member = await User.findOrFail(params.id)
    const { role } = await request.validateUsing(roleValidator)

    if (member.id === viewer.id) {
      session.flash('error', 'Vous ne pouvez pas modifier votre propre rôle.')
      return response.redirect().back()
    }
    if (member.isBanned && role !== 'member') {
      session.flash('error', 'Réactivez ce compte avant de lui confier un rôle.')
      return response.redirect().back()
    }

    member.role = role
    await member.save()

    const labels = { member: 'membre', moderator: 'modérateur', admin: 'administrateur' }
    session.flash('success', `@${member.username} est désormais ${labels[role]}.`)
    return response.redirect().back()
  }

  /**
   * POST /admin/membres/:id/ban — suspend an account.
   */
  async ban({ params, auth, response, session }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const member = await User.findOrFail(params.id)

    const refusal = this.cannotModerate(viewer, member)
    if (refusal) {
      session.flash('error', refusal)
      return response.redirect().back()
    }
    if (member.isBanned) {
      session.flash('error', `@${member.username} est déjà suspendu.`)
      return response.redirect().back()
    }

    member.bannedAt = DateTime.now()
    await member.save()
    // Close the "remember me" sessions; the auth middleware does the rest.
    await db.from('remember_me_tokens').where('tokenable_id', member.id).delete()

    session.flash('success', `Le compte @${member.username} est suspendu.`)
    return response.redirect().back()
  }

  /**
   * DELETE /admin/membres/:id/ban — lift a suspension.
   */
  async unban({ params, auth, response, session }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const member = await User.findOrFail(params.id)

    const refusal = this.cannotModerate(viewer, member)
    if (refusal) {
      session.flash('error', refusal)
      return response.redirect().back()
    }

    member.bannedAt = null
    await member.save()
    session.flash('success', `Le compte @${member.username} est réactivé.`)
    return response.redirect().back()
  }

  /**
   * Nobody moderates themselves; staff can only act on lower ranks
   * (moderators cannot touch the staff, admins cannot ban admins).
   */
  private cannotModerate(viewer: User, member: User): string | null {
    if (viewer.id === member.id) return 'Vous ne pouvez pas suspendre votre propre compte.'
    if (RANK[member.role] >= RANK[viewer.role]) {
      return viewer.isAdmin
        ? 'Retirez d’abord son rôle d’administrateur à ce compte.'
        : 'Seul un administrateur peut suspendre un membre de l’équipe.'
    }
    return null
  }
}
