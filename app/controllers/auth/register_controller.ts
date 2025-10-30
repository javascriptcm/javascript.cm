import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register_validator'
import { Role } from '#enums/role'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  async store({ request, auth, response }: HttpContext) {
    const data = await registerValidator.validate(request.all())

    const user = await User.create({
      ...data,
      role: (data.role as Role) || Role.MEMBER,
    })
    await auth.use('web').login(user)

    return response.redirect().toRoute('dashboard')
  }
}
