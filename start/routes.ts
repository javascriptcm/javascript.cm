/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const UploadController = () => import('#controllers/api/upload_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const GithubController = () => import('#controllers/auth/github_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const ArticlesController = () => import('#controllers/articles_controller')
const ProfileController = () => import('#controllers/profile_controller')
const HomeController = () => import('#controllers/home_controller')
const MessagesController = () => import('#controllers/messages_controller')
const DiscussionsController = () => import('#controllers/discussions_controller')

// Guest routes (login/register)
router
  .group(() => {
    router.get('login', [LoginController, 'show']).as('login')
    router.post('login', [LoginController, 'login']).as('login.store')
    router.get('register', [RegisterController, 'show']).as('register')
    router.post('register', [RegisterController, 'store']).as('register.store')
  })
  .middleware(middleware.guest())

// Logout route (requires authentication)
router.post('logout', [LoginController, 'logout']).as('logout').middleware(middleware.auth())

router.get('/', [HomeController, 'index'])

// GitHub auth routes
router.get('auth/github', [GithubController, 'redirect']).as('auth.github')
router.get('auth/github/callback', [GithubController, 'callback']).as('auth.github.callback')

// Article routes
router.get('articles', [ArticlesController, 'index']).as('articles.index')
router
  .get('articles/create', [ArticlesController, 'create'])
  .as('articles.create')
  .middleware(middleware.auth())
router
  .post('articles', [ArticlesController, 'store'])
  .as('articles.store')
  .middleware(middleware.auth())
router.get('articles/:slug', [ArticlesController, 'show']).as('articles.show')

// Profile routes
router.get('/:username', [ProfileController, 'show']).where('username', '@.*').as('profile.show')

// Dashboard routes
router
  .group(() => {
    router.get('dashboard', [ArticlesController, 'dashboard']).as('dashboard')
    router.get('dashboard/articles', [ArticlesController, 'articles']).as('dashboard.articles')
    router.get('dashboard/articles/:slug/edit', [ArticlesController, 'edit']).as('dashboard.articles.edit')
    router.put('dashboard/articles/:slug', [ArticlesController, 'update']).as('dashboard.articles.update')
  })
  .middleware(middleware.auth())

router.post('api/upload/presign', [UploadController, 'presign']).as('api.upload.presign')
router
  .get('api/upload/presign-view', [UploadController, 'presignView'])
  .as('api.upload.presignView')

// Messages routes
router
  .post('messages', [MessagesController, 'store'])
  .as('messages.store')
  .middleware(middleware.auth())
router
  .put('messages/:id', [MessagesController, 'update'])
  .as('messages.update')
  .middleware(middleware.auth())
router
  .delete('messages/:id', [MessagesController, 'destroy'])
  .as('messages.destroy')
  .middleware(middleware.auth())
router
  .get('messages/:id/history', [MessagesController, 'history'])
  .as('messages.history')
  .middleware(middleware.auth())

// Discussions routes
router
  .get('discussions', [DiscussionsController, 'index'])
  .as('discussions.index')
  .middleware(middleware.auth())
router
  .get('discussions/create', [DiscussionsController, 'create'])
  .as('discussions.create')
  .middleware(middleware.auth())
router
  .post('discussions', [DiscussionsController, 'store'])
  .as('discussions.store')
  .middleware(middleware.auth())
router
  .get('discussions/:id', [DiscussionsController, 'show'])
  .as('discussions.show')
  .middleware(middleware.auth())

router
  .post('discussions/:id/ban', [DiscussionsController, 'ban'])
  .as('discussions.ban')
  .middleware(middleware.admin())

router
  .delete('discussions/:id', [DiscussionsController, 'destroy'])
  .as('discussions.destroy')
  .middleware(middleware.admin())

// Admin routes for articles
router
  .group(() => {
    router.get('admin/articles', [ArticlesController, 'adminArticles']).as('admin.articles')
    router.post('admin/articles/:slug/unpublish', [ArticlesController, 'unpublish']).as('admin.articles.unpublish')
  })
  .middleware(middleware.admin())
