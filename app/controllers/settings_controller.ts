import { SESSION_VERSION_KEY } from '#middleware/silent_auth_middleware'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import {
  deleteAccountValidator,
  normalizeHandle,
  passwordSettingsValidator,
  profileSettingsValidator,
} from '#validators/settings_validator'

/**
 * Account settings of the signed-in member (profile, password, deletion).
 * The forms read the current values from the shared `user` prop.
 */
export default class SettingsController {
  async profile({ inertia }: HttpContext) {
    return inertia.render('settings/profile', {})
  }

  async updateProfile({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const input = request.only([
      'name',
      'username',
      'email',
      'bio',
      'location',
      'websiteUrl',
      'avatarUrl',
      'githubUsername',
      'twitterUsername',
      'linkedinUsername',
    ])

    const data = await profileSettingsValidator.validate(
      {
        ...input,
        githubUsername: normalizeHandle(input.githubUsername, 'github'),
        twitterUsername: normalizeHandle(input.twitterUsername, 'twitter'),
        linkedinUsername: normalizeHandle(input.linkedinUsername, 'linkedin'),
      },
      { meta: { userId: user.id } }
    )

    const usernameChanged = data.username !== user.username
    if (data.email !== user.email) {
      // A new address is unverified until proven otherwise (GitHub sign-in
      // only links accounts whose e-mail is verified).
      user.emailVerifiedAt = null
    }
    user.merge({
      name: data.name,
      username: data.username,
      email: data.email,
      bio: data.bio,
      location: data.location,
      websiteUrl: data.websiteUrl,
      avatarUrl: data.avatarUrl,
      githubUsername: data.githubUsername,
      twitterUsername: data.twitterUsername,
      linkedinUsername: data.linkedinUsername,
    })
    await user.save()

    session.flash(
      'success',
      usernameChanged
        ? `Profil mis à jour. Votre nouvelle adresse : javascript.cm/@${user.username}`
        : 'Profil mis à jour.'
    )
    return response.redirect().toPath('/settings')
  }

  async password({ inertia }: HttpContext) {
    return inertia.render('settings/password', {})
  }

  async updatePassword({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, password } = await request.validateUsing(passwordSettingsValidator)

    if (user.password !== null) {
      const valid = currentPassword ? await hash.verify(user.password, currentPassword) : false
      if (!valid) {
        session.flashExcept(['currentPassword', 'password', 'passwordConfirmation'])
        session.flash('inputErrorsBag', {
          currentPassword: [
            currentPassword
              ? 'Mot de passe actuel incorrect.'
              : 'Saisissez votre mot de passe actuel.',
          ],
        })
        return response.redirect().back()
      }
    }

    const hadPassword = user.password !== null
    user.password = password // hashed by the AuthFinder mixin
    user.sessionVersion = user.sessionVersion + 1
    await user.save()

    // Sign out the other devices: their sessions carry the previous version
    // (see SilentAuthMiddleware) and their "remember me" tokens are revoked.
    await db.from('remember_me_tokens').where('tokenable_id', user.id).delete()
    session.put(SESSION_VERSION_KEY, user.sessionVersion)

    session.flash(
      'success',
      hadPassword
        ? 'Mot de passe modifié.'
        : 'Mot de passe défini : vous pouvez aussi vous connecter avec votre e-mail.'
    )
    return response.redirect().toPath('/settings/password')
  }

  async account({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const counts = await db
      .rawQuery(
        `select
          (select count(*) from articles where user_id = :id) as articles,
          (select count(*) from threads where user_id = :id) as threads,
          (select count(*) from discussions where user_id = :id) as discussions,
          (select count(*) from replies where user_id = :id) as replies`,
        { id: user.id }
      )
      .then((result) => result.rows[0])

    return inertia.render('settings/account', {
      linkedProviders: {
        github: user.githubId !== null,
        google: user.googleId !== null,
        apple: user.appleId !== null,
      },
      content: {
        articles: Number(counts.articles),
        threads: Number(counts.threads),
        discussions: Number(counts.discussions),
        replies: Number(counts.replies),
      },
    })
  }

  async destroyAccount({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { confirmation } = await request.validateUsing(deleteAccountValidator)

    if (confirmation.replace(/^@/, '').toLowerCase() !== user.username.toLowerCase()) {
      session.flash('inputErrorsBag', {
        confirmation: ['Saisissez exactement votre nom d’utilisateur pour confirmer.'],
      })
      return response.redirect().back()
    }

    if (user.isAdmin) {
      const admins = await db
        .from('users')
        .where('role', 'admin')
        .whereNull('banned_at')
        .count('* as total')
        .first()
      if (Number(admins?.total ?? 0) <= 1) {
        session.flash(
          'error',
          'Vous êtes le dernier administrateur : nommez un autre administrateur avant de supprimer votre compte.'
        )
        return response.redirect().back()
      }
    }

    await db.transaction(async (trx) => {
      // Threads and discussions of other members lose this member's replies
      // through the cascade: keep their counters right.
      const threadRows = await trx
        .from('replies')
        .select('thread_id')
        .where('user_id', user.id)
        .whereNotNull('thread_id')
      const discussionRows = await trx
        .from('replies')
        .select('discussion_id')
        .where('user_id', user.id)
        .whereNotNull('discussion_id')
      const touchedThreads = [...new Set(threadRows.map((row) => row.thread_id as number))]
      const touchedDiscussions = [
        ...new Set(discussionRows.map((row) => row.discussion_id as number)),
      ]

      user.useTransaction(trx)
      await user.delete()

      if (touchedThreads.length) {
        await trx
          .from('threads')
          .whereIn('id', touchedThreads)
          .update({
            replies_count: trx.raw(
              '(select count(*) from replies where replies.thread_id = threads.id)'
            ),
          })
      }
      if (touchedDiscussions.length) {
        await trx
          .from('discussions')
          .whereIn('id', touchedDiscussions)
          .update({
            replies_count: trx.raw(
              '(select count(*) from replies where replies.discussion_id = discussions.id)'
            ),
          })
      }
    })

    await auth.use('web').logout()
    session.flash(
      'success',
      'Votre compte a été supprimé. Merci d’avoir fait partie de la communauté.'
    )
    return response.redirect().toPath('/')
  }
}
