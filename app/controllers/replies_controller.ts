import type { HttpContext } from '@adonisjs/core/http'
import Reply from '#models/reply'
import Like from '#models/like'
import { replyValidator } from '#validators/reply_validator'
import { deleteReply, replyLocation, updateReply } from '#services/reply_service'

/**
 * Edit / delete / like any reply (forum, discussion or article comment).
 * Creation lives with each parent (threads, discussions, articles).
 */
export default class RepliesController {
  async update({ params, request, auth, response, session }: HttpContext) {
    const reply = await Reply.findOrFail(params.id)
    if (!auth.user!.canManage(reply.userId)) {
      session.flash('error', 'Vous ne pouvez pas modifier cette réponse.')
      return response.redirect().back()
    }
    const { body } = await request.validateUsing(replyValidator)
    await updateReply(reply, body)
    session.flash('success', 'Réponse mise à jour.')
    return response.redirect().toPath(`${await replyLocation(reply)}#reponse-${reply.id}`)
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    const reply = await Reply.findOrFail(params.id)
    if (!auth.user!.canManage(reply.userId)) {
      session.flash('error', 'Vous ne pouvez pas supprimer cette réponse.')
      return response.redirect().back()
    }
    const location = await replyLocation(reply)
    await deleteReply(reply)
    session.flash('success', 'Réponse supprimée.')
    return response.redirect().toPath(location)
  }

  /**
   * Toggle the viewer's like on a reply.
   */
  async like({ params, auth, response }: HttpContext) {
    const reply = await Reply.findOrFail(params.id)
    const existing = await Like.query()
      .where('user_id', auth.user!.id)
      .where('reply_id', reply.id)
      .first()
    if (existing) await existing.delete()
    else if (reply.userId !== auth.user!.id)
      await Like.create({ userId: auth.user!.id, replyId: reply.id })
    return response.redirect().back()
  }
}
