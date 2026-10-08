/*
|--------------------------------------------------------------------------
| Site-wide search — see start/routes.ts
|--------------------------------------------------------------------------
|
| Read-only, but full-text queries cost CPU: a light limiter per IP keeps
| scrapers and loops in check.
|
*/

import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import limiter from '@adonisjs/limiter/services/main'

const SearchController = () => import('#controllers/search_controller')

const THROTTLED_MESSAGE =
  'Trop de recherches en peu de temps. Patientez une minute avant de relancer.'

export const searchThrottle = limiter.define('search', (ctx) => {
  return limiter
    .allowRequests(app.inProduction ? 60 : 1000)
    .every('1 minute')
    .usingKey(`search_${ctx.request.ip()}`)
    .limitExceeded((error) => {
      error.setMessage(THROTTLED_MESSAGE)
      // Inertia visits get the search page with a notice; other clients
      // (scrapers, curl) keep the plain-text 429 with Retry-After.
      if (ctx.request.header('x-inertia')) {
        error.handle = async (_error, httpContext) => {
          for (const [name, value] of Object.entries(error.getDefaultHeaders())) {
            httpContext.response.header(name, value)
          }
          const { default: Controller } = await import('#controllers/search_controller')
          await new Controller().throttled(httpContext, THROTTLED_MESSAGE)
        }
      }
    })
})

router.get('recherche', [SearchController, 'index']).as('search').use(searchThrottle)
