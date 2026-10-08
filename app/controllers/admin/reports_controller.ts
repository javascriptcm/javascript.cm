import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'
import Report from '#models/report'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Reply from '#models/reply'
import User from '#models/user'
import ReportTransformer, { type ReportQueueTarget } from '#transformers/report_transformer'
import { deleteReply } from '#services/reply_service'
import { plainExcerpt } from '#services/markdown'
import { THREAD_REPLIES_PER_PAGE } from '#controllers/threads_controller'
import { DISCUSSION_REPLIES_PER_PAGE } from '#controllers/discussions_controller'
import { REPORT_TARGETS, type ReportTarget } from '#validators/report_validator'

const TABS = { ouverts: 'open', traites: 'resolved', ignores: 'dismissed' } as const
type Tab = keyof typeof TABS
type Status = (typeof TABS)[Tab]

const PER_PAGE = 20

/**
 * Column of "replies" pointing at each kind of parent.
 */
const REPLY_PARENT_COLUMNS = {
  article: 'article_id',
  thread: 'thread_id',
  discussion: 'discussion_id',
} as const

type Row = { type: ReportTarget; id: number }

/**
 * Same rule as User.canManageContent, from an already loaded owner (the
 * queue lists up to 20 rows: no query per row).
 */
function canManage(viewer: User, owner: User | null) {
  if (!owner) return viewer.isAdmin
  if (viewer.id === owner.id || viewer.isAdmin) return true
  return viewer.isModerator && owner.role === 'member'
}

/**
 * Restrict a query on "reports" to the reports of one content.
 */
function ofTarget(query: DatabaseQueryBuilderContract, type: ReportTarget, id: number) {
  return query.where('target_type', type).where('target_id', id)
}

/**
 * Number of rows (distinct contents) per status, for the tabs.
 */
export async function reportQueueCounts(): Promise<Record<Status, number>> {
  const result = await db.rawQuery(
    `select status, count(*) as total from (
      select status from reports group by status, target_type, target_id
    ) as grouped group by status`
  )
  const counts: Record<Status, number> = { open: 0, resolved: 0, dismissed: 0 }
  for (const row of result.rows as { status: Status; total: string }[]) {
    counts[row.status] = Number(row.total)
  }
  return counts
}

/**
 * The moderation queue: what members reported, grouped by content. Reports
 * outlive their content (deleted from the queue or elsewhere): such rows
 * are shown from the snapshot taken when the report was filed.
 */
export default class AdminReportsController {
  /**
   * GET /admin/signalements?statut=ouverts|traites|ignores
   */
  async index({ request, inertia, auth }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const requested = String(request.input('statut') ?? '')
    const tab: Tab = Object.hasOwn(TABS, requested) ? (requested as Tab) : 'ouverts'
    const status = TABS[tab]
    const page = Math.max(1, Number.parseInt(request.input('page', '1'), 10) || 1)

    const groups = db
      .from('reports')
      .select('target_type', 'target_id')
      .select(db.raw('max(created_at) as last_reported_at'))
      .where('status', status)
      .groupBy('target_type', 'target_id')
    if (status === 'open') {
      groups.orderBy('last_reported_at', 'desc')
    } else {
      groups.orderByRaw('max(resolved_at) desc nulls last').orderBy('last_reported_at', 'desc')
    }
    groups.orderByRaw('max(id) desc')

    const [paginator, counts] = await Promise.all([
      groups.paginate(page, PER_PAGE),
      reportQueueCounts(),
    ])
    const rows: Row[] = (paginator.all() as { target_type: ReportTarget; target_id: number }[]).map(
      (row) => ({ type: row.target_type, id: Number(row.target_id) })
    )

    const ids: Record<ReportTarget, number[]> = {
      article: [],
      thread: [],
      discussion: [],
      reply: [],
    }
    for (const row of rows) ids[row.type].push(row.id)

    const [reports, articles, threads, discussions, replies] = rows.length
      ? await Promise.all([
          Report.query()
            .where('status', status)
            .where((query) => {
              for (const type of REPORT_TARGETS) {
                if (!ids[type].length) continue
                query.orWhere((sub) =>
                  sub.where('target_type', type).whereIn('target_id', ids[type])
                )
              }
            })
            .preload('reporter')
            .preload('resolvedBy')
            .orderBy('created_at', 'desc')
            .orderBy('id', 'desc'),
          Article.query()
            .select('id', 'user_id', 'title', 'slug', 'published_at')
            .whereIn('id', ids.article)
            .preload('author'),
          Thread.query()
            .select('id', 'user_id', 'title', 'slug')
            .whereIn('id', ids.thread)
            .preload('author'),
          Discussion.query()
            .select('id', 'user_id', 'title', 'slug')
            .whereIn('id', ids.discussion)
            .preload('author'),
          Reply.query()
            .select('replies.*')
            // Position among its siblings, to link to the right page of a long thread.
            .select(
              db.raw(
                `(select count(*) from replies as siblings
                  where (siblings.thread_id = replies.thread_id or siblings.discussion_id = replies.discussion_id)
                  and siblings.id < replies.id) as position`
              )
            )
            .whereIn('id', ids.reply)
            .preload('author')
            .preload('thread', (query) => query.select('id', 'title', 'slug'))
            .preload('discussion', (query) => query.select('id', 'title', 'slug'))
            .preload('article', (query) => query.select('id', 'title', 'slug', 'published_at')),
        ])
      : [[], [], [], [], []]

    const grouped = rows
      .map((row) => ({
        row,
        reports: reports.filter(
          (report) => report.targetType === row.type && report.targetId === row.id
        ),
        live: describe(row, { articles, threads, discussions, replies }),
      }))
      .filter((item) => item.reports.length)

    // Owners of deleted contents, from the snapshots.
    const missingOwnerIds = grouped
      .filter((item) => !item.live)
      .map((item) => item.reports.find((report) => report.targetOwnerId)?.targetOwnerId)
      .filter((id): id is number => typeof id === 'number')
    const owners = missingOwnerIds.length
      ? await User.query().whereIn('id', [...new Set(missingOwnerIds)])
      : []

    const leads = grouped.map(({ row, reports: group, live }) => {
      const content = live ?? snapshot(row, group, owners)
      const [lead] = group
      lead.$extras.queue = {
        target: content.target,
        owner: content.owner,
        reports: group,
        canDelete: !content.target.deleted && canManage(viewer, content.owner),
      }
      return lead
    })

    return inertia.render('admin/reports', {
      rows: ReportTransformer.paginate(leads, paginator.getMeta()).useVariant('forQueue').depth(3),
      tab,
      counts: {
        ouverts: counts.open,
        traites: counts.resolved,
        ignores: counts.dismissed,
      },
    })
  }

  /**
   * POST /admin/signalements/:target/:id/ignorer — the content stays online.
   */
  async dismiss(ctx: HttpContext) {
    return this.close(ctx, 'dismissed')
  }

  /**
   * POST /admin/signalements/:target/:id/traiter — handled another way
   * (content edited, author contacted…), or the content is already gone.
   */
  async resolve(ctx: HttpContext) {
    return this.close(ctx, 'resolved')
  }

  /**
   * DELETE /admin/signalements/:target/:id/contenu — remove the reported
   * content. Staff ranks apply: moderators cannot delete the staff's content.
   * Its reports stay, marked as resolved (with those of its replies, which
   * go with it).
   */
  async destroyContent({ params, auth, response, session }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const type = params.target as ReportTarget
    const id = Number(params.id)

    const open = await this.openReportsCount(type, id)
    if (!open) {
      session.flash('error', 'Ces signalements ont déjà été traités.')
      return response.redirect().back()
    }

    const content = await this.findContent(type, id)
    if (!content) {
      session.flash(
        'error',
        'Ce contenu a déjà été supprimé : marquez plutôt le signalement comme traité.'
      )
      return response.redirect().back()
    }
    if (!(await viewer.canManageContent(content.userId))) {
      session.flash(
        'error',
        'Seul un administrateur peut supprimer le contenu d’un membre de l’équipe.'
      )
      return response.redirect().back()
    }

    // Record the decision, then delete (the reports keep their target
    // identity and snapshot: ON DELETE SET NULL). Replies go through the
    // reply service so the thread / discussion counters stay right.
    const closed = await this.closeReports(type, id, 'resolved', viewer, { withReplies: true })
    try {
      if (content instanceof Reply) {
        await deleteReply(content)
      } else {
        await content.delete()
      }
    } catch (error) {
      await db
        .from('reports')
        .whereIn('id', closed)
        .update({ status: 'open', resolved_by_id: null, resolved_at: null })
      throw error
    }

    const label = closed.length > 1 ? `${closed.length} signalements clos` : 'signalement clos'
    session.flash('success', `Contenu supprimé, ${label}.`)
    return response.redirect().back()
  }

  private async close({ params, auth, response, session }: HttpContext, status: Status) {
    const viewer = auth.getUserOrFail()
    const closed = await this.closeReports(
      params.target as ReportTarget,
      Number(params.id),
      status,
      viewer
    )
    if (!closed.length) {
      session.flash('error', 'Ces signalements ont déjà été traités.')
      return response.redirect().back()
    }
    session.flash(
      'success',
      status === 'dismissed'
        ? 'Signalement ignoré : le contenu reste en ligne.'
        : 'Signalement marqué comme traité.'
    )
    return response.redirect().back()
  }

  /**
   * Close every open report of a content (and, when it is deleted, of its
   * replies). Returns the ids of the reports closed.
   */
  private async closeReports(
    type: ReportTarget,
    id: number,
    status: Status,
    viewer: User,
    options: { withReplies?: boolean } = {}
  ): Promise<number[]> {
    const now = DateTime.now().toSQL()
    const rows: { id: number }[] = await db
      .from('reports')
      .where('status', 'open')
      .where((query) => {
        query.where((sub) => ofTarget(sub, type, id))
        if (options.withReplies && type !== 'reply') {
          query.orWhere((sub) =>
            sub
              .where('target_type', 'reply')
              .whereIn(
                'target_id',
                db.from('replies').select('id').where(REPLY_PARENT_COLUMNS[type], id)
              )
          )
        }
      })
      .update({ status, resolved_by_id: viewer.id, resolved_at: now, updated_at: now }, ['id'])
    return rows.map((row) => row.id)
  }

  private async openReportsCount(type: ReportTarget, id: number) {
    const [row] = await ofTarget(db.from('reports'), type, id)
      .where('status', 'open')
      .count('* as total')
    return Number(row?.total ?? 0)
  }

  private async findContent(type: ReportTarget, id: number) {
    switch (type) {
      case 'article':
        return Article.find(id)
      case 'thread':
        return Thread.find(id)
      case 'discussion':
        return Discussion.find(id)
      case 'reply':
        return Reply.find(id)
    }
  }
}

type Described = { target: ReportQueueTarget; owner: User | null }

/**
 * A deleted content, as the reports remember it: label (title, or the
 * parent's title for a reply) and owner. No link.
 */
function snapshot(row: Row, reports: Report[], owners: User[]): Described {
  const label = reports.find((report) => report.targetLabel)?.targetLabel ?? null
  const ownerId = reports.find((report) => report.targetOwnerId)?.targetOwnerId ?? null
  const isReply = row.type === 'reply'
  return {
    target: {
      type: row.type,
      id: row.id,
      title: isReply ? '' : (label ?? ''),
      parent: isReply && label ? { type: null, title: label } : null,
      href: null,
      isDraft: false,
      deleted: true,
    },
    owner: owners.find((owner) => owner.id === ownerId) ?? null,
  }
}

/**
 * Title, link and owner of a reported content that still exists.
 */
function describe(
  row: Row,
  loaded: { articles: Article[]; threads: Thread[]; discussions: Discussion[]; replies: Reply[] }
): Described | null {
  const base = { type: row.type, id: row.id, parent: null, isDraft: false, deleted: false }
  switch (row.type) {
    case 'article': {
      const article = loaded.articles.find((item) => item.id === row.id)
      if (!article) return null
      return {
        target: {
          ...base,
          title: article.title,
          href: `/articles/${article.slug}`,
          isDraft: !article.isPublished,
        },
        owner: article.author ?? null,
      }
    }
    case 'thread': {
      const thread = loaded.threads.find((item) => item.id === row.id)
      if (!thread) return null
      return {
        target: { ...base, title: thread.title, href: `/forum/${thread.slug}` },
        owner: thread.author ?? null,
      }
    }
    case 'discussion': {
      const discussion = loaded.discussions.find((item) => item.id === row.id)
      if (!discussion) return null
      return {
        target: { ...base, title: discussion.title, href: `/discussions/${discussion.slug}` },
        owner: discussion.author ?? null,
      }
    }
    case 'reply': {
      const reply = loaded.replies.find((item) => item.id === row.id)
      if (!reply) return null
      const position = Number(reply.$extras.position ?? 0)
      const anchor = `#reponse-${reply.id}`
      const excerpt = plainExcerpt(reply.body, 280) || 'Réponse composée uniquement de code.'
      let parent: ReportQueueTarget['parent'] = null
      let href = anchor
      let isDraft = false
      if (reply.thread) {
        const page = Math.floor(position / THREAD_REPLIES_PER_PAGE) + 1
        parent = { type: 'thread', title: reply.thread.title }
        href = `/forum/${reply.thread.slug}${page > 1 ? `?page=${page}` : ''}${anchor}`
      } else if (reply.discussion) {
        const page = Math.floor(position / DISCUSSION_REPLIES_PER_PAGE) + 1
        parent = { type: 'discussion', title: reply.discussion.title }
        href = `/discussions/${reply.discussion.slug}${page > 1 ? `?page=${page}` : ''}${anchor}`
      } else if (reply.article) {
        parent = { type: 'article', title: reply.article.title }
        href = `/articles/${reply.article.slug}${anchor}`
        isDraft = !reply.article.isPublished
      }
      return {
        target: { ...base, title: excerpt, parent, href, isDraft },
        owner: reply.author ?? null,
      }
    }
  }
}
