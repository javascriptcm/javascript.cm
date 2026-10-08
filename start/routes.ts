/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Core routes live here. Each feature area has its own file under
| "start/routes/" (imported at the bottom). The catch-all profile route
| "/@:username" is registered last.
|
*/

import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { middleware } from '#start/kernel'
import { actionThrottle, authThrottle, previewThrottle } from '#start/limiter'

const HomeController = () => import('#controllers/home_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const GithubController = () => import('#controllers/auth/github_controller')
const MarkdownController = () => import('#controllers/markdown_controller')
const SeoController = () => import('#controllers/seo_controller')
const RepliesController = () => import('#controllers/replies_controller')

router.get('/', [HomeController, 'index']).as('home')

/*
| Health check (Docker / uptime monitoring)
*/
router
  .get('up', async ({ response }) => {
    await db.rawQuery('select 1')
    return response.ok({ status: 'ok' })
  })
  .as('health')

/*
| Static pages
*/
router.on('a-propos').renderInertia('pages/about', {}).as('pages.about')
router.on('code-de-conduite').renderInertia('pages/code_of_conduct', {}).as('pages.code_of_conduct')

/*
| Authentication
*/
router
  .group(() => {
    router.get('login', [LoginController, 'show']).as('login')
    router.post('login', [LoginController, 'store']).as('login.store').use(authThrottle)
    router.get('register', [RegisterController, 'show']).as('register')
    router.post('register', [RegisterController, 'store']).as('register.store').use(authThrottle)
    router.get('auth/github', [GithubController, 'redirect']).as('auth.github')
    router.get('auth/github/callback', [GithubController, 'callback']).as('auth.github.callback')
  })
  .use(middleware.guest())

router.post('logout', [LoginController, 'destroy']).as('logout').use(middleware.auth())

/*
| Markdown preview (editor "Aperçu" tab)
*/
router
  .post('markdown/preview', [MarkdownController, 'preview'])
  .as('markdown.preview')
  .use([middleware.auth(), previewThrottle])

/*
| Replies (shared by forum threads, discussions and article comments)
*/
router
  .group(() => {
    router.put('replies/:id', [RepliesController, 'update']).as('replies.update')
    router.delete('replies/:id', [RepliesController, 'destroy']).as('replies.destroy')
    router.post('replies/:id/like', [RepliesController, 'like']).as('replies.like')
  })
  .where('id', router.matchers.number())
  .use([middleware.auth(), actionThrottle])

/*
| SEO
*/
router.get('robots.txt', [SeoController, 'robots']).as('seo.robots')
router.get('sitemap.xml', [SeoController, 'sitemap']).as('seo.sitemap')
router.get('feed.xml', [SeoController, 'feed']).as('seo.feed')

/*
| Feature areas
*/
await import('#start/routes/articles')
await import('#start/routes/forum')
await import('#start/routes/discussions')
await import('#start/routes/search')
await import('#start/routes/notifications')
await import('#start/routes/reports')
await import('#start/routes/members')
await import('#start/routes/admin')
