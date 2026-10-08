import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import UserTransformer from '#transformers/user_transformer'
import ArticleTransformer from '#transformers/article_transformer'
import ThreadTransformer from '#transformers/thread_transformer'
import DiscussionTransformer from '#transformers/discussion_transformer'
import { MEMBER_COUNTERS } from '#controllers/members_controller'

export default class OverviewController {
  /**
   * GET /admin — community vital signs and the latest arrivals.
   */
  async index({ inertia, auth }: HttpContext) {
    const [counts, members, articles, threads, discussions] = await Promise.all([
      db
        .rawQuery(
          `select
            (select count(*) from users where banned_at is null) as members,
            (select count(*) from users where banned_at is not null) as banned,
            (select count(*) from users where role in ('admin', 'moderator')) as staff,
            (select count(*) from users where created_at > now() - interval '7 days') as signups_week,
            (select count(*) from articles where published_at is not null and published_at <= now()) as articles,
            (select count(*) from articles where published_at is null or published_at > now()) as drafts,
            (select count(*) from threads) as threads,
            (select count(*) from threads where solution_reply_id is null) as unsolved,
            (select count(*) from discussions) as discussions,
            (select count(*) from replies) as replies,
            (select count(*) from tags) as tags,
            (select count(*) from channels) as channels,
            (select count(*) from reports where status = 'open') as reports_open,
            (select count(*) from (
              select 1 from reports where status = 'open' group by target_type, target_id
            ) as queue) as reports_queue`
        )
        .then((result) => result.rows[0]),
      User.query()
        .select('users.*')
        .select(db.raw(`${MEMBER_COUNTERS.articles} as articles_count`))
        .select(db.raw(`${MEMBER_COUNTERS.threads} as threads_count`))
        .select(db.raw(`${MEMBER_COUNTERS.replies} as replies_count`))
        .orderBy('created_at', 'desc')
        .limit(8),
      Article.query()
        .withScopes((s) => s.published())
        .preload('author')
        .withCount('likes')
        .withCount('comments')
        .orderBy('published_at', 'desc')
        .limit(6),
      Thread.query().preload('author').preload('channel').orderBy('created_at', 'desc').limit(6),
      Discussion.query().preload('author').orderBy('created_at', 'desc').limit(6),
    ])

    const stats = Object.fromEntries(
      Object.entries(counts as Record<string, string>).map(([key, value]) => [key, Number(value)])
    ) as Record<
      | 'members'
      | 'banned'
      | 'staff'
      | 'signups_week'
      | 'articles'
      | 'drafts'
      | 'threads'
      | 'unsolved'
      | 'discussions'
      | 'replies'
      | 'tags'
      | 'channels'
      | 'reports_open'
      | 'reports_queue',
      number
    >

    return inertia.render('admin/index', {
      stats,
      members: auth.user!.isAdmin
        ? UserTransformer.transform(members).useVariant('forAdmin')
        : UserTransformer.transform(members).useVariant('forModeration'),
      articles: ArticleTransformer.transform(articles),
      threads: ThreadTransformer.transform(threads),
      discussions: DiscussionTransformer.transform(discussions),
    })
  }
}
