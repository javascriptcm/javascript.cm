import type { HttpContext } from '@adonisjs/core/http'
import Article from '#models/article'
import { replyValidator } from '#validators/reply_validator'
import { createReply } from '#services/reply_service'

/**
 * Comments on articles are replies (edit / delete / like go through the
 * shared /replies routes). Only published articles accept comments.
 */
export default class ArticleCommentsController {
  /**
   * POST /articles/:slug/comments
   */
  async store({ params, request, auth, response, session }: HttpContext) {
    const article = await Article.query()
      .where('slug', params.slug)
      .withScopes((scopes) => scopes.published())
      .firstOrFail()

    const { body } = await request.validateUsing(replyValidator)
    const reply = await createReply({ type: 'article', id: article.id }, auth.user!, body)

    session.flash('success', 'Commentaire publié.')
    return response.redirect().toPath(`/articles/${article.slug}#reponse-${reply.id}`)
  }
}
