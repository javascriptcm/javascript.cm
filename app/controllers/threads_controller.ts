import { markSubjectRead } from '#services/notifications'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { errors as lucidErrors } from '@adonisjs/lucid'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Thread from '#models/thread'
import Channel from '#models/channel'
import Reply from '#models/reply'
import User from '#models/user'
import ThreadTransformer from '#transformers/thread_transformer'
import ChannelTransformer from '#transformers/channel_transformer'
import ReplyTransformer from '#transformers/reply_transformer'
import UserTransformer from '#transformers/user_transformer'
import { threadValidator } from '#validators/thread_validator'
import { plainExcerpt, renderMarkdown } from '#services/markdown'
import { uniqueSlug } from '#services/slug'
import { withReplyMeta } from '#services/reply_service'

const PER_PAGE = 20
export const THREAD_REPLIES_PER_PAGE = 50

const FILTERS = ['sans-reponse', 'non-resolues', 'resolues'] as const
type Filter = (typeof FILTERS)[number]

/**
 * "%term%" for ILIKE, with the LIKE wildcards of the term escaped.
 */
function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

function toPage(value: unknown) {
  const page = Number.parseInt(String(value ?? '1'), 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

/**
 * Count one view per visitor session (replying, accepting a solution or
 * reloading the page must not inflate the counter).
 */
function isFirstView(session: HttpContext['session'], key: string) {
  const seen: string[] = session.get('seen_content', [])
  if (seen.includes(key)) return false
  session.put('seen_content', [...seen.slice(-39), key])
  return true
}

export default class ThreadsController {
  /**
   * GET /forum — channel index, status filters, search.
   */
  async index({ request, inertia }: HttpContext) {
    const qs = request.qs()
    const q = typeof qs.q === 'string' ? qs.q.trim().slice(0, 120) : ''
    const filter: Filter | null = FILTERS.includes(qs.filter) ? qs.filter : null
    const page = toPage(qs.page)

    const channels = await Channel.query().withCount('threads').orderBy('position', 'asc')

    let channel: Channel | null = null
    if (typeof qs.channel === 'string' && qs.channel !== '') {
      channel = channels.find((c) => c.slug === qs.channel) ?? null
      if (!channel) throw new lucidErrors.E_ROW_NOT_FOUND(Channel)
    }

    // The current selection (channel + search), shared by the list and the stats.
    const selection = (query: ModelQueryBuilderContract<typeof Thread>) => {
      if (channel) query.where('channel_id', channel.id)
      if (q) {
        const pattern = likePattern(q)
        query.where((sub) => sub.whereILike('title', pattern).orWhereILike('body', pattern))
      }
      return query
    }

    const listQuery = selection(Thread.query().preload('author').preload('channel'))
    if (filter === 'sans-reponse') listQuery.where('replies_count', 0)
    if (filter === 'non-resolues') listQuery.whereNull('solution_reply_id')
    if (filter === 'resolues') listQuery.whereNotNull('solution_reply_id')

    const [threads, statsRows] = await Promise.all([
      listQuery
        .orderByRaw('pinned_at desc nulls last')
        .orderBy('last_activity_at', 'desc')
        .orderBy('id', 'desc')
        .paginate(page, PER_PAGE),
      selection(Thread.query())
        .select(
          db.raw('count(*)::int as total'),
          db.raw('count(*) filter (where solution_reply_id is not null)::int as solved'),
          db.raw('count(*) filter (where replies_count = 0)::int as unanswered')
        )
        .pojo<{ total: number; solved: number; unanswered: number }>(),
    ])

    const total = Number(statsRows[0]?.total ?? 0)
    const solved = Number(statsRows[0]?.solved ?? 0)
    const unanswered = Number(statsRows[0]?.unanswered ?? 0)

    return inertia.render('forum/index', {
      threads: ThreadTransformer.paginate(threads.all(), threads.getMeta()).useVariant('forList'),
      channels: ChannelTransformer.transform(channels),
      filters: { channel: channel?.slug ?? null, filter, q },
      stats: {
        total,
        solved,
        unanswered,
        unsolved: total - solved,
        solvedRate: total ? Math.round((solved / total) * 100) : 0,
        allThreads: channels.reduce((sum, c) => sum + Number(c.$extras.threads_count ?? 0), 0),
      },
    })
  }

  /**
   * GET /forum/nouveau
   */
  async create({ request, inertia }: HttpContext) {
    const channels = await Channel.query().orderBy('position', 'asc')
    const preselected = channels.find((c) => c.slug === request.qs().channel)
    return inertia.render('forum/create', {
      channels: ChannelTransformer.transform(channels),
      defaultChannelId: preselected?.id ?? null,
    })
  }

  /**
   * POST /forum
   */
  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(threadValidator)
    const thread = new Thread()
    thread.userId = auth.user!.id
    thread.channelId = data.channelId
    thread.title = data.title
    thread.body = data.body
    thread.bodyHtml = await renderMarkdown(data.body)
    thread.slug = await uniqueSlug('threads', data.title)
    thread.lastActivityAt = DateTime.now()
    await thread.save()

    session.flash('success', 'Votre question est publiée. La communauté va pouvoir vous répondre.')
    return response.redirect().toPath(`/forum/${thread.slug}`)
  }

  /**
   * GET /forum/:slug
   */
  async show({ params, request, auth, inertia, session }: HttpContext) {
    const viewer = auth.user ?? null
    const thread = await Thread.query()
      .where('slug', params.slug)
      .preload('author')
      .preload('channel')
      .firstOrFail()

    if (viewer) await markSubjectRead(viewer.id, { threadId: thread.id })

    if (viewer?.id !== thread.userId && isFirstView(session, `t${thread.id}`)) {
      await db.from('threads').where('id', thread.id).increment('views_count', 1)
      thread.viewsCount += 1
    }

    // Replies: everything on one page, unless the thread is very long.
    const repliesQuery = Reply.query().where('thread_id', thread.id)
    withReplyMeta(viewer)(repliesQuery)
    repliesQuery.orderBy('id', 'asc')

    const paginated = thread.repliesCount > THREAD_REPLIES_PER_PAGE
    let replies: Reply[]
    let repliesMeta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    } | null = null
    if (paginated) {
      const paginator = await repliesQuery.paginate(
        toPage(request.qs().page),
        THREAD_REPLIES_PER_PAGE
      )
      replies = paginator.all()
      const meta = paginator.getMeta()
      repliesMeta = {
        total: Number(meta.total),
        perPage: Number(meta.perPage),
        currentPage: Number(meta.currentPage),
        lastPage: Number(meta.lastPage),
      }
    } else {
      replies = await repliesQuery
    }

    // The accepted answer may live on another page of replies.
    let solution: Reply | null = null
    let solutionHref: string | null = null
    if (thread.solutionReplyId) {
      solution =
        replies.find((reply) => reply.id === thread.solutionReplyId) ??
        (await Reply.query().where('id', thread.solutionReplyId).preload('author').first())
      if (solution) {
        let solutionPage = 1
        if (paginated) {
          const [{ n }] = await db
            .from('replies')
            .where('thread_id', thread.id)
            .where('id', '<', solution.id)
            .count('* as n')
          solutionPage = Math.floor(Number(n) / THREAD_REPLIES_PER_PAGE) + 1
        }
        solutionHref = `${solutionPage > 1 ? `?page=${solutionPage}` : ''}#reponse-${solution.id}`
      }
    }

    const [participantRows, similar] = await Promise.all([
      db
        .from('replies')
        .select('user_id')
        .min('created_at as first_at')
        .where('thread_id', thread.id)
        .groupBy('user_id')
        .orderBy('first_at', 'asc'),
      Thread.query()
        .where('channel_id', thread.channelId)
        .whereNot('id', thread.id)
        .orderByRaw('solution_reply_id is null')
        .orderBy('last_activity_at', 'desc')
        .limit(5),
    ])

    const participantIds: number[] = participantRows.map((row) => Number(row.user_id))
    const participantUsers = participantIds.length
      ? await User.query().whereIn('id', participantIds.slice(0, 16))
      : []
    participantUsers.sort((a, b) => participantIds.indexOf(a.id) - participantIds.indexOf(b.id))

    return inertia.render('forum/show', {
      thread: ThreadTransformer.transform(thread).useVariant('forDetail'),
      replies: ReplyTransformer.transform(replies),
      repliesMeta,
      solution: solution ? ReplyTransformer.transform(solution) : null,
      solutionExcerpt: solution ? plainExcerpt(solution.body, 260) : null,
      solutionHref,
      participants: UserTransformer.transform(participantUsers),
      participantsCount: participantIds.length,
      similar: ThreadTransformer.transform(similar),
      can: {
        manage: Boolean(viewer && (await viewer.canManageContent(thread.userId))),
        moderate: Boolean(viewer?.isModerator),
      },
    })
  }

  /**
   * GET /forum/:slug/modifier
   */
  async edit({ params, auth, inertia, response, session }: HttpContext) {
    const thread = await Thread.query().where('slug', params.slug).preload('channel').firstOrFail()
    if (!(await auth.user!.canManageContent(thread.userId))) {
      session.flash('error', 'Vous ne pouvez pas modifier cette question.')
      return response.redirect().toPath(`/forum/${thread.slug}`)
    }
    const channels = await Channel.query().orderBy('position', 'asc')
    return inertia.render('forum/edit', {
      thread: ThreadTransformer.transform(thread).useVariant('forEdit'),
      channels: ChannelTransformer.transform(channels),
    })
  }

  /**
   * PUT /forum/:slug — the slug never changes (links stay valid).
   */
  async update({ params, request, auth, response, session }: HttpContext) {
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (!(await auth.user!.canManageContent(thread.userId))) {
      session.flash('error', 'Vous ne pouvez pas modifier cette question.')
      return response.redirect().toPath(`/forum/${thread.slug}`)
    }
    const data = await request.validateUsing(threadValidator)
    thread.title = data.title
    thread.channelId = data.channelId
    thread.body = data.body
    thread.bodyHtml = await renderMarkdown(data.body)
    await thread.save()

    session.flash('success', 'Question mise à jour.')
    return response.redirect().toPath(`/forum/${thread.slug}`)
  }

  /**
   * DELETE /forum/:slug — replies go with it (FK cascade).
   */
  async destroy({ params, auth, response, session }: HttpContext) {
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (!(await auth.user!.canManageContent(thread.userId))) {
      session.flash('error', 'Vous ne pouvez pas supprimer cette question.')
      return response.redirect().toPath(`/forum/${thread.slug}`)
    }
    await thread.delete()
    session.flash('success', 'La question a été supprimée.')
    return response.redirect().toPath('/forum')
  }
}
