import { ArticleStatus } from '#enums/article_status'
import { Role } from '#enums/role'
import Article from '#models/article'
import ArticleStatsService from '#services/article_stats_service'
import { articleValidator } from '#validators/article_validator'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ArticlesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const articles = await Article.query()
      .preload('author')
      .where('status', ArticleStatus.PUBLISHED)
      .orderBy('published_at', 'desc')
      .paginate(page, 10)

    return inertia.render('articles/index', {
      articles: articles.toJSON(),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('articles/create')
  }

  async store({ request, auth, response }: HttpContext) {
    const data = await articleValidator.validate(request.all())

    const payload: Partial<Article> = { ...data, authorId: auth.user!.id }

    if (data.status === ArticleStatus.PUBLISHED) {
      payload.publishedAt = DateTime.now()
    }

    payload.slug = Article.generateSlug(data.title)

    console.log('payload', payload)

    const article = await Article.create(payload)

    console.log('article', article)

    return response.redirect().toRoute('articles.show', { slug: article.slug })
  }

  async show({ inertia, params }: HttpContext) {
    const article = await Article.query().where('slug', params.slug).preload('author').firstOrFail()

    return inertia.render('articles/[slug]', { article })
  }

  async dashboard({ inertia, auth }: HttpContext) {
    const isAdmin = auth.user!.role === Role.ADMIN
    const stats = await ArticleStatsService.getStats(auth.user!.id, isAdmin)
    return inertia.render('dashboard/index', {
      publishedArticles: stats.published,
      draftArticles: stats.drafts,
      bannedArticles: stats.banned,
      discussions: 0,
      questions: 0,
    })
  }

  async articles({ inertia, request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', null)
    const isAdmin = auth.user!.role === Role.ADMIN

    let query = Article.query().preload('author').orderBy('created_at', 'desc')

    // Logique différente selon le rôle
    if (isAdmin) {
      // Admin : voir tous les articles publiés/banned + ses propres brouillons
      if (status && Object.values(ArticleStatus).includes(status as ArticleStatus)) {
        if (status === ArticleStatus.PUBLISHED) {
          // Voir tous les articles publiés (de tous les auteurs)
          query.where('status', ArticleStatus.PUBLISHED)
        } else if (status === ArticleStatus.BANNED) {
          // Voir tous les articles banned (de tous les auteurs)
          query.where('status', ArticleStatus.BANNED)
        } else {
          // Voir uniquement ses propres brouillons
          query.where('status', status as ArticleStatus).where('author_id', auth.user!.id)
        }
      } else {
        // Par défaut : tous les publiés + ses brouillons
        query.where((builder) => {
          builder
            .where('status', ArticleStatus.PUBLISHED)
            .orWhere((subBuilder) => {
              subBuilder.where('author_id', auth.user!.id).where('status', ArticleStatus.DRAFT)
            })
        })
      }
    } else {
      // Membre : voir uniquement ses propres articles
      query.where('author_id', auth.user!.id)

      if (status && Object.values(ArticleStatus).includes(status as ArticleStatus)) {
        query.where('status', status as ArticleStatus)
      }
    }

    const articles = await query.paginate(page, 10)

    return inertia.render('dashboard/articles', {
      articles: articles.toJSON(),
      currentStatus: status,
      isAdmin,
    })
  }

  async edit({ inertia, params, auth, response }: HttpContext) {
    const article = await Article.query()
      .where('slug', params.slug)
      .where('author_id', auth.user!.id)
      .firstOrFail()

    return inertia.render('dashboard/articles/edit', { article })
  }

  async update({ request, params, auth, response }: HttpContext) {
    const article = await Article.query()
      .where('slug', params.slug)
      .where('author_id', auth.user!.id)
      .firstOrFail()

    const data = await articleValidator.validate(request.all())

    const payload: Partial<Article> = { ...data }

    // Si on passe de draft/waiting à published, mettre à jour publishedAt
    if (
      data.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      payload.publishedAt = DateTime.now()
    }

    // Si le titre change, générer un nouveau slug
    if (data.title !== article.title) {
      payload.slug = Article.generateSlug(data.title)
    }

    await article.merge(payload).save()

    return response.redirect().toRoute('articles.show', { slug: article.slug })
  }

  // ADMIN METHODS

  /**
   * Liste des articles pour l'admin
   * - Tous les articles publiés (de tous les auteurs)
   * - Ses propres brouillons seulement
   */
  async adminArticles({ inertia, request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', null)

    let query = Article.query().preload('author').orderBy('created_at', 'desc')

    if (status && Object.values(ArticleStatus).includes(status as ArticleStatus)) {
      if (status === ArticleStatus.PUBLISHED) {
        // Admin voit tous les articles publiés
        query.where('status', ArticleStatus.PUBLISHED)
      } else {
        // Admin ne voit que ses propres brouillons/en attente
        query.where('status', status as ArticleStatus).where('author_id', auth.user!.id)
      }
    } else {
      // Par défaut : tous les publiés + ses brouillons
      query.where((builder) => {
        builder
          .where('status', ArticleStatus.PUBLISHED)
          .orWhere((subBuilder) => {
            subBuilder.where('author_id', auth.user!.id).whereIn('status', [
              ArticleStatus.DRAFT,
              ArticleStatus.WAITING_APPROVAL,
            ])
          })
      })
    }

    const articles = await query.paginate(page, 10)

    return inertia.render('admin/articles', {
      articles: articles.toJSON(),
      currentStatus: status,
    })
  }

  /**
   * Dépublier un article (admin seulement)
   * Passe le statut de PUBLISHED à DRAFT
   */
  async unpublish({ params, response, session, auth }: HttpContext) {
    const article = await Article.query().where('slug', params.slug).firstOrFail()

    // Vérifier que l'article est publié
    if (article.status !== ArticleStatus.PUBLISHED) {
      session.flash('error', 'Cet article n\'est pas publié')
      return response.redirect().back()
    }

    // Dépublier l'article
    article.status = ArticleStatus.DRAFT
    article.publishedAt = null
    await article.save()

    session.flash('success', 'Article dépublié avec succès')
    return response.redirect().back()
  }

  /**
   * Bannir un article (admin seulement)
   */
  async ban({ params, request, response, session }: HttpContext) {
    const article = await Article.query().where('slug', params.slug).firstOrFail()
    const banReason = request.input('ban_reason')

    article.status = ArticleStatus.BANNED
    article.banReason = banReason
    article.publishedAt = null
    await article.save()

    session.flash('success', 'Article banni avec succès')
    return response.redirect().back()
  }

  /**
   * Débannir un article (admin seulement)
   */
  async unban({ params, response, session }: HttpContext) {
    const article = await Article.query().where('slug', params.slug).firstOrFail()

    // Vérifier que l'article est banni
    if (article.status !== ArticleStatus.BANNED) {
      session.flash('error', 'Cet article n\'est pas banni')
      return response.redirect().back()
    }

    // Débannir l'article (le repasser en brouillon)
    article.status = ArticleStatus.DRAFT
    article.banReason = null
    await article.save()

    session.flash('success', 'Article débanni avec succès')
    return response.redirect().back()
  }
}
