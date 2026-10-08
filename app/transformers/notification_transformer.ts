import type Notification from '#models/notification'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'
import { plainExcerpt } from '#services/markdown'
import { recencyGroup } from '#services/notifications'

type SubjectKind = 'thread' | 'discussion' | 'article'

type Subject = {
  kind: SubjectKind
  title: string
  slug: string
  /** The recipient wrote it ("votre question" vs "la question"). */
  isMine: boolean
  /** The latest actor wrote it ("a répondu à sa question"). */
  byActor: boolean
}

/**
 * What the notification is about. Relations must be preloaded; a subject
 * that vanished in the meantime yields null.
 */
function subjectOf(notification: Notification): Subject | null {
  const content: { title: string; slug: string; userId: number } | null | undefined =
    notification.threadId !== null
      ? notification.thread
      : notification.discussionId !== null
        ? notification.discussion
        : notification.article
  if (!content) return null
  const kind: SubjectKind =
    notification.threadId !== null
      ? 'thread'
      : notification.discussionId !== null
        ? 'discussion'
        : 'article'
  return {
    kind,
    title: content.title,
    slug: content.slug,
    isMine: content.userId === notification.userId,
    byActor: content.userId === notification.actorId,
  }
}

export default class NotificationTransformer extends BaseTransformer<Notification> {
  /**
   * Notification center row. Counters ($extras) come from
   * `withReplyCounts()`; they are only computed for unread reply rows.
   */
  toObject() {
    const notification = this.resource
    const reply = notification.reply
    return {
      ...this.pick(notification, ['id', 'type', 'replyId', 'readAt', 'createdAt']),
      isRead: notification.isRead,
      group: recencyGroup(notification.createdAt),
      href: `/notifications/${notification.id}`,
      actor: UserTransformer.transform(this.whenLoaded(notification.actor)),
      subject: subjectOf(notification),
      excerpt: reply ? plainExcerpt(reply.body, 140) || null : null,
      newReplies: Number(notification.$extras.new_replies ?? 1),
      actorsCount: Number(notification.$extras.actors_count ?? 1),
    }
  }
}
