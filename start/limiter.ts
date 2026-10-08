/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes.
|
*/

import app from '@adonisjs/core/services/app'
import limiter from '@adonisjs/limiter/services/main'

/**
 * Login / signup attempts, keyed by IP.
 */
export const authThrottle = limiter.define('auth', (ctx) => {
  return limiter
    .allowRequests(app.inProduction ? 10 : 1000)
    .every('5 minutes')
    .usingKey(`auth_${ctx.request.ip()}`)
    .limitExceeded((error) => {
      error.setMessage('Trop de tentatives. Réessayez dans quelques minutes.')
    })
})

/**
 * Content creation (articles, threads, discussions, replies), keyed by user.
 */
export const writeThrottle = limiter.define('write', (ctx) => {
  return limiter
    .allowRequests(app.inProduction ? 20 : 1000)
    .every('10 minutes')
    .usingKey(`write_${ctx.auth.user?.id ?? ctx.request.ip()}`)
    .limitExceeded((error) => {
      error.setMessage('Vous publiez trop vite. Patientez quelques minutes.')
    })
})

/**
 * Cheap one-click actions and edits (likes, solutions, pin/lock, updates).
 */
export const actionThrottle = limiter.define('action', (ctx) => {
  return limiter
    .allowRequests(app.inProduction ? 120 : 2000)
    .every('10 minutes')
    .usingKey(`action_${ctx.auth.user?.id ?? ctx.request.ip()}`)
    .limitExceeded((error) => {
      error.setMessage('Trop d’actions en peu de temps. Patientez quelques minutes.')
    })
})

/**
 * Markdown preview in the editor.
 */
export const previewThrottle = limiter.define('preview', (ctx) => {
  return limiter
    .allowRequests(app.inProduction ? 60 : 2000)
    .every('5 minutes')
    .usingKey(`preview_${ctx.auth.user?.id ?? ctx.request.ip()}`)
})
