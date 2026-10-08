import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Notification from '#models/notification'
import type { NotificationType } from '#models/notification'
import type { ReplyParent } from '#services/reply_service'

/**
 * In-app notifications.
 *
 * Write side: `notifyReply` (a reply was posted on a thread, a discussion or
 * an article) and `notifySolution` (an answer was accepted). Both are called
 * once the content is committed, and never throw: a notification failure is
 * logged, it must not break posting a reply.
 *
 * Coalescing: one UNREAD row per recipient and subject. A new reply bumps the
 * existing unread row (latest reply, latest actor, fresh created_at) instead
 * of piling up rows; once the row is read, the next reply starts a new one.
 * How many replies an unread row stands for is computed at read time
 * (`withReplyCounts`).
 */

type SubjectColumn = 'thread_id' | 'discussion_id' | 'article_id'

const SUBJECTS = {
  thread: { table: 'threads', column: 'thread_id', type: 'thread_reply', lock: 1 },
  discussion: { table: 'discussions', column: 'discussion_id', type: 'discussion_reply', lock: 2 },
  article: { table: 'articles', column: 'article_id', type: 'article_comment', lock: 3 },
} as const satisfies Record<
  ReplyParent['type'],
  { table: string; column: SubjectColumn; type: NotificationType; lock: number }
>

const SOLUTION_LOCK = 4

/**
 * The community lives in Cameroon: "today" and "this week" are WAT days,
 * whatever the server time zone.
 */
const COMMUNITY_ZONE = 'Africa/Douala'

/**
 * Serialize concurrent fan-outs on the same subject (two replies posted at
 * the same instant must not both insert an unread row for the same person).
 * Transaction-scoped: released on commit/rollback.
 */
async function lockSubject(trx: TransactionClientContract, kind: number, id: number) {
  await trx.rawQuery('select pg_advisory_xact_lock(?, ?)', [0x6e0 + kind, id])
}

type Delivery = {
  type: NotificationType
  column: SubjectColumn
  subjectId: number
  replyId: number
  actorId: number
}

/**
 * Bump the recipients' unread notification on this subject, insert one for
 * everybody else (single batched insert).
 */
async function deliver(trx: TransactionClientContract, recipients: number[], delivery: Delivery) {
  if (!recipients.length) return
  const now = new Date()

  const bumped: { user_id: number }[] = await trx
    .from('notifications')
    .whereIn('user_id', recipients)
    .where('type', delivery.type)
    .where(delivery.column, delivery.subjectId)
    .whereNull('read_at')
    .update({ actor_id: delivery.actorId, reply_id: delivery.replyId, created_at: now }, [
      'user_id',
    ])

  const done = new Set(bumped.map((row) => Number(row.user_id)))
  const fresh = recipients.filter((id) => !done.has(id))
  if (!fresh.length) return

  await trx.table('notifications').multiInsert(
    fresh.map((userId) => ({
      user_id: userId,
      actor_id: delivery.actorId,
      type: delivery.type,
      [delivery.column]: delivery.subjectId,
      reply_id: delivery.replyId,
      created_at: now,
    }))
  )
}

/**
 * A reply was posted: notify the author of the thread / discussion / article
 * and everyone who replied before. Never the replier, never banned members.
 */
export async function notifyReply(parent: ReplyParent, reply: { id: number; userId: number }) {
  const subject = SUBJECTS[parent.type]
  try {
    await db.transaction(async (trx) => {
      await lockSubject(trx, subject.lock, parent.id)

      const rows: { id: number }[] = await trx
        .from('users')
        .select('id')
        .whereNull('banned_at')
        .whereNot('id', reply.userId)
        .where((query) => {
          query
            .whereIn('id', (sub) =>
              sub.from(subject.table).select('user_id').where('id', parent.id)
            )
            .orWhereIn('id', (sub) =>
              sub.from('replies').select('user_id').where(subject.column, parent.id)
            )
        })

      await deliver(
        trx,
        rows.map((row) => Number(row.id)),
        {
          type: subject.type,
          column: subject.column,
          subjectId: parent.id,
          replyId: reply.id,
          actorId: reply.userId,
        }
      )
    })
  } catch (error) {
    logger.error(
      { err: error, replyId: reply.id, parent },
      'notifications: could not notify a new reply'
    )
  }
}

/**
 * An answer was accepted as the solution of a thread: tell its author.
 * Accepting, removing then accepting the same answer again notifies once.
 */
export async function notifySolution(
  threadId: number,
  reply: { id: number; userId: number },
  actorId: number
) {
  if (reply.userId === actorId) return
  try {
    await db.transaction(async (trx) => {
      await lockSubject(trx, SOLUTION_LOCK, threadId)

      const recipient = await trx
        .from('users')
        .select('id')
        .where('id', reply.userId)
        .whereNull('banned_at')
        .first()
      if (!recipient) return

      const already = await trx
        .from('notifications')
        .select('id')
        .where('user_id', reply.userId)
        .where('type', 'solution_accepted')
        .where('reply_id', reply.id)
        .first()
      if (already) return

      await deliver(trx, [reply.userId], {
        type: 'solution_accepted',
        column: 'thread_id',
        subjectId: threadId,
        replyId: reply.id,
        actorId,
      })
    })
  } catch (error) {
    logger.error(
      { err: error, replyId: reply.id, threadId },
      'notifications: could not notify an accepted solution'
    )
  }
}

/**
 * Same subject as the notification "n" (exactly one subject column is set,
 * so the comparisons on the two NULL columns are simply never true).
 */
const SAME_SUBJECT = (alias: string) =>
  `(${alias}.thread_id = n.thread_id or ${alias}.discussion_id = n.discussion_id or ${alias}.article_id = n.article_id)`

/**
 * For the UNREAD reply notifications of a page: how many replies each one
 * stands for ($extras.new_replies) and how many people wrote them
 * ($extras.actors_count). The recipient "last saw" the subject when they
 * last replied to it or read a notification about it: every reply by
 * someone else since then is new. One query for the whole page.
 */
export async function withReplyCounts(notifications: Notification[]) {
  const unread = notifications.filter(
    (notification) => notification.readAt === null && notification.type !== 'solution_accepted'
  )
  if (!unread.length) return

  const result = await db.rawQuery(
    `select n.id, count(r.id)::int as new_replies, count(distinct r.user_id)::int as actors_count
      from notifications n
      join replies r
        on ${SAME_SUBJECT('r')}
        and r.user_id <> n.user_id
        and r.created_at <= n.created_at
        and r.created_at > coalesce(
          greatest(
            (select max(o.created_at) from replies o
              where o.user_id = n.user_id and ${SAME_SUBJECT('o')}),
            (select max(p.read_at) from notifications p
              where p.user_id = n.user_id and p.type = n.type and p.read_at is not null
                and ${SAME_SUBJECT('p')})
          ),
          '-infinity'::timestamptz
        )
      where n.id in (${unread.map(() => '?').join(', ')})
      group by n.id`,
    unread.map((notification) => notification.id)
  )

  const counts = new Map<number, { new_replies: number; actors_count: number }>(
    result.rows.map((row: { id: number; new_replies: number; actors_count: number }) => [
      Number(row.id),
      row,
    ])
  )
  for (const notification of unread) {
    const row = counts.get(notification.id)
    notification.$extras.new_replies = Number(row?.new_replies ?? 1)
    notification.$extras.actors_count = Number(row?.actors_count ?? 1)
  }
}

export type RecencyGroup = 'today' | 'week' | 'older'

/**
 * "Aujourd’hui" (same WAT calendar day), "Cette semaine" (the 6 days
 * before), "Plus ancien".
 */
export function recencyGroup(date: DateTime, now: DateTime = DateTime.now()): RecencyGroup {
  const today = now.setZone(COMMUNITY_ZONE).startOf('day')
  const local = date.setZone(COMMUNITY_ZONE)
  if (local >= today) return 'today'
  if (local >= today.minus({ days: 6 })) return 'week'
  return 'older'
}

/**
 * Retention: delete READ notifications older than `days` days. Unread ones
 * are kept whatever their age. Returns the number of deleted rows.
 */
export async function pruneReadNotifications(days: number) {
  const cutoff = DateTime.now().minus({ days }).toJSDate()
  const deleted = await db
    .from('notifications')
    .whereNotNull('read_at')
    .where('created_at', '<', cutoff)
    .delete()
  return Number(deleted)
}

/**
 * Opening a thread, discussion or article reads its notifications: the
 * member has seen the new replies, the bell should not keep counting them.
 */
export async function markSubjectRead(
  userId: number,
  subject: { threadId: number } | { discussionId: number } | { articleId: number }
) {
  const [column, id] =
    'threadId' in subject
      ? ['thread_id', subject.threadId]
      : 'discussionId' in subject
        ? ['discussion_id', subject.discussionId]
        : ['article_id', subject.articleId]

  await db
    .from('notifications')
    .where('user_id', userId)
    .where(column, id)
    .whereNull('read_at')
    .update({ read_at: DateTime.now().toSQL() })
}
