/*
|--------------------------------------------------------------------------
| Members: directory, public profiles, dashboard and settings
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { actionThrottle, authThrottle, cvDownloadThrottle, cvUploadThrottle } from '#start/limiter'

const MembersController = () => import('#controllers/members_controller')
const ProfileController = () => import('#controllers/profile_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const SettingsController = () => import('#controllers/settings_controller')
const CvController = () => import('#controllers/cv_controller')

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

    // CV (PDF). The upload streams its multipart body itself, after auth,
    // CSRF and throttling (see CvController.store and config/bodyparser.ts).
    router.get('cv', [CvController, 'show']).as('settings.cv')
    router
      .post('cv', [CvController, 'store'])
      .as('settings.cv.store')
      .use([actionThrottle, cvUploadThrottle])
    router.delete('cv', [CvController, 'destroy']).as('settings.cv.destroy').use(actionThrottle)
    router
      .put('cv/visibility', [CvController, 'updateVisibility'])
      .as('settings.cv.visibility')
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
const PROFILE_HANDLE = {
  match: /^(?:@|%40)[A-Za-z0-9_-]{1,40}$/,
  cast: (value: string) => value.replace(/^(?:@|%40)/, '').toLowerCase(),
}

router
  .get('/:username', [ProfileController, 'show'])
  .where('username', PROFILE_HANDLE)
  .as('profile.show')

/*
| CV download: "/@username/cv" (visibility rules in CvController.download).
*/
router
  .get('/:username/cv', [CvController, 'download'])
  .where('username', PROFILE_HANDLE)
  .as('profile.cv')
  .use(cvDownloadThrottle)
