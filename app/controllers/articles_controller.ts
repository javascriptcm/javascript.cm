import { markSubjectRead } from '#services/notifications'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { errors as lucidErrors } from '@adonisjs/lucid'
import Article from '#models/article'
import Tag from '#models/tag'
import Like from '#models/like'
import Reply from '#models/reply'
import type User from '#models/user'
import ArticleTransformer from '#transformers/article_transformer'
import TagTransformer from '#transformers/tag_transformer'
import UserTransformer from '#transformers/user_transformer'
import ReplyTransformer from '#transformers/reply_transformer'
import { articleValidator } from '#validators/article_validator'
import { plainExcerpt, readingMinutes, renderMarkdown } from '#services/markdown'
import { uniqueSlug } from '#services/slug'
import { withReplyMeta } from '#services/reply_service'

const PER_PAGE = 15
const SEEN_SESSION_KEY = 'articles_seen'

type ArticleSort = 'recents' | 'populaires'
type ArticlePayload = Awaited<ReturnType<typeof articleValidator.validate>>

/**
 * Escape LIKE wildcards so a search for "100%" stays literal.
 */
function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

/**
 * Excerpt generated from the body when the author leaves it blank
 * (headings are skipped: they read badly once flattened into a sentence).
 */
function autoExcerpt(body: string) {
  return plainExcerpt(body.replace(/^#{1,6}\s.*$/gm, ''))
}

/**
 * Copy validated form data onto the model: rendered HTML, reading time,
 * and an excerpt generated from the body when the author left it blank.
 */
async function fillArticle(article: Article, data: ArticlePayload) {
  article.title = data.title
  article.body = data.body
  article.bodyHtml = await renderMarkdown(data.body)
  article.readingMinutes = readingMinutes(data.body)
  article.excerpt = data.excerpt ?? autoExcerpt(data.body)
  article.coverUrl = data.coverUrl ?? null
}

/**
 * Only keep tag ids that exist (unknown ids are silently dropped).
 */
async function existingTagIds(ids: number[] | undefined) {
  if (!ids?.length) return []
  const tags = await Tag.query()
    .whereIn('id', [...new Set(ids)])
    .select('id')
  return tags.map((tag) => tag.id)
}

async function saveWithTags(article: Article, tagIds: number[]) {
  await db.transaction(async (trx) => {
    article.useTransaction(trx)
    await article.save()
    await article.related('tags').sync(tagIds, true, trx)
  })
}

/**
 * "À lire ensuite": up to 3 published articles sharing the most tags with
 * "article", completed with the latest ones.
 */
async function relatedArticles(article: Article) {
  const base = () =>
    Article.query()
      .withScopes((scopes) => scopes.published())
      .whereNot('id', article.id)
      .preload('author')
      .preload('tags')

  const tagIds = article.tags.map((tag) => tag.id)
  let related: Article[] = []
  if (tagIds.length) {
    related = await base()
      .whereHas('tags', (query) => query.whereIn('tags.id', tagIds))
      .orderByRaw(
        `(select count(*) from article_tag where article_tag.article_id = articles.id and article_tag.tag_id in (${tagIds.map(() => '?').join(', ')})) desc`,
        tagIds
      )
      .orderBy('published_at', 'desc')
      .limit(3)
  }
  if (related.length < 3) {
    const latest = await base()
      .whereNotIn(
        'id',
        related.map((item) => item.id)
      )
      .orderBy('published_at', 'desc')
      .limit(3 - related.length)
    related = [...related, ...latest]
  }
  return related
}

/**
 * Drafts (unpublished or scheduled) only exist for their author and the
 * moderators; everyone else gets a 404.
 */
function assertVisible(article: Article, viewer: User | undefined) {
  if (article.isPublished) return
  if (viewer && viewer.canSeeDraftsOf(article.userId)) return
  throw new lucidErrors.E_ROW_NOT_FOUND()
}

export default class ArticlesController {
  /**
   * GET /articles — published articles, filters: ?tag= ?q= ?sort= ?page=
   */
  async index({ inertia, request }: HttpContext) {
    const qs = request.qs()
    const page = Math.max(1, Number.parseInt(String(qs.page ?? '1'), 10) || 1)
    const search = typeof qs.q === 'string' ? qs.q.trim().slice(0, 100) : ''
    const sort: ArticleSort = qs.sort === 'populaires' ? 'populaires' : 'recents'
    const tagSlug = typeof qs.tag === 'string' ? qs.tag.trim().toLowerCase().slice(0, 60) : ''
    const unfiltered = !tagSlug && !search && sort === 'recents'

    const [tags, featured] = await Promise.all([
      Tag.query()
        .withCount('articles', (query) => {
          query
            .whereNotNull('articles.published_at')
            .where('articles.published_at', '<=', DateTime.now().toSQL()!)
        })
        .orderBy('name', 'asc'),
      unfiltered
        ? Article.query()
            .withScopes((scopes) => scopes.published())
            .whereNotNull('featured_at')
            .preload('author')
            .preload('tags')
            .withCount('likes')
            .withCount('comments')
            .orderBy('featured_at', 'desc')
            .first()
        : null,
    ])

    const query = Article.query()
      .withScopes((scopes) => scopes.published())
      .preload('author')
      .preload('tags')
      .withCount('likes')
      .withCount('comments')

    if (featured) query.whereNot('articles.id', featured.id)
    if (tagSlug) query.whereHas('tags', (tagQuery) => tagQuery.where('tags.slug', tagSlug))
    if (search) {
      const pattern = likePattern(search)
      query.where((where) => where.whereILike('title', pattern).orWhereILike('excerpt', pattern))
    }
    if (sort === 'populaires') {
      query.orderBy('likes_count', 'desc').orderBy('views_count', 'desc')
    }
    query.orderBy('published_at', 'desc').orderBy('id', 'desc')

    const paginator = await query.paginate(page, PER_PAGE)
    const indexedTags = tags
      .filter((tag) => Number(tag.$extras.articles_count) > 0)
      .sort((a, b) => Number(b.$extras.articles_count) - Number(a.$extras.articles_count))
    const activeTag = tagSlug ? (tags.find((tag) => tag.slug === tagSlug) ?? null) : null

    return inertia.render('articles/index', {
      articles: ArticleTransformer.paginate(paginator.all(), paginator.getMeta()),
      featured: featured ? ArticleTransformer.transform(featured) : null,
      total: paginator.total + (featured ? 1 : 0),
      tags: TagTransformer.transform(indexedTags),
      activeTag: activeTag ? TagTransformer.transform(activeTag) : null,
      filters: { q: search, sort, tag: tagSlug || null },
    })
  }

  /**
   * GET /articles/:slug
   */
  async show({ params, inertia, auth, session }: HttpContext) {
    const viewer = auth.user
    const article = await Article.query()
      .where('slug', params.slug)
      .preload('author')
      .preload('tags', (query) => query.orderBy('name', 'asc'))
      .withCount('likes')
      .withCount('comments')
      .firstOrFail()

    assertVisible(article, viewer)
    if (viewer) await markSubjectRead(viewer.id, { articleId: article.id })

    /**
     * Count one view per session (likes and comments redirect back here),
     * never the author's own visits, never drafts.
     */
    if (article.isPublished && viewer?.id !== article.userId) {
      const seen = session.get(SEEN_SESSION_KEY, []) as number[]
      if (!seen.includes(article.id)) {
        await Article.query().where('id', article.id).increment('views_count', 1)
        article.viewsCount += 1
        session.put(SEEN_SESSION_KEY, [...seen.slice(-29), article.id])
      }
    }

    // withReplyMeta is a query modifier (Lucid's .apply() runs scopes instead).
    const commentsQuery = Reply.query().where('article_id', article.id)
    withReplyMeta(viewer)(commentsQuery)

    const [comments, related, liked, authorTotals] = await Promise.all([
      commentsQuery,
      relatedArticles(article),
      viewer
        ? Like.query().where('article_id', article.id).where('user_id', viewer.id).first()
        : null,
      db
        .from('articles')
        .where('user_id', article.userId)
        .whereNotNull('published_at')
        .where('published_at', '<=', DateTime.now().toSQL()!)
        .count('* as total')
        .first(),
    ])

    return inertia.render('articles/[slug]', {
      article: ArticleTransformer.transform(article).useVariant('forDetail'),
      author: UserTransformer.transform(article.author).useVariant('forProfile'),
      authorArticlesCount: Number(authorTotals?.total ?? 0),
      comments: ReplyTransformer.transform(comments),
      related: ArticleTransformer.transform(related),
      likedByMe: Boolean(liked),
      canManage: Boolean(viewer && (await viewer.canManageContent(article.userId))),
    })
  }

  /**
   * GET /articles/nouveau
   */
  async create({ inertia }: HttpContext) {
    const tags = await Tag.query().orderBy('id', 'asc')
    return inertia.render('articles/create', { tags: TagTransformer.transform(tags) })
  }

  /**
   * POST /articles
   */
  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(articleValidator)

    const article = new Article()
    article.userId = user.id
    article.slug = await uniqueSlug('articles', data.title)
    await fillArticle(article, data)
    if (data.publish) article.publishedAt = DateTime.now()

    await saveWithTags(article, await existingTagIds(data.tags))

    session.flash(
      'success',
      data.publish
        ? 'Article publié. Merci pour ce partage !'
        : 'Brouillon enregistré. Il n’est visible que par vous.'
    )
    return response.redirect().toPath(`/articles/${article.slug}`)
  }

  /**
   * GET /articles/:slug/modifier
   */
  async edit({ params, inertia, auth, response, session }: HttpContext) {
    const user = auth.user!
    const article = await Article.query().where('slug', params.slug).preload('tags').firstOrFail()
    assertVisible(article, user)
    if (!(await user.canManageContent(article.userId))) {
      session.flash('error', 'Seul l’auteur de cet article peut le modifier.')
      return response.redirect().toPath(`/articles/${article.slug}`)
    }

    const tags = await Tag.query().orderBy('id', 'asc')
    return inertia.render('articles/edit', {
      article: ArticleTransformer.transform(article).useVariant('forEdit'),
      excerptIsAuto: article.excerpt === autoExcerpt(article.body),
      tags: TagTransformer.transform(tags),
    })
  }

  /**
   * PUT /articles/:slug
   */
  async update({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const article = await Article.findByOrFail('slug', params.slug)
    assertVisible(article, user)
    if (!(await user.canManageContent(article.userId))) {
      session.flash('error', 'Seul l’auteur de cet article peut le modifier.')
      return response.redirect().toPath(`/articles/${article.slug}`)
    }

    const data = await request.validateUsing(articleValidator)
    const wasPublic = article.isPublished

    /**
     * The URL only follows the title while nobody can have seen or shared
     * it: never published (and never viewed, since views are only counted
     * on published articles).
     */
    const everPublic = wasPublic || article.viewsCount > 0
    if (data.title !== article.title && !everPublic) {
      article.slug = await uniqueSlug('articles', data.title, article.id)
    }

    await fillArticle(article, data)
    if (data.publish && !wasPublic) {
      article.publishedAt = DateTime.now()
    } else if (!data.publish && article.publishedAt) {
      article.publishedAt = null
      article.featuredAt = null
    }

    await saveWithTags(article, await existingTagIds(data.tags))

    let message = 'Brouillon enregistré.'
    if (data.publish)
      message = wasPublic
        ? 'Modifications enregistrées.'
        : 'Article publié. Merci pour ce partage !'
    else if (wasPublic)
      message = 'Article repassé en brouillon : il n’est plus visible publiquement.'
    session.flash('success', message)
    return response.redirect().toPath(`/articles/${article.slug}`)
  }

  /**
   * DELETE /articles/:slug — comments, likes and tag links cascade.
   */
  async destroy({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const article = await Article.findByOrFail('slug', params.slug)
    assertVisible(article, user)
    if (!(await user.canManageContent(article.userId))) {
      session.flash('error', 'Vous ne pouvez pas supprimer cet article.')
      return response.redirect().toPath(`/articles/${article.slug}`)
    }

    await article.delete()
    session.flash('success', 'Article supprimé.')
    return response.redirect().toPath('/articles')
  }
}
