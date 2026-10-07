/*
|--------------------------------------------------------------------------
| Back office (moderators and admins)
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const OverviewController = () => import('#controllers/admin/overview_controller')
const AdminMembersController = () => import('#controllers/admin/members_controller')
const AdminTagsController = () => import('#controllers/admin/tags_controller')
const AdminChannelsController = () => import('#controllers/admin/channels_controller')

router
  .group(() => {
    router.get('/', [OverviewController, 'index']).as('admin.index')

    router.get('membres', [AdminMembersController, 'index']).as('admin.members.index')
    router
      .put('membres/:id/role', [AdminMembersController, 'updateRole'])
      .as('admin.members.role')
      .use(middleware.role({ role: 'admin' }))
    router.post('membres/:id/ban', [AdminMembersController, 'ban']).as('admin.members.ban')
    router.delete('membres/:id/ban', [AdminMembersController, 'unban']).as('admin.members.unban')

    router.get('tags', [AdminTagsController, 'index']).as('admin.tags.index')
    router.post('tags', [AdminTagsController, 'store']).as('admin.tags.store')
    router.put('tags/:id', [AdminTagsController, 'update']).as('admin.tags.update')
    router.delete('tags/:id', [AdminTagsController, 'destroy']).as('admin.tags.destroy')

    router.get('canaux', [AdminChannelsController, 'index']).as('admin.channels.index')
    router.post('canaux', [AdminChannelsController, 'store']).as('admin.channels.store')
    router.put('canaux/:id', [AdminChannelsController, 'update']).as('admin.channels.update')
    router.delete('canaux/:id', [AdminChannelsController, 'destroy']).as('admin.channels.destroy')
  })
  .prefix('admin')
  .where('id', router.matchers.number())
  .use([middleware.auth(), middleware.role({ role: 'moderator' })])
