import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users. GET requests are sent back to the
 * page they asked for after login.
 */
export default class AuthMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const loginRoute =
      ctx.request.method() === 'GET'
        ? `${this.redirectTo}?redirect=${encodeURIComponent(ctx.request.url(true))}`
        : this.redirectTo

    await ctx.auth.authenticateUsing(options.guards, { loginRoute })

    if (ctx.auth.user?.bannedAt) {
      await ctx.auth.use('web').logout()
      ctx.session.flash('error', 'Ce compte a été suspendu.')
      return ctx.response.redirect(this.redirectTo)
    }

    return next()
  }
}
