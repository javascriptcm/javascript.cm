import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Reply from '#models/reply'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import type User from '#models/user'
import { renderMarkdown } from '#services/markdown'
import { notifyReply } from '#services/notifications'

export type ReplyParent =
  | { type: 'thread'; id: number }
  | { type: 'discussion'; id: number }
  | { type: 'article'; id: number }

const COLUMN = { thread: 'threadId', discussion: 'discussionId', article: 'articleId' } as const

/**
 * Create a reply, keep the parent's counters / activity timestamp in sync.
 */
export async function createReply(parent: ReplyParent, author: User, body: string) {
  // Render first: never hold a transaction open while markdown renders.
  const bodyHtml = await renderMarkdown(body)
  const created = await db.transaction(async (trx) => {
    const reply = new Reply().useTransaction(trx)
    reply.userId = author.id
    reply[COLUMN[parent.type]] = parent.id
    reply.body = body
    reply.bodyHtml = bodyHtml
    await reply.save()

    if (parent.type === 'thread' || parent.type === 'discussion') {
      await trx
        .from(parent.type === 'thread' ? 'threads' : 'discussions')
        .where('id', parent.id)
        .update({
          replies_count: trx.raw('replies_count + 1'),
          last_activity_at: DateTime.now().toSQL(),
        })
    }
    return reply
  })

  // Once committed: notify the author and previous participants (never throws).
  await notifyReply(parent, created)
  return created
}

export async function updateReply(reply: Reply, body: string) {
  reply.body = body
  reply.bodyHtml = await renderMarkdown(body)
  await reply.save()
  return reply
}

/**
 * Delete a reply and decrement the parent counter. A thread's solution
 * pointing at it is cleared by the FK (ON DELETE SET NULL).
 */
export async function deleteReply(reply: Reply) {
  await db.transaction(async (trx) => {
    // Two concurrent deletes: only the one that removed the row decrements.
    const deleted = await trx.from('replies').where('id', reply.id).delete()
    if (!Number(deleted)) return
    const parent = reply.threadId
      ? { table: 'threads', id: reply.threadId }
      : reply.discussionId
        ? { table: 'discussions', id: reply.discussionId }
        : null
    if (parent) {
      await trx
        .from(parent.table)
        .where('id', parent.id)
        .where('replies_count', '>', 0)
        .decrement('replies_count', 1)
    }
  })
}

/**
 * Query modifier: preload author, count likes and flag the viewer's likes.
 * Usage: withReplyMeta(user)(Reply.query().where('thread_id', id))
 * or inside preload: .preload('replies', (q) => withReplyMeta(user)(q))
 */
export function withReplyMeta(viewer?: User | null) {
  return (query: ModelQueryBuilderContract<typeof Reply>) => {
    query.preload('author').withCount('likes').orderBy('created_at', 'asc')
    if (viewer) {
      query
        .select('replies.*')
        .select(
          db.raw(
            'exists(select 1 from likes where likes.reply_id = replies.id and likes.user_id = ?) as liked_by_me',
            [viewer.id]
          )
        )
    }
  }
}

/**
 * The URL of the page that shows a reply (for redirects after edit/delete).
 */
export async function replyLocation(reply: Reply) {
  if (reply.threadId) {
    const thread = await Thread.findOrFail(reply.threadId)
    return `/forum/${thread.slug}`
  }
  if (reply.discussionId) {
    const discussion = await Discussion.findOrFail(reply.discussionId)
    return `/discussions/${discussion.slug}`
  }
  const { default: Article } = await import('#models/article')
  const article = await Article.findOrFail(reply.articleId!)
  return `/articles/${article.slug}`
}
