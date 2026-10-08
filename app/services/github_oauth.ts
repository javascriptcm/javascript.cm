import type { HttpContext } from '@adonisjs/core/http'
import github from '#services/social/github'

/**
 * @deprecated The GitHub flow now lives in "app/services/social/github.ts"
 * (one module per provider, see "app/services/social/index.ts"). This thin
 * wrapper keeps the former API compiling.
 */
export default class GithubOAuth {
  constructor(private ctx: HttpContext) {}

  redirectUrl() {
    return github.authorizationUrl(this.ctx)
  }

  user() {
    return github.profile(this.ctx)
  }
}
