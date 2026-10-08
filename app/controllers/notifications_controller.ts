import { safeRedirectPath } from '#services/safe_redirect'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Notification from '#models/notification'
import NotificationTransformer from '#transformers/notification_transformer'
import { withReplyCounts } from '#services/notifications'
import { THREAD_REPLIES_PER_PAGE } from '#controllers/threads_controller'
import { DISCUSSION_REPLIES_PER_PAGE } from '#controllers/discussions_controller'

const PER_PAGE = 30

const FILTERS = ['toutes', 'non-lues'] as const
type Filter = (typeof FILTERS)[number]

function toPage(value: unknown) {
  const page = Number.parseInt(String(value ?? '1'), 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

/**
 * The page of a paginated thread / discussion that shows a given reply
 * (replies are listed by id, see ThreadsController#show).
 */
async function replyPage(
  column: 'thread_id' | 'discussion_id',
  parentId: number,
  replyId: number,
  repliesCount: number,
  perPage: number
) {
  if (repliesCount <= perPage) return 1
  const [{ n }] = await db
    .from('replies')
    .where(column, parentId)
    .where('id', '<', replyId)
    .count('* as n')
  return Math.floor(Number(n) / perPage) + 1
}

/**
 * Where a notification leads: the exact reply, on the right page.
 */
async function targetOf(notification: Notification) {
  // Generic notifications (jobs, events) carry their own same-site link.
  if (notification.url) return safeRedirectPath(notification.url, '') || null

  const anchor = notification.replyId ? `#reponse-${notification.replyId}` : ''

  if (notification.threadId !== null) {
    const thread = await db
      .from('threads')
      .select('slug', 'replies_count')
      .where('id', notification.threadId)
      .first()
    if (!thread) return null
    const page = notification.replyId
      ? await replyPage(
          'thread_id',
          notification.threadId,
          notification.replyId,
          Number(thread.replies_count),
          THREAD_REPLIES_PER_PAGE
        )
      : 1
    return `/forum/${thread.slug}${page > 1 ? `?page=${page}` : ''}${anchor}`
  }

  if (notification.discussionId !== null) {
    const discussion = await db
      .from('discussions')
      .select('slug', 'replies_count')
      .where('id', notification.discussionId)
      .first()
    if (!discussion) return null
    const page = notification.replyId
      ? await replyPage(
          'discussion_id',
          notification.discussionId,
          notification.replyId,
          Number(discussion.replies_count),
          DISCUSSION_REPLIES_PER_PAGE
        )
      : 1
    return `/discussions/${discussion.slug}${page > 1 ? `?page=${page}` : ''}${anchor}`
  }

  if (notification.articleId !== null) {
    const article = await db
      .from('articles')
      .select('slug')
      .where('id', notification.articleId)
      .first()
    return article ? `/articles/${article.slug}${anchor}` : null
  }

  return null
}

/**
 * The signed-in member's notification center. Every action is scoped to
 * the owner: someone else's notification is a 404.
 */
export default class NotificationsController {
  /**
   * GET /notifications — grouped by recency, "Toutes" / "Non lues".
   */
  async index({ auth, request, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const requested = request.input('filtre')
    const filter: Filter = FILTERS.includes(requested) ? requested : 'toutes'
    const page = toPage(request.input('page'))

    const query = Notification.query()
      .where('user_id', user.id)
      .preload('actor')
      .preload('thread', (q) => q.select('id', 'slug', 'title', 'user_id'))
      .preload('discussion', (q) => q.select('id', 'slug', 'title', 'user_id'))
      .preload('article', (q) => q.select('id', 'slug', 'title', 'user_id'))
      // plainExcerpt() only reads the first characters of the body.
      .preload('reply', (q) => q.select('id', db.raw('left(body, 1200) as body')))
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
    if (filter === 'non-lues') query.whereNull('read_at')

    const [paginator, counts] = await Promise.all([
      query.paginate(page, PER_PAGE),
      db
        .from('notifications')
        .where('user_id', user.id)
        .select(
          db.raw('count(*)::int as total'),
          db.raw('count(*) filter (where read_at is null)::int as unread')
        )
        .first(),
    ])
    await withReplyCounts(paginator.all())

    return inertia.render('notifications/index', {
      notifications: NotificationTransformer.paginate(paginator.all(), paginator.getMeta()),
      filter,
      counts: {
        toutes: Number(counts?.total ?? 0),
        nonLues: Number(counts?.unread ?? 0),
      },
    })
  }

  /**
   * GET /notifications/:id — mark as read, then go to the reply.
   *
   * From an Inertia visit, a 409 + X-Inertia-Redirect makes the client visit
   * the target itself, so the "#reponse-…" fragment survives (an XHR
   * following a 302 would drop it). A plain request gets a regular redirect.
   */
  async show({ params, auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const notification = await Notification.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (notification.readAt === null) {
      notification.readAt = DateTime.now()
      await notification.save()
    }

    const target = await targetOf(notification)
    if (!target) {
      session.flash('error', 'Ce contenu n’est plus disponible.')
      return response.redirect().toPath('/notifications')
    }

    if (request.header('x-inertia')) {
      response.header('X-Inertia-Redirect', target)
      return response.status(409).send('')
    }
    return response.redirect().toPath(target)
  }

  /**
   * POST /notifications/:id/read
   */
  async read({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const notification = await Notification.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (notification.readAt === null) {
      notification.readAt = DateTime.now()
      await notification.save()
    }
    return response.redirect().back()
  }

  /**
   * POST /notifications/read-all
   */
  async readAll({ auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const updated = await db
      .from('notifications')
      .where('user_id', user.id)
      .whereNull('read_at')
      .update({ read_at: new Date() })

    if (Number(updated)) {
      session.flash('success', 'Toutes vos notifications sont marquées comme lues.')
    }
    return response.redirect().back()
  }
}
