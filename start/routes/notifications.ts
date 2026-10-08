/*
|--------------------------------------------------------------------------
| Notifications (signed-in members only) — see start/routes.ts
|--------------------------------------------------------------------------
|
| "GET /notifications/:id" marks the notification as read and redirects to
| the reply it is about: it is the link of every row of the list.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle } from '#start/limiter'

const NotificationsController = () => import('#controllers/notifications_controller')

router
  .group(() => {
    router.get('notifications', [NotificationsController, 'index']).as('notifications.index')
    router
      .post('notifications/read-all', [NotificationsController, 'readAll'])
      .as('notifications.read_all')
      .use(actionThrottle)
    router
      .post('notifications/:id/read', [NotificationsController, 'read'])
      .as('notifications.read')
      .where('id', router.matchers.number())
      .use(actionThrottle)
    router
      .get('notifications/:id', [NotificationsController, 'show'])
      .as('notifications.show')
      .where('id', router.matchers.number())
      .use(actionThrottle)
  })
  .use(middleware.auth())
