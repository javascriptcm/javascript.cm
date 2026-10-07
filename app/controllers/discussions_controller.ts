import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { errors as lucidErrors } from '@adonisjs/lucid'
import Discussion from '#models/discussion'
import Tag from '#models/tag'
import Reply from '#models/reply'
import User from '#models/user'
import DiscussionTransformer from '#transformers/discussion_transformer'
import TagTransformer from '#transformers/tag_transformer'
import ReplyTransformer from '#transformers/reply_transformer'
import UserTransformer from '#transformers/user_transformer'
import { discussionValidator } from '#validators/discussion_validator'
import { renderMarkdown } from '#services/markdown'
import { uniqueSlug } from '#services/slug'
import { withReplyMeta } from '#services/reply_service'

const PER_PAGE = 20
export const DISCUSSION_REPLIES_PER_PAGE = 50

const SORTS = ['recentes', 'populaires', 'sans-reponse'] as const
type Sort = (typeof SORTS)[number]

function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

function toPage(value: unknown) {
  const page = Number.parseInt(String(value ?? '1'), 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

/**
 * One view per visitor session (see ThreadsController).
 */
function isFirstView(session: HttpContext['session'], key: string) {
  const seen: string[] = session.get('seen_content', [])
  if (seen.includes(key)) return false
  session.put('seen_content', [...seen.slice(-39), key])
  return true
}

function byName(tags: Tag[]) {
  return tags.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
}

/**
 * Attach the latest repliers (max 4, author excluded) and the number of
 * distinct participants to each discussion, in two queries for the page.
 */
async function attachParticipants(discussions: Discussion[]) {
  if (!discussions.length) return
  const rows: { discussion_id: number; user_id: number }[] = await db
    .from('replies')
    .select('discussion_id', 'user_id')
    .max('created_at as last_at')
    .whereIn(
      'discussion_id',
      discussions.map((d) => d.id)
    )
    .groupBy('discussion_id', 'user_id')
    .orderBy('last_at', 'desc')

  const authors = new Map(discussions.map((d) => [d.id, d.userId]))
  const latest = new Map<number, number[]>()
  const counts = new Map<number, number>()
  for (const row of rows) {
    const discussionId = Number(row.discussion_id)
    const userId = Number(row.user_id)
    if (userId === authors.get(discussionId)) continue
    counts.set(discussionId, (counts.get(discussionId) ?? 0) + 1)
    const list = latest.get(discussionId) ?? []
    if (list.length < 4) list.push(userId)
    latest.set(discussionId, list)
  }

  const userIds = [...new Set([...latest.values()].flat())]
  const users = userIds.length ? await User.query().whereIn('id', userIds) : []
  const byId = new Map(users.map((u) => [u.id, u]))

  for (const discussion of discussions) {
    discussion.$extras.participants = (latest.get(discussion.id) ?? [])
      .map((id) => byId.get(id))
      .filter(Boolean)
    // + 1: the author opened the conversation.
    discussion.$extras.participants_count = (counts.get(discussion.id) ?? 0) + 1
  }
}

export default class DiscussionsController {
  /**
   * GET /discussions — tag index, sort, search.
   */
  async index({ request, inertia }: HttpContext) {
    const qs = request.qs()
    const q = typeof qs.q === 'string' ? qs.q.trim().slice(0, 120) : ''
    const sort: Sort = SORTS.includes(qs.sort) ? qs.sort : 'recentes'
    const page = toPage(qs.page)

    // Most discussed first, then alphabetical with a French collation
    // (« Événements » sorts with the E, not after « Vue »).
    const allTags = await Tag.query().withCount('discussions')
    const tags = allTags.sort(
      (a, b) =>
        Number(b.$extras.discussions_count) - Number(a.$extras.discussions_count) ||
        a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    )

    let tag: Tag | null = null
    if (typeof qs.tag === 'string' && qs.tag !== '') {
      tag = tags.find((t) => t.slug === qs.tag) ?? null
      if (!tag) throw new lucidErrors.E_ROW_NOT_FOUND(Tag)
    }

    const query = Discussion.query().preload('author').preload('tags')
    if (tag) {
      const tagId = tag.id
      query.whereIn('id', (sub) =>
        sub.from('discussion_tag').select('discussion_id').where('tag_id', tagId)
      )
    }
    if (q) {
      const pattern = likePattern(q)
      query.where((sub) => sub.whereILike('title', pattern).orWhereILike('body', pattern))
    }

    if (sort === 'populaires') {
      query
        .orderBy('replies_count', 'desc')
        .orderBy('views_count', 'desc')
        .orderBy('last_activity_at', 'desc')
    } else if (sort === 'sans-reponse') {
      query.where('replies_count', 0).orderBy('created_at', 'desc')
    } else {
      query.orderByRaw('pinned_at desc nulls last').orderBy('last_activity_at', 'desc')
    }
    query.orderBy('id', 'desc')

    const [discussions, totals] = await Promise.all([
      query.paginate(page, PER_PAGE),
      db
        .rawQuery(
          `select
            (select count(*) from discussions)::int as discussions,
            (select count(*) from replies where discussion_id is not null and created_at > now() - interval '30 days')::int as replies_month,
            (select count(distinct user_id) from replies where discussion_id is not null)::int as voices`
        )
        .then(
          (result) =>
            result.rows[0] as { discussions: number; replies_month: number; voices: number }
        ),
    ])
    await attachParticipants(discussions.all())

    return inertia.render('discussions/index', {
      discussions: DiscussionTransformer.paginate(
        discussions.all(),
        discussions.getMeta()
      ).useVariant('forList'),
      tags: TagTransformer.transform(tags),
      filters: { tag: tag?.slug ?? null, sort, q },
      stats: {
        discussions: Number(totals.discussions),
        repliesThisMonth: Number(totals.replies_month),
        voices: Number(totals.voices),
      },
    })
  }

  /**
   * GET /discussions/nouvelle
   */
  async create({ request, inertia }: HttpContext) {
    const tags = byName(await Tag.query())
    const preselected = tags.find((t) => t.slug === request.qs().tag)
    return inertia.render('discussions/create', {
      tags: TagTransformer.transform(tags),
      defaultTagIds: preselected ? [preselected.id] : [],
    })
  }

  /**
   * POST /discussions
   */
  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(discussionValidator)
    const discussion = new Discussion()
    discussion.userId = auth.user!.id
    discussion.title = data.title
    discussion.body = data.body
    discussion.bodyHtml = await renderMarkdown(data.body)
    discussion.slug = await uniqueSlug('discussions', data.title)
    discussion.lastActivityAt = DateTime.now()

    await db.transaction(async (trx) => {
      discussion.useTransaction(trx)
      await discussion.save()
      await discussion.related('tags').sync(data.tags ?? [])
    })

    session.flash('success', 'Discussion lancée. À vous la parole !')
    return response.redirect().toPath(`/discussions/${discussion.slug}`)
  }

  /**
   * GET /discussions/:slug
   */
  async show({ params, request, auth, inertia, session }: HttpContext) {
    const viewer = auth.user ?? null
    const discussion = await Discussion.query()
      .where('slug', params.slug)
      .preload('author')
      .preload('tags')
      .firstOrFail()

    if (viewer?.id !== discussion.userId && isFirstView(session, `d${discussion.id}`)) {
      await db.from('discussions').where('id', discussion.id).increment('views_count', 1)
      discussion.viewsCount += 1
    }

    const repliesQuery = Reply.query().where('discussion_id', discussion.id)
    withReplyMeta(viewer)(repliesQuery)
    repliesQuery.orderBy('id', 'asc')

    let replies: Reply[]
    let repliesMeta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    } | null = null
    if (discussion.repliesCount > DISCUSSION_REPLIES_PER_PAGE) {
      const paginator = await repliesQuery.paginate(
        toPage(request.qs().page),
        DISCUSSION_REPLIES_PER_PAGE
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

    const tagIds = discussion.tags.map((t) => t.id)
    const relatedQuery = Discussion.query().whereNot('id', discussion.id).preload('author')
    if (tagIds.length) {
      relatedQuery.whereIn('id', (sub) =>
        sub.from('discussion_tag').select('discussion_id').whereIn('tag_id', tagIds)
      )
    }

    const [participantRows, tagRelated] = await Promise.all([
      db
        .from('replies')
        .select('user_id')
        .count('* as replies')
        .min('created_at as first_at')
        .where('discussion_id', discussion.id)
        .groupBy('user_id')
        .orderBy('first_at', 'asc'),
      relatedQuery.orderBy('last_activity_at', 'desc').limit(5),
    ])

    // Nothing shares a tag yet: fall back to the latest conversations.
    const related = tagRelated.length
      ? tagRelated
      : await Discussion.query()
          .whereNot('id', discussion.id)
          .preload('author')
          .orderBy('last_activity_at', 'desc')
          .limit(5)

    // The author opens the conversation: first in the participants strip.
    const participantIds: number[] = [
      discussion.userId,
      ...participantRows.map((row) => Number(row.user_id)).filter((id) => id !== discussion.userId),
    ]
    const others =
      participantIds.length > 1 ? await User.query().whereIn('id', participantIds.slice(1, 16)) : []
    const participants = [discussion.author, ...others].sort(
      (a, b) => participantIds.indexOf(a.id) - participantIds.indexOf(b.id)
    )

    return inertia.render('discussions/show', {
      discussion: DiscussionTransformer.transform(discussion).useVariant('forDetail'),
      replies: ReplyTransformer.transform(replies),
      repliesMeta,
      participants: UserTransformer.transform(participants),
      participantsCount: participantIds.length,
      related: DiscussionTransformer.transform(related),
      relatedByTags: tagRelated.length > 0,
      can: {
        manage: Boolean(viewer?.canManage(discussion.userId)),
        moderate: Boolean(viewer?.isModerator),
      },
    })
  }

  /**
   * GET /discussions/:slug/modifier
   */
  async edit({ params, auth, inertia, response, session }: HttpContext) {
    const discussion = await Discussion.query()
      .where('slug', params.slug)
      .preload('tags')
      .firstOrFail()
    if (!auth.user!.canManage(discussion.userId)) {
      session.flash('error', 'Vous ne pouvez pas modifier cette discussion.')
      return response.redirect().toPath(`/discussions/${discussion.slug}`)
    }
    const tags = byName(await Tag.query())
    return inertia.render('discussions/edit', {
      discussion: DiscussionTransformer.transform(discussion).useVariant('forEdit'),
      tags: TagTransformer.transform(tags),
    })
  }

  /**
   * PUT /discussions/:slug — the slug never changes.
   */
  async update({ params, request, auth, response, session }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)
    if (!auth.user!.canManage(discussion.userId)) {
      session.flash('error', 'Vous ne pouvez pas modifier cette discussion.')
      return response.redirect().toPath(`/discussions/${discussion.slug}`)
    }
    const data = await request.validateUsing(discussionValidator)
    discussion.title = data.title
    discussion.body = data.body
    discussion.bodyHtml = await renderMarkdown(data.body)

    await db.transaction(async (trx) => {
      discussion.useTransaction(trx)
      await discussion.save()
      await discussion.related('tags').sync(data.tags ?? [])
    })

    session.flash('success', 'Discussion mise à jour.')
    return response.redirect().toPath(`/discussions/${discussion.slug}`)
  }

  /**
   * DELETE /discussions/:slug
   */
  async destroy({ params, auth, response, session }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)
    if (!auth.user!.canManage(discussion.userId)) {
      session.flash('error', 'Vous ne pouvez pas supprimer cette discussion.')
      return response.redirect().toPath(`/discussions/${discussion.slug}`)
    }
    await discussion.delete()
    session.flash('success', 'La discussion a été supprimée.')
    return response.redirect().toPath('/discussions')
  }
}
