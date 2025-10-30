import { ArticleStatus } from '#enums/article_status'
import Article from '#models/article'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ params, inertia }: HttpContext) {
    const user = await User.findByOrFail('username', params.username.replace('@', ''))
    const articles = await Article.query()
      .where('author_id', user.id)
      .where('status', ArticleStatus.PUBLISHED)
      .orderBy('created_at', 'desc')
      .preload('author')

    return inertia.render('profile/show', {
      profile: {
        ...user.serialize(),
        articles: articles,
      },
    })
  }
}
