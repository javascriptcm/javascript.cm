import User from '#models/user'
import { loginValidator } from '#validators/login_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { safeRedirectPath } from '#services/safe_redirect'

export default class LoginController {
  async show({ inertia, request }: HttpContext) {
    return inertia.render('auth/login', {
      redirect: safeRedirectPath(request.input('redirect'), ''),
    })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { login, password, remember } = await request.validateUsing(loginValidator)

    let user: User
    try {
      user = await User.verifyCredentials(login.toLowerCase(), password)
    } catch {
      session.flashExcept(['password'])
      session.flash('inputErrorsBag', { login: ['Identifiants incorrects.'] })
      return response.redirect().back()
    }

    if (user.isBanned) {
      session.flash(
        'error',
        'Ce compte a été suspendu. Contactez l’équipe si vous pensez à une erreur.'
      )
      return response.redirect().back()
    }

    await auth.use('web').login(user, Boolean(remember))
    session.flash('success', `Bon retour, ${user.displayName} !`)
    return response.redirect().toPath(safeRedirectPath(request.input('redirect')))
  }

  async destroy({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'Vous êtes déconnecté. À bientôt !')
    return response.redirect().toRoute('home')
  }
}
