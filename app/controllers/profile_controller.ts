import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Reply from '#models/reply'
import ArticleTransformer from '#transformers/article_transformer'
import ThreadTransformer from '#transformers/thread_transformer'
import DiscussionTransformer from '#transformers/discussion_transformer'
import UserTransformer from '#transformers/user_transformer'
import { plainExcerpt } from '#services/markdown'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export const PROFILE_TABS = ['articles', 'questions', 'discussions', 'reponses'] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]

const PER_PAGE = 15

/**
 * Compact representation of a reply, with the title and URL of the page
 * it belongs to (thread, discussion or article). Relations "thread",
 * "discussion" and "article" must be preloaded (id, slug, title), plus
 * "author" when `withAuthor` is set.
 */
export function replySummary(reply: Reply, { withAuthor = false } = {}) {
  const parent = reply.thread
    ? { type: 'thread' as const, title: reply.thread.title, url: `/forum/${reply.thread.slug}` }
    : reply.discussion
      ? {
          type: 'discussion' as const,
          title: reply.discussion.title,
          url: `/discussions/${reply.discussion.slug}`,
        }
      : reply.article
        ? {
            type: 'article' as const,
            title: reply.article.title,
            url: `/articles/${reply.article.slug}`,
          }
        : null

  return {
    id: reply.id,
    excerpt: plainExcerpt(reply.body, 220),
    createdAt: reply.createdAt.toISO()!,
    likesCount: Number(reply.$extras.likes_count ?? 0),
    isSolution: Boolean(reply.thread && reply.thread.solutionReplyId === reply.id),
    parent: parent ? { ...parent, anchor: `${parent.url}#reponse-${reply.id}` } : null,
    author: withAuthor && reply.author ? new UserTransformer(reply.author).toObject() : null,
  }
}

export type ReplySummary = ReturnType<typeof replySummary>

/**
 * Query modifier: the parents a reply summary needs (only light columns).
 */
export function withReplyParents(query: ModelQueryBuilderContract<typeof Reply>) {
  return (
    query
      // Comments on articles that went back to draft must not leak their title.
      .where((q) =>
        q
          .whereNull('replies.article_id')
          .orWhereIn(
            'replies.article_id',
            db
              .from('articles')
              .select('id')
              .whereNotNull('published_at')
              .where('published_at', '<=', db.raw('now()'))
          )
      )
      .preload('thread', (q) => q.select('id', 'slug', 'title', 'solution_reply_id'))
      .preload('discussion', (q) => q.select('id', 'slug', 'title'))
      .preload('article', (q) => q.select('id', 'slug', 'title'))
  )
}

export default class ProfileController {
  /**
   * Public profile: /@username (see start/routes/members.ts).
   */
  async show({ params, request, inertia, auth }: HttpContext) {
    const viewer = auth.user
    const username = String(params.username).toLowerCase()

    // Banned members disappear from the site, except for the staff.
    const profile = await User.query()
      .whereRaw('lower(username) = ?', [username])
      .if(!viewer?.isModerator, (q) => q.whereNull('banned_at'))
      .firstOrFail()

    const statsRow = await db
      .rawQuery(
        `select
          (select count(*) from articles where user_id = :id and published_at is not null and published_at <= now()) as articles,
          (select count(*) from threads where user_id = :id) as questions,
          (select count(*) from discussions where user_id = :id) as discussions,
          (select count(*) from replies where user_id = :id) as replies,
          (select count(*) from threads t join replies r on r.id = t.solution_reply_id where r.user_id = :id) as solutions,
          (select count(*) from likes l join articles a on a.id = l.article_id where a.user_id = :id)
            + (select count(*) from likes l join replies r on r.id = l.reply_id where r.user_id = :id) as likes`,
        { id: profile.id }
      )
      .then((result) => result.rows[0])

    const stats = {
      articles: Number(statsRow.articles),
      questions: Number(statsRow.questions),
      discussions: Number(statsRow.discussions),
      replies: Number(statsRow.replies),
      solutions: Number(statsRow.solutions),
      likes: Number(statsRow.likes),
    }

    const counts: Record<ProfileTab, number> = {
      articles: stats.articles,
      questions: stats.questions,
      discussions: stats.discussions,
      reponses: stats.replies,
    }

    // Explicit tab from the URL, otherwise the first one with content.
    const requested = request.input('tab')
    const tab: ProfileTab = PROFILE_TABS.includes(requested)
      ? requested
      : (PROFILE_TABS.find((name) => counts[name] > 0) ?? 'articles')
    const page = Math.max(1, Number.parseInt(request.input('page', '1'), 10) || 1)

    const tabData = await this.tabData(profile, tab, page)

    return inertia.render('profile/show', {
      profile: UserTransformer.transform(profile).useVariant('forProfile'),
      banned: profile.isBanned,
      isOwner: viewer?.id === profile.id,
      stats,
      tab,
      ...tabData,
    })
  }

  private async tabData(profile: User, tab: ProfileTab, page: number) {
    const empty = { articles: null, threads: null, discussions: null, replies: null }

    if (tab === 'articles') {
      const paginator = await Article.query()
        .where('user_id', profile.id)
        .withScopes((s) => s.published())
        .preload('author')
        .preload('tags')
        .withCount('likes')
        .withCount('comments')
        .orderBy('published_at', 'desc')
        .paginate(page, PER_PAGE)
      return {
        ...empty,
        articles: ArticleTransformer.paginate(paginator.all(), paginator.getMeta()),
      }
    }

    if (tab === 'questions') {
      const paginator = await Thread.query()
        .where('user_id', profile.id)
        .preload('author')
        .preload('channel')
        .orderBy('created_at', 'desc')
        .paginate(page, PER_PAGE)
      return { ...empty, threads: ThreadTransformer.paginate(paginator.all(), paginator.getMeta()) }
    }

    if (tab === 'discussions') {
      const paginator = await Discussion.query()
        .where('user_id', profile.id)
        .preload('author')
        .preload('tags')
        .orderBy('created_at', 'desc')
        .paginate(page, PER_PAGE)
      return {
        ...empty,
        discussions: DiscussionTransformer.paginate(paginator.all(), paginator.getMeta()),
      }
    }

    const paginator = await withReplyParents(Reply.query())
      .where('user_id', profile.id)
      .withCount('likes')
      .orderBy('created_at', 'desc')
      .paginate(page, PER_PAGE)
    return {
      ...empty,
      replies: {
        data: paginator.all().map((reply) => replySummary(reply)),
        metadata: paginator.getMeta(),
      },
    }
  }
}
