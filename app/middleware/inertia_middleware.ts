import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import { githubEnabled } from '#config/ally'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'
import { reportQueueCounts } from '#controllers/admin/reports_controller'

export type ThemePreference = 'light' | 'dark' | 'system'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    /**
     * The share method is called everytime an Inertia page is rendered. In
     * certain cases, a page may get rendered before the session middleware
     * or the auth middleware are executed. For example: During a 404 request.
     *
     * In that case, we must always assume that HttpContext is not fully hydrated
     * with all the properties
     */
    const { auth, request } = ctx as Partial<HttpContext>

    const cookie = request?.plainCookie('app_theme', { encoded: false })
    const theme: ThemePreference = cookie === 'light' || cookie === 'dark' ? cookie : 'system'

    let unreadNotifications = 0
    if (auth?.user) {
      const [row] = await db
        .from('notifications')
        .where('user_id', auth.user.id)
        .whereNull('read_at')
        .count('* as total')
      unreadNotifications = Number(row?.total ?? 0)
    }

    // Moderation queue badge (staff only: no query for regular members).
    let reportQueueCount = 0
    if (auth?.user?.isModerator) {
      const counts = await reportQueueCounts()
      reportQueueCount = counts.open
    }

    /**
     * Data shared with all Inertia pages. Make sure you are using
     * transformers for rich data-types like Models.
     */
    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      user: ctx.inertia.always(
        auth?.user ? UserTransformer.transform(auth.user).useVariant('forSession') : undefined
      ),
      preferences: ctx.inertia.always({ theme }),
      features: ctx.inertia.always({ github: githubEnabled() }),
      site: ctx.inertia.always({ url: env.get('APP_URL') }),
      unreadNotifications: ctx.inertia.always(unreadNotifications),
      reportQueueCount: ctx.inertia.always(reportQueueCount),
    }
  }

  flash(ctx: HttpContext) {
    /**
     * Flash messages travel in the dedicated `flash` field of the page
     * object instead of props, and the client strips them from history
     * state so they never reappear when navigating back.
     */
    const { session } = ctx as Partial<HttpContext>

    const success: string | undefined = session?.flashMessages.get('success')
    const error: string | undefined = session?.flashMessages.get('error')

    return { success, error }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
