import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import { Exception } from '@adonisjs/core/exceptions'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { SESSION_VERSION_KEY } from '#middleware/silent_auth_middleware'
import { enabledProvider } from '#services/social/index'
import type { SocialProfile, SocialProvider } from '#services/social/index'
import { RESERVED_USERNAMES } from '#validators/register_validator'

/**
 * Social sign-in (GitHub, Google, Apple).
 *
 * Account resolution, in order:
 * 1. an account already linked to this provider account (`<provider>_id`);
 * 2. else an account with the same e-mail, linked ONLY if that address is
 *    verified on our side (local e-mails are not verified: auto-linking would
 *    let whoever registered someone else's address capture their sign-in);
 * 3. else a new account, whose e-mail is verified (the provider vouches).
 * Banned accounts are refused.
 */
export default class SocialController {
  /**
   * GET /auth/:provider — start the flow.
   */
  async redirect(ctx: HttpContext) {
    const provider = this.provider(ctx.params.provider)
    return ctx.response.redirect(provider.authorizationUrl(ctx))
  }

  /**
   * GET /auth/:provider/callback — GitHub and Google.
   */
  async callback(ctx: HttpContext) {
    const provider = this.provider(ctx.params.provider)
    if (provider.callbackMethod !== 'GET') throw this.notFound()
    return this.signIn(ctx, provider)
  }

  /**
   * POST /auth/apple/callback — Apple's cross-site "form_post" (no CSRF
   * token; the state cookie is checked instead).
   */
  async appleCallback(ctx: HttpContext) {
    return this.signIn(ctx, this.provider('apple'))
  }

  private provider(name: unknown) {
    const provider = enabledProvider(name)
    if (!provider) throw this.notFound()
    return provider
  }

  private notFound() {
    return new Exception('Page introuvable', { status: 404, code: 'E_ROUTE_NOT_FOUND' })
  }

  private async signIn(ctx: HttpContext, provider: SocialProvider) {
    const { auth, response, session } = ctx
    const label = provider.label

    const profile = await provider.profile(ctx).catch((error) => {
      logger.warn({ err: error, provider: provider.name }, 'social sign-in failed')
      return null
    })
    if (!profile) {
      session.flash('error', `Connexion ${label} annulée ou expirée. Réessayez.`)
      return this.toLogin(response)
    }

    if (profile.email && !profile.emailVerified) {
      session.flash(
        'error',
        `Votre adresse e-mail ${label} n’est pas vérifiée. Vérifiez-la auprès de ${label}, ou créez un compte avec votre e-mail.`
      )
      return this.toLogin(response)
    }

    const column = provider.column
    const email = profile.email?.toLowerCase() ?? null
    let user = await User.findBy(column, profile.id)
    let created = false
    if (user?.isBanned) return this.refuseBanned(ctx)

    if (!user && email) {
      const existing = await User.findBy('email', email)
      if (existing) {
        if (!existing.emailVerifiedAt) {
          session.flash(
            'error',
            'Un compte existe déjà avec cette adresse e-mail. Connectez-vous avec votre mot de passe.'
          )
          return this.toLogin(response)
        }
        if (existing[column] && existing[column] !== profile.id) {
          // Never silently swap the provider account an account is tied to.
          session.flash(
            'error',
            `Ce compte est déjà associé à un autre compte ${label}. Connectez-vous avec celui-ci.`
          )
          return this.toLogin(response)
        }
        if (existing.isBanned) return this.refuseBanned(ctx)

        existing[column] = profile.id
        if (profile.extras.githubUsername) existing.githubUsername = profile.extras.githubUsername
        existing.avatarUrl = existing.avatarUrl ?? profile.avatarUrl
        await existing.save()
        user = existing
      }
    }

    if (!user) {
      if (!email) {
        session.flash(
          'error',
          `Votre compte ${label} n’expose aucune adresse e-mail vérifiée. Créez un compte avec votre e-mail.`
        )
        return response.redirect().withQs(false).toRoute('register')
      }
      user = await this.createUser(provider, profile, email)
      created = true
    }

    await auth.use('web').login(user, true)
    session.put(SESSION_VERSION_KEY, user.sessionVersion)
    session.flash(
      'success',
      created
        ? `Bienvenue dans la communauté, ${user.displayName} !`
        : `Bon retour, ${user.displayName} !`
    )
    return response.redirect().withQs(false).toPath('/dashboard')
  }

  private refuseBanned({ session, response }: HttpContext) {
    session.flash('error', 'Ce compte a été suspendu.')
    return this.toLogin(response)
  }

  /**
   * Never forward the callback query string ("code", "state") to the next
   * page: config/app.ts enables `forwardQueryString` for every redirect.
   */
  private toLogin(response: HttpContext['response']) {
    return response.redirect().withQs(false).toRoute('login')
  }

  private async createUser(provider: SocialProvider, profile: SocialProfile, email: string) {
    const { extras } = profile
    return User.create({
      [provider.column]: profile.id,
      username: await availableUsername(profile.usernameHint),
      name: profile.name,
      email,
      avatarUrl: profile.avatarUrl,
      bio: extras.bio ?? null,
      location: extras.location ?? null,
      websiteUrl: extras.websiteUrl ?? null,
      githubUsername: extras.githubUsername ?? null,
      twitterUsername: extras.twitterUsername ?? null,
      password: null,
      role: 'member',
      // Explicit: the model is not refreshed with the database defaults.
      bannedAt: null,
      sessionVersion: 0,
      // Only verified provider addresses reach this point.
      emailVerifiedAt: DateTime.now(),
    })
  }
}

/**
 * A free username derived from the provider's hint (GitHub login, or the
 * display name for Google and Apple), following the username rules:
 * lowercase a-z 0-9 - _, 3 to 30 characters, not reserved.
 */
export async function availableUsername(hint: string | null) {
  const slug = (hint ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s.]+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/[-_]{2,}/g, '-')
    .slice(0, 24)
    .replace(/^[-_]+|[-_]+$/g, '')

  let base = slug.length >= 3 ? slug : slug ? `${slug}-dev` : 'membre'
  if (RESERVED_USERNAMES.includes(base)) base = `${base}-dev`

  let candidate = base
  while (await User.findBy('username', candidate)) {
    candidate = `${base}-${randomBytes(2).toString('hex')}`
  }
  return candidate
}
