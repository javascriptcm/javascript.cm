import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Raised when markdown takes too long to render (pathological input).
 * Sends the member back to the form with an explanation instead of a 500.
 */
export default class MarkdownTooComplexException extends Exception {
  static status = 422
  static code = 'E_MARKDOWN_TOO_COMPLEX'
  static message =
    'Ce contenu est trop complexe à mettre en forme. Simplifiez la mise en forme (gras, italique, liens imbriqués) puis réessayez.'

  async handle(error: this, ctx: HttpContext) {
    if (ctx.request.accepts(['html', 'json']) === 'json' && !ctx.request.header('x-inertia')) {
      return ctx.response.status(error.status).send({ message: error.message })
    }
    ctx.session.flashExcept(['password', 'passwordConfirmation'])
    ctx.session.flash('error', error.message)
    return ctx.response.redirect().back()
  }
}
