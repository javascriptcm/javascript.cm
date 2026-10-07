import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { errors as lucidErrors } from '@adonisjs/lucid'
import Article from '#models/article'
import Like from '#models/like'
import type User from '#models/user'

/**
 * Load an article the user may manage (owner or moderator). Drafts of
 * other people stay invisible (404); published articles get a flash error.
 */
async function managedArticle(slug: string, user: User) {
  const article = await Article.findByOrFail('slug', slug)
  if (user.canManage(article.userId)) return { article, allowed: true as const }
  if (!article.isPublished) throw new lucidErrors.E_ROW_NOT_FOUND()
  return { article, allowed: false as const }
}

/**
 * One-click actions on an article: like, publish / unpublish, feature.
 */
export default class ArticleActionsController {
  /**
   * POST /articles/:slug/like — toggle the viewer's like.
   */
  async like({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const article = await Article.query()
      .where('slug', params.slug)
      .withScopes((scopes) => scopes.published())
      .firstOrFail()

    if (article.userId === user.id) {
      session.flash('error', 'Vous ne pouvez pas aimer votre propre article.')
      return response.redirect().back()
    }

    const existing = await Like.query()
      .where('user_id', user.id)
      .where('article_id', article.id)
      .first()
    if (existing) {
      await existing.delete()
    } else {
      try {
        await Like.create({ userId: user.id, articleId: article.id })
      } catch (error) {
        // Double click: the unique (user_id, article_id) index already holds it.
        if ((error as { code?: string }).code !== '23505') throw error
      }
    }
    return response.redirect().back()
  }

  /**
   * POST /articles/:slug/publish — publish a draft right away.
   */
  async publish({ params, auth, response, session }: HttpContext) {
    const { article, allowed } = await managedArticle(params.slug, auth.user!)
    if (!allowed) {
      session.flash('error', 'Seul l’auteur de cet article peut le publier.')
      return response.redirect().back()
    }

    if (!article.isPublished) {
      article.publishedAt = DateTime.now()
      await article.save()
      session.flash('success', 'Article publié. Merci pour ce partage !')
    }
    return response.redirect().toPath(`/articles/${article.slug}`)
  }

  /**
   * POST /articles/:slug/unpublish — back to draft (and off the front page).
   */
  async unpublish({ params, auth, response, session }: HttpContext) {
    const { article, allowed } = await managedArticle(params.slug, auth.user!)
    if (!allowed) {
      session.flash('error', 'Seul l’auteur de cet article peut le dépublier.')
      return response.redirect().back()
    }

    if (article.publishedAt) {
      article.publishedAt = null
      article.featuredAt = null
      await article.save()
    }
    session.flash('success', 'Article repassé en brouillon : il n’est plus visible publiquement.')
    return response.redirect().back()
  }

  /**
   * POST /articles/:slug/feature — moderators toggle "à la une".
   */
  async feature({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    if (!user.isModerator) {
      session.flash('error', 'Action réservée à l’équipe de modération.')
      return response.redirect().back()
    }

    const article = await Article.findByOrFail('slug', params.slug)
    if (!article.isPublished) {
      session.flash('error', 'Publiez l’article avant de le mettre à la une.')
      return response.redirect().back()
    }

    // Query update: featuring is editorial, not a content change (keeps updated_at).
    const featuring = article.featuredAt === null
    await Article.query()
      .where('id', article.id)
      .update({ featured_at: featuring ? DateTime.now().toSQL() : null })
    session.flash('success', featuring ? 'Article mis à la une.' : 'Article retiré de la une.')
    return response.redirect().back()
  }
}
