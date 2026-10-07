/*
|--------------------------------------------------------------------------
| Discussions (open conversations, tagged) — see start/routes.ts
|--------------------------------------------------------------------------
|
| Static paths ("/discussions/nouvelle") are registered before "/discussions/:slug".
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle, writeThrottle } from '#start/limiter'

const DiscussionsController = () => import('#controllers/discussions_controller')
const DiscussionActionsController = () => import('#controllers/discussion_actions_controller')

router.get('discussions', [DiscussionsController, 'index']).as('discussions.index')

router
  .group(() => {
    router.get('discussions/nouvelle', [DiscussionsController, 'create']).as('discussions.create')
    router
      .post('discussions', [DiscussionsController, 'store'])
      .as('discussions.store')
      .use(writeThrottle)

    router.get('discussions/:slug/modifier', [DiscussionsController, 'edit']).as('discussions.edit')
    router
      .put('discussions/:slug', [DiscussionsController, 'update'])
      .as('discussions.update')
      .use(actionThrottle)
    router
      .delete('discussions/:slug', [DiscussionsController, 'destroy'])
      .as('discussions.destroy')
      .use(actionThrottle)

    router
      .post('discussions/:slug/replies', [DiscussionActionsController, 'reply'])
      .as('discussions.replies.store')
      .use(writeThrottle)
    router
      .post('discussions/:slug/pin', [DiscussionActionsController, 'togglePin'])
      .as('discussions.pin')
      .use(actionThrottle)
    router
      .post('discussions/:slug/lock', [DiscussionActionsController, 'toggleLock'])
      .as('discussions.lock')
      .use(actionThrottle)
  })
  .use(middleware.auth())

router.get('discussions/:slug', [DiscussionsController, 'show']).as('discussions.show')
