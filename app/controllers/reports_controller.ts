import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import db from '@adonisjs/lucid/services/db'
import Report from '#models/report'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Reply from '#models/reply'
import type User from '#models/user'
import { reportValidator, type ReportTarget } from '#validators/report_validator'

const TARGET_ATTRIBUTE = {
  article: 'articleId',
  thread: 'threadId',
  discussion: 'discussionId',
  reply: 'replyId',
} as const satisfies Record<ReportTarget, keyof Report>

/**
 * Drafts stay invisible to everyone but their author and the staff.
 */
function assertArticleVisible(article: Article, viewer: User) {
  if (article.isPublished || viewer.canSeeDraftsOf(article.userId)) return
  throw new lucidErrors.E_ROW_NOT_FOUND()
}

/**
 * Owner and label (title, or the parent's title for a reply) of a piece of
 * content the viewer is allowed to see. Missing or invisible content
 * (someone else's draft, or a comment on it) is a 404.
 */
async function visibleTarget(
  target: ReportTarget,
  id: number,
  viewer: User
): Promise<{ ownerId: number; label: string | null }> {
  switch (target) {
    case 'article': {
      const article = await Article.findOrFail(id)
      assertArticleVisible(article, viewer)
      return { ownerId: article.userId, label: article.title }
    }
    case 'thread': {
      const thread = await Thread.findOrFail(id)
      return { ownerId: thread.userId, label: thread.title }
    }
    case 'discussion': {
      const discussion = await Discussion.findOrFail(id)
      return { ownerId: discussion.userId, label: discussion.title }
    }
    case 'reply': {
      const reply = await Reply.query()
        .where('id', id)
        .preload('thread', (query) => query.select('id', 'title'))
        .preload('discussion', (query) => query.select('id', 'title'))
        .preload('article', (query) => query.select('id', 'title', 'user_id', 'published_at'))
        .firstOrFail()
      if (reply.article) assertArticleVisible(reply.article, viewer)
      const parent = reply.thread ?? reply.discussion ?? reply.article
      return { ownerId: reply.userId, label: parent?.title ?? null }
    }
  }
}

/**
 * The partial unique index "reports_open_unique" refused a second open
 * report of the same member on the same content.
 */
function isDuplicateOpenReport(error: unknown) {
  const { code, constraint } = error as { code?: string; constraint?: string }
  return code === '23505' && constraint === 'reports_open_unique'
}

/**
 * Members flag content for the moderators ("Signaler").
 */
export default class ReportsController {
  /**
   * POST /signalements { target, id, reason, details? }
   */
  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { target, id, reason, details } = await request.validateUsing(reportValidator)

    const { ownerId, label } = await visibleTarget(target, id, user)
    if (ownerId === user.id) {
      session.flash('error', 'Vous ne pouvez pas signaler votre propre contenu.')
      return response.redirect().back()
    }

    const report = new Report()
    report.reporterId = user.id
    report.targetType = target
    report.targetId = id
    report[TARGET_ATTRIBUTE[target]] = id
    report.targetLabel = label ? label.slice(0, 200) : null
    report.targetOwnerId = ownerId
    report.reason = reason
    report.details = details ?? null
    report.status = 'open'

    // One open report per member and content, enforced by the database (no
    // race between two clicks). The savepoint keeps an outer transaction usable.
    try {
      await db.transaction(async (trx) => {
        report.useTransaction(trx)
        await report.save()
      })
    } catch (error) {
      if (!isDuplicateOpenReport(error)) throw error
      session.flash(
        'success',
        'Vous avez déjà signalé ce contenu : l’équipe de modération l’a bien dans sa file.'
      )
      return response.redirect().back()
    }

    session.flash('success', 'Merci, l’équipe de modération va examiner ce contenu.')
    return response.redirect().back()
  }
}
