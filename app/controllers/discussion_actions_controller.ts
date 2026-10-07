import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Discussion from '#models/discussion'
import { replyValidator } from '#validators/reply_validator'
import { createReply } from '#services/reply_service'
import { DISCUSSION_REPLIES_PER_PAGE } from '#controllers/discussions_controller'

/**
 * Replying to a discussion and moderation toggles (pin / lock).
 */
export default class DiscussionActionsController {
  /**
   * POST /discussions/:slug/replies
   */
  async reply({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const discussion = await Discussion.findByOrFail('slug', params.slug)
    if (discussion.isLocked && !user.isModerator) {
      session.flash(
        'error',
        'Cette discussion est verrouillée : elle n’accepte plus de nouvelles réponses.'
      )
      return response.redirect().toPath(`/discussions/${discussion.slug}`)
    }

    const { body } = await request.validateUsing(replyValidator)
    const reply = await createReply({ type: 'discussion', id: discussion.id }, user, body)

    const total = discussion.repliesCount + 1
    const page =
      total > DISCUSSION_REPLIES_PER_PAGE ? Math.ceil(total / DISCUSSION_REPLIES_PER_PAGE) : 1
    session.flash('success', 'Réponse publiée.')
    return response
      .redirect()
      .toPath(
        `/discussions/${discussion.slug}${page > 1 ? `?page=${page}` : ''}#reponse-${reply.id}`
      )
  }

  /**
   * POST /discussions/:slug/pin — moderators only, toggles.
   */
  async togglePin({ params, auth, response, session }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)
    if (!auth.user!.isModerator) {
      session.flash('error', 'Action réservée aux modérateurs.')
      return response.redirect().back()
    }
    const pinned = discussion.pinnedAt === null
    await db
      .from('discussions')
      .where('id', discussion.id)
      .update({ pinned_at: pinned ? new Date() : null })
    session.flash(
      'success',
      pinned ? 'Discussion épinglée en tête de liste.' : 'Discussion désépinglée.'
    )
    return response.redirect().back()
  }

  /**
   * POST /discussions/:slug/lock — moderators only, toggles.
   */
  async toggleLock({ params, auth, response, session }: HttpContext) {
    const discussion = await Discussion.findByOrFail('slug', params.slug)
    if (!auth.user!.isModerator) {
      session.flash('error', 'Action réservée aux modérateurs.')
      return response.redirect().back()
    }
    const locked = discussion.lockedAt === null
    await db
      .from('discussions')
      .where('id', discussion.id)
      .update({ locked_at: locked ? new Date() : null })
    session.flash(
      'success',
      locked ? 'Discussion verrouillée : plus de nouvelles réponses.' : 'Discussion déverrouillée.'
    )
    return response.redirect().back()
  }
}
