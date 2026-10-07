/*
|--------------------------------------------------------------------------
| Forum (questions with an accepted solution) — see start/routes.ts
|--------------------------------------------------------------------------
|
| Static paths ("/forum/nouveau") are registered before "/forum/:slug".
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle, writeThrottle } from '#start/limiter'

const ThreadsController = () => import('#controllers/threads_controller')
const ThreadActionsController = () => import('#controllers/thread_actions_controller')

router.get('forum', [ThreadsController, 'index']).as('forum.index')

router
  .group(() => {
    router.get('forum/nouveau', [ThreadsController, 'create']).as('forum.create')
    router.post('forum', [ThreadsController, 'store']).as('forum.store').use(writeThrottle)

    router.get('forum/:slug/modifier', [ThreadsController, 'edit']).as('forum.edit')
    router.put('forum/:slug', [ThreadsController, 'update']).as('forum.update').use(actionThrottle)
    router
      .delete('forum/:slug', [ThreadsController, 'destroy'])
      .as('forum.destroy')
      .use(actionThrottle)

    router
      .post('forum/:slug/replies', [ThreadActionsController, 'reply'])
      .as('forum.replies.store')
      .use(writeThrottle)
    router
      .post('forum/:slug/solution', [ThreadActionsController, 'markSolution'])
      .as('forum.solution.store')
      .use(actionThrottle)
    router
      .delete('forum/:slug/solution', [ThreadActionsController, 'unmarkSolution'])
      .as('forum.solution.destroy')
      .use(actionThrottle)
    router
      .post('forum/:slug/pin', [ThreadActionsController, 'togglePin'])
      .as('forum.pin')
      .use(actionThrottle)
    router
      .post('forum/:slug/lock', [ThreadActionsController, 'toggleLock'])
      .as('forum.lock')
      .use(actionThrottle)
  })
  .use(middleware.auth())

router.get('forum/:slug', [ThreadsController, 'show']).as('forum.show')
