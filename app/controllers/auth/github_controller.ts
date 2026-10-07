import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import GithubOAuth from '#services/github_oauth'
import { githubEnabled } from '#config/ally'
import { RESERVED_USERNAMES } from '#validators/register_validator'

export default class GithubController {
  async redirect(ctx: HttpContext) {
    if (!githubEnabled()) {
      ctx.session.flash('error', 'La connexion avec GitHub n’est pas encore activée.')
      return ctx.response.redirect().toRoute('login')
    }
    return ctx.response.redirect(new GithubOAuth(ctx).redirectUrl())
  }

  async callback(ctx: HttpContext) {
    const { auth, response, session } = ctx
    if (!githubEnabled()) return response.redirect().toRoute('login')

    const profile = await new GithubOAuth(ctx).user().catch(() => null)
    if (!profile) {
      session.flash('error', 'Connexion GitHub annulée ou expirée. Réessayez.')
      return response.redirect().toRoute('login')
    }

    let user = await User.findBy('githubId', profile.id)

    if (!user && profile.email) {
      // Link the GitHub account to an existing account with the same e-mail.
      const existing = await User.findBy('email', profile.email.toLowerCase())
      if (existing && !existing.emailVerifiedAt) {
        // Local e-mails are not verified: auto-linking would let anyone who
        // registered with someone else's address capture their GitHub login.
        session.flash(
          'error',
          'Un compte existe déjà avec cette adresse e-mail. Connectez-vous avec votre mot de passe.'
        )
        return response.redirect().toRoute('login')
      }
      if (existing) {
        existing.githubId = profile.id
        existing.githubUsername = profile.login
        existing.avatarUrl = existing.avatarUrl ?? profile.avatarUrl
        await existing.save()
        user = existing
      }
    }

    if (!user) {
      if (!profile.email) {
        session.flash(
          'error',
          'Votre compte GitHub n’expose aucune adresse e-mail vérifiée. Créez un compte avec votre e-mail.'
        )
        return response.redirect().toRoute('register')
      }
      user = await User.create({
        githubId: profile.id,
        githubUsername: profile.login,
        username: await this.availableUsername(profile.login),
        name: profile.name,
        email: profile.email.toLowerCase(),
        avatarUrl: profile.avatarUrl,
        bio: profile.bio?.slice(0, 280) ?? null,
        location: profile.location?.slice(0, 100) ?? null,
        websiteUrl:
          profile.blog && /^https?:\/\//.test(profile.blog) ? profile.blog.slice(0, 255) : null,
        twitterUsername: profile.twitterUsername,
        password: null,
        role: 'member',
        // GitHub only returns verified addresses.
        emailVerifiedAt: DateTime.now(),
      })
      session.flash('success', `Bienvenue dans la communauté, ${user.displayName} !`)
    } else {
      session.flash('success', `Bon retour, ${user.displayName} !`)
    }

    if (user.isBanned) {
      session.flash('error', 'Ce compte a été suspendu.')
      return response.redirect().toRoute('login')
    }

    await auth.use('web').login(user, true)
    return response.redirect().toPath('/dashboard')
  }

  private async availableUsername(login: string) {
    const base =
      login
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 24) || 'membre'
    let candidate = RESERVED_USERNAMES.includes(base) ? `${base}-dev` : base
    while (await User.findBy('username', candidate)) {
      candidate = `${base}-${string.random(4).toLowerCase()}`
    }
    return candidate
  }
}
