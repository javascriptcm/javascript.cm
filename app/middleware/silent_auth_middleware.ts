import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Session key holding the user's session version at sign-in time.
 */
export const SESSION_VERSION_KEY = 'session_version'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not. It also signs out, whatever the page:
 * - banned members;
 * - sessions opened before a password change (stale session version).
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()
    const user = ctx.auth.user
    if (!user) return next()

    if (user.bannedAt) {
      await ctx.auth.use('web').logout()
      ctx.session.flash('error', 'Ce compte a été suspendu.')
      return next()
    }

    const stamp = ctx.session.get(SESSION_VERSION_KEY)
    if (stamp === undefined) {
      // Fresh sign-in (or a session restored from a valid remember-me token).
      ctx.session.put(SESSION_VERSION_KEY, user.sessionVersion)
    } else if (stamp !== user.sessionVersion) {
      await ctx.auth.use('web').logout()
      ctx.session.forget(SESSION_VERSION_KEY)
      ctx.session.flash('error', 'Votre mot de passe a été modifié : reconnectez-vous.')
    }

    return next()
  }
}
