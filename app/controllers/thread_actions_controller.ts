import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Thread from '#models/thread'
import Reply from '#models/reply'
import { replyValidator } from '#validators/reply_validator'
import { solutionValidator } from '#validators/thread_validator'
import { createReply } from '#services/reply_service'
import { THREAD_REPLIES_PER_PAGE } from '#controllers/threads_controller'

/**
 * Everything that happens *on* a forum thread: replying, accepting a
 * solution, and moderation toggles (pin / lock).
 */
export default class ThreadActionsController {
  /**
   * POST /forum/:slug/replies
   */
  async reply({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (thread.isLocked && !user.isModerator) {
      session.flash('error', 'Ce sujet est verrouillé : il n’accepte plus de nouvelles réponses.')
      return response.redirect().toPath(`/forum/${thread.slug}`)
    }

    const { body } = await request.validateUsing(replyValidator)
    const reply = await createReply({ type: 'thread', id: thread.id }, user, body)

    const total = thread.repliesCount + 1
    const page = total > THREAD_REPLIES_PER_PAGE ? Math.ceil(total / THREAD_REPLIES_PER_PAGE) : 1
    session.flash('success', 'Réponse publiée. Merci pour votre aide !')
    return response
      .redirect()
      .toPath(`/forum/${thread.slug}${page > 1 ? `?page=${page}` : ''}#reponse-${reply.id}`)
  }

  /**
   * POST /forum/:slug/solution { replyId } — thread author or moderators,
   * on a reply of this thread written by someone else.
   */
  async markSolution({ params, request, auth, response, session }: HttpContext) {
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (!(await auth.user!.canManageContent(thread.userId))) {
      session.flash('error', 'Seul l’auteur de la question peut choisir la solution.')
      return response.redirect().back()
    }

    const { replyId } = await request.validateUsing(solutionValidator)
    const reply = await Reply.query().where('id', replyId).where('thread_id', thread.id).first()
    if (!reply) {
      session.flash('error', 'Cette réponse n’appartient pas à cette question.')
      return response.redirect().back()
    }
    if (reply.userId === thread.userId) {
      session.flash('error', 'La solution doit venir d’une réponse d’un autre membre.')
      return response.redirect().back()
    }

    // Plain update: accepting an answer is not an edit of the question.
    await db.from('threads').where('id', thread.id).update({ solution_reply_id: reply.id })
    session.flash('success', 'Réponse marquée comme solution.')
    return response.redirect().back()
  }

  /**
   * DELETE /forum/:slug/solution
   */
  async unmarkSolution({ params, auth, response, session }: HttpContext) {
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (!(await auth.user!.canManageContent(thread.userId))) {
      session.flash('error', 'Seul l’auteur de la question peut retirer la solution.')
      return response.redirect().back()
    }
    await db.from('threads').where('id', thread.id).update({ solution_reply_id: null })
    session.flash('success', 'La solution a été retirée. La question est de nouveau ouverte.')
    return response.redirect().back()
  }

  /**
   * POST /forum/:slug/pin — moderators only, toggles.
   */
  async togglePin({ params, auth, response, session }: HttpContext) {
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (!auth.user!.isModerator) {
      session.flash('error', 'Action réservée aux modérateurs.')
      return response.redirect().back()
    }
    const pinned = thread.pinnedAt === null
    await db
      .from('threads')
      .where('id', thread.id)
      .update({ pinned_at: pinned ? new Date() : null })
    session.flash(
      'success',
      pinned ? 'Question épinglée en haut du forum.' : 'Question désépinglée.'
    )
    return response.redirect().back()
  }

  /**
   * POST /forum/:slug/lock — moderators only, toggles.
   */
  async toggleLock({ params, auth, response, session }: HttpContext) {
    const thread = await Thread.findByOrFail('slug', params.slug)
    if (!auth.user!.isModerator) {
      session.flash('error', 'Action réservée aux modérateurs.')
      return response.redirect().back()
    }
    const locked = thread.lockedAt === null
    await db
      .from('threads')
      .where('id', thread.id)
      .update({ locked_at: locked ? new Date() : null })
    session.flash(
      'success',
      locked ? 'Sujet verrouillé : plus de nouvelles réponses.' : 'Sujet déverrouillé.'
    )
    return response.redirect().back()
  }
}
