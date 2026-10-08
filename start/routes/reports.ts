/*
|--------------------------------------------------------------------------
| Reports ("Signaler")
|--------------------------------------------------------------------------
|
| Members flag content for the moderators. The moderation queue itself
| lives in the back office (see start/routes/admin.ts).
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle } from '#start/limiter'

const ReportsController = () => import('#controllers/reports_controller')

router
  .post('signalements', [ReportsController, 'store'])
  .as('reports.store')
  .use([middleware.auth(), actionThrottle])
