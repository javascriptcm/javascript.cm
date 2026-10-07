import User from '#models/user'
import { registerValidator } from '#validators/register_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register', {})
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { name, username, email, password } = await request.validateUsing(registerValidator)
    const user = await User.create({ name, username, email, password, role: 'member' })

    await auth.use('web').login(user)
    session.flash('success', `Bienvenue dans la communauté, ${user.displayName} !`)
    return response.redirect().toPath('/dashboard')
  }
}
