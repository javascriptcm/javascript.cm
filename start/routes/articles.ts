/*
| articles routes — see start/routes.ts
|
| Static paths ("nouveau") are registered before the dynamic ":slug" ones.
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle, writeThrottle } from '#start/limiter'

const ArticlesController = () => import('#controllers/articles_controller')
const ArticleActionsController = () => import('#controllers/article_actions_controller')
const ArticleCommentsController = () => import('#controllers/article_comments_controller')

router.get('articles', [ArticlesController, 'index']).as('articles.index')

router
  .group(() => {
    router.get('articles/nouveau', [ArticlesController, 'create']).as('articles.create')
    router.post('articles', [ArticlesController, 'store']).as('articles.store').use(writeThrottle)

    router
      .group(() => {
        router.get('articles/:slug/modifier', [ArticlesController, 'edit']).as('articles.edit')
        router
          .put('articles/:slug', [ArticlesController, 'update'])
          .as('articles.update')
          .use(actionThrottle)
        router
          .delete('articles/:slug', [ArticlesController, 'destroy'])
          .as('articles.destroy')
          .use(actionThrottle)
        router
          .post('articles/:slug/like', [ArticleActionsController, 'like'])
          .as('articles.like')
          .use(actionThrottle)
        router
          .post('articles/:slug/publish', [ArticleActionsController, 'publish'])
          .as('articles.publish')
          .use(actionThrottle)
        router
          .post('articles/:slug/unpublish', [ArticleActionsController, 'unpublish'])
          .as('articles.unpublish')
          .use(actionThrottle)
        router
          .post('articles/:slug/feature', [ArticleActionsController, 'feature'])
          .as('articles.feature')
          .use(actionThrottle)
        router
          .post('articles/:slug/comments', [ArticleCommentsController, 'store'])
          .as('articles.comments.store')
          .use(writeThrottle)
      })
      .where('slug', /^[a-z0-9-]+$/)
  })
  .use(middleware.auth())

router
  .get('articles/:slug', [ArticlesController, 'show'])
  .as('articles.show')
  .where('slug', /^[a-z0-9-]+$/)
