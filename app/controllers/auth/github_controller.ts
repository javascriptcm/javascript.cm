import type { HttpContext } from '@adonisjs/core/http'
import SocialController from '#controllers/auth/social_controller'

/**
 * @deprecated Kept for backward compatibility only: the routes point to
 * SocialController ("/auth/:provider", "/auth/:provider/callback"), which
 * handles GitHub, Google and Apple with the same account rules.
 */
export default class GithubController {
  async redirect(ctx: HttpContext) {
    ctx.params.provider = 'github'
    return new SocialController().redirect(ctx)
  }

  async callback(ctx: HttpContext) {
    ctx.params.provider = 'github'
    return new SocialController().callback(ctx)
  }
}
