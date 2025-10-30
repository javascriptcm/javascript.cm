import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Role } from '#enums/role'

/**
 * Admin middleware is used to restrict access to admin-only routes
 * The user must be authenticated and have an ADMIN role
 */
export default class AdminMiddleware {
  /**
   * The URL to redirect to when authorization fails
   */
  redirectTo = '/discussions'

  async handle(ctx: HttpContext, next: NextFn) {
    // Ensure user is authenticated
    await ctx.auth.check()

    // Check if user has admin role
    if (!ctx.auth.user || ctx.auth.user.role !== Role.ADMIN) {
      return ctx.response.abort('Accès réservé aux administrateurs', 403)
    }

    return next()
  }
}
