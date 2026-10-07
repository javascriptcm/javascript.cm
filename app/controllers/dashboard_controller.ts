import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Reply from '#models/reply'
import ArticleTransformer from '#transformers/article_transformer'
import ThreadTransformer from '#transformers/thread_transformer'
import DiscussionTransformer from '#transformers/discussion_transformer'
import { replySummary, withReplyParents } from '#controllers/profile_controller'

export default class DashboardController {
  /**
   * GET /dashboard — the signed-in member's workspace.
   */
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const [statsRow, articles, threads, discussions, activity] = await Promise.all([
      db
        .rawQuery(
          `select
            (select count(*) from articles where user_id = :id and published_at is not null and published_at <= now()) as published,
            (select count(*) from articles where user_id = :id and (published_at is null or published_at > now())) as drafts,
            (select coalesce(sum(views_count), 0) from articles where user_id = :id) as views,
            (select count(*) from threads where user_id = :id) as questions,
            (select count(*) from threads where user_id = :id and solution_reply_id is null) as unsolved,
            (select count(*) from discussions where user_id = :id) as discussions,
            (select count(*) from replies where user_id = :id) as replies,
            (select count(*) from likes l join articles a on a.id = l.article_id where a.user_id = :id)
              + (select count(*) from likes l join replies r on r.id = l.reply_id where r.user_id = :id) as likes`,
          { id: user.id }
        )
        .then((result) => result.rows[0]),

      // Drafts first, then the latest publications.
      Article.query()
        .where('user_id', user.id)
        .preload('tags')
        .withCount('likes')
        .withCount('comments')
        .orderByRaw('(published_at is null or published_at > now()) desc')
        .orderByRaw('coalesce(published_at, updated_at, created_at) desc')
        .limit(8),

      // Questions still waiting for a solution come first.
      Thread.query()
        .where('user_id', user.id)
        .preload('channel')
        .orderByRaw('(solution_reply_id is null) desc')
        .orderBy('last_activity_at', 'desc')
        .limit(6),

      Discussion.query()
        .where('user_id', user.id)
        .preload('tags')
        .orderBy('last_activity_at', 'desc')
        .limit(5),

      // Latest replies written by others on my threads, discussions and articles.
      withReplyParents(Reply.query())
        .preload('author')
        .whereNot('user_id', user.id)
        .where((query) => {
          query
            .whereIn('thread_id', db.from('threads').select('id').where('user_id', user.id))
            .orWhereIn(
              'discussion_id',
              db.from('discussions').select('id').where('user_id', user.id)
            )
            .orWhereIn('article_id', db.from('articles').select('id').where('user_id', user.id))
        })
        .orderBy('created_at', 'desc')
        .limit(10),
    ])

    return inertia.render('dashboard/index', {
      stats: {
        published: Number(statsRow.published),
        drafts: Number(statsRow.drafts),
        views: Number(statsRow.views),
        questions: Number(statsRow.questions),
        unsolved: Number(statsRow.unsolved),
        discussions: Number(statsRow.discussions),
        replies: Number(statsRow.replies),
        likes: Number(statsRow.likes),
      },
      articles: ArticleTransformer.transform(articles),
      threads: ThreadTransformer.transform(threads),
      discussions: DiscussionTransformer.transform(discussions),
      activity: activity.map((reply) => replySummary(reply, { withAuthor: true })),
    })
  }
}
