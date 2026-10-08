import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import User from '#models/user'
import ArticleTransformer from '#transformers/article_transformer'
import ThreadTransformer from '#transformers/thread_transformer'
import DiscussionTransformer from '#transformers/discussion_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const [articles, threads, discussions, members, counts] = await Promise.all([
      Article.query()
        .withScopes((s) => s.published())
        .preload('author')
        .preload('tags')
        .withCount('likes')
        .withCount('comments')
        .orderByRaw('featured_at desc nulls last')
        .orderBy('published_at', 'desc')
        .limit(5),
      Thread.query()
        .preload('author')
        .preload('channel')
        .orderBy('last_activity_at', 'desc')
        .limit(6),
      Discussion.query()
        .preload('author')
        .preload('tags')
        .orderBy('last_activity_at', 'desc')
        .limit(4),
      User.query().whereNull('banned_at').orderBy('created_at', 'desc').limit(12),
      db
        .rawQuery(
          `select
            (select count(*) from users where banned_at is null) as members,
            (select count(*) from articles where published_at is not null and published_at <= now()) as articles,
            (select count(*) from threads) as threads,
            (select count(*) from threads where solution_reply_id is not null) as solved,
            (select count(*) from replies) as replies`
        )
        .then((result) => result.rows[0]),
    ])

    const threadsCount = Number(counts.threads)
    return inertia.render('home', {
      stats: {
        members: Number(counts.members),
        articles: Number(counts.articles),
        threads: threadsCount,
        replies: Number(counts.replies),
        solvedRate: threadsCount ? Math.round((Number(counts.solved) / threadsCount) * 100) : 0,
      },
      articles: ArticleTransformer.transform(articles),
      threads: ThreadTransformer.transform(threads),
      discussions: DiscussionTransformer.transform(discussions),
      members: UserTransformer.transform(members),
    })
  }
}
