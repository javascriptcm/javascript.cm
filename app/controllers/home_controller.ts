import { ArticleStatus } from '#enums/article_status'
import Article from '#models/article'
import { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const articles = await Article.query()
      .where('status', ArticleStatus.PUBLISHED)
      .preload('author')

    return inertia.render('home', {
      stats: {
        members: 600,
        developers: 50,
        participation: 25,
        githubStars: 10,
      },
      articles: articles,
    })
  }
}
