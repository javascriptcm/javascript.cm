/*
|--------------------------------------------------------------------------
| Members: directory, public profiles, dashboard and settings
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle, authThrottle } from '#start/limiter'

const MembersController = () => import('#controllers/members_controller')
const ProfileController = () => import('#controllers/profile_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const SettingsController = () => import('#controllers/settings_controller')

router.get('membres', [MembersController, 'index']).as('members.index')

router.get('dashboard', [DashboardController, 'index']).as('dashboard').use(middleware.auth())

router
  .group(() => {
    router.get('/', [SettingsController, 'profile']).as('settings.profile')
    router
      .put('/', [SettingsController, 'updateProfile'])
      .as('settings.profile.update')
      .use(actionThrottle)
    router.get('password', [SettingsController, 'password']).as('settings.password')
    router
      .put('password', [SettingsController, 'updatePassword'])
      .as('settings.password.update')
      .use(authThrottle)
    router.get('account', [SettingsController, 'account']).as('settings.account')
    router
      .delete('account', [SettingsController, 'destroyAccount'])
      .as('settings.account.destroy')
      .use(actionThrottle)
  })
  .prefix('settings')
  .use(middleware.auth())

/*
| Public profile: "/@username".
|
| The route parser only knows whole-segment params (":name"), so "/@:username"
| would be a static segment. Instead, a single-segment param whose matcher
| requires the leading "@" (or its encoded form "%40"): it can never shadow
| another route ("/membres", "/admin", "/forum"… do not start with "@").
| The cast strips the "@" so the controller receives the bare username.
*/
router
  .get('/:username', [ProfileController, 'show'])
  .where('username', {
    match: /^(?:@|%40)[A-Za-z0-9_-]{1,40}$/,
    cast: (value: string) => value.replace(/^@/, '').toLowerCase(),
  })
  .as('profile.show')
