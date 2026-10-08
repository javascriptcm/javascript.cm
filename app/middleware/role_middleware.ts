import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export type RequiredRole = 'moderator' | 'admin'

/**
 * Restricts a route to the staff. Must run after the "auth" middleware.
 *
 * - `middleware.role()` or `middleware.role({ role: 'moderator' })`: moderators and admins
 * - `middleware.role({ role: 'admin' })`: admins only
 *
 * Forbidden GET requests are sent to the dashboard, other requests back to
 * the previous page, both with a flash message (Inertia friendly).
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { role?: RequiredRole } = {}) {
    const role = options.role ?? 'moderator'
    const user = ctx.auth.user

    if (!user) {
      return ctx.response
        .redirect()
        .toPath(`/login?redirect=${encodeURIComponent(ctx.request.url(true))}`)
    }

    const allowed = role === 'admin' ? user.isAdmin : user.isModerator
    if (allowed) {
      return next()
    }

    const message =
      role === 'admin'
        ? 'Cette action est réservée aux administrateurs.'
        : 'Cet espace est réservé à l’équipe de modération.'

    const wantsJson =
      !ctx.request.header('x-inertia') && ctx.request.accepts(['html', 'json']) === 'json'
    if (wantsJson) {
      return ctx.response.forbidden({ message })
    }

    ctx.session.flash('error', message)
    if (ctx.request.method() === 'GET') {
      return ctx.response.redirect().toPath('/dashboard')
    }
    return ctx.response.redirect().back()
  }
}
