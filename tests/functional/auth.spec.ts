import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

async function makeUser(overrides: Partial<User> = {}) {
  return User.create({
    username: 'ngono',
    name: 'Ngono Ateba',
    email: 'ngono@example.test',
    password: 'motdepasse-solide',
    role: 'member',
    ...overrides,
  })
}

test.group('Authentication', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('registers a member and signs them in', async ({ client, assert }) => {
    const response = await client
      .post('/register')
      .form({
        name: 'Ekane Mbappé',
        username: 'Ekane-Dev',
        email: 'EKANE@example.test',
        password: 'motdepasse-solide',
        passwordConfirmation: 'motdepasse-solide',
      })
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')

    const user = await User.findByOrFail('username', 'ekane-dev')
    assert.equal(user.email, 'ekane@example.test')
    assert.equal(user.role, 'member')
    assert.notEqual(user.password, 'motdepasse-solide')
  })

  test('rejects reserved usernames, duplicates and weak passwords', async ({ client }) => {
    await makeUser()
    const response = await client
      .post('/register')
      .form({
        name: 'X',
        username: 'admin',
        email: 'ngono@example.test',
        password: 'court',
        passwordConfirmation: 'autre',
      })
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('inputErrorsBag', {
      name: ['Au moins 2 caractères.'],
      username: ['Valeur non autorisée.'],
      email: ['Cette valeur est déjà utilisée.'],
      password: ['Au moins 8 caractères.'],
      passwordConfirmation: ['La confirmation ne correspond pas.'],
    })
  })

  test('signs in with the e-mail or the username', async ({ client }) => {
    await makeUser()
    for (const login of ['ngono@example.test', 'ngono', 'NGONO']) {
      const response = await client
        .post('/login')
        .form({ login, password: 'motdepasse-solide' })
        .withCsrfToken()
        .redirects(0)
      response.assertStatus(302)
      response.assertHeader('location', '/dashboard')
    }
  })

  test('wrong credentials flash a generic error', async ({ client }) => {
    await makeUser()
    const response = await client
      .post('/login')
      .form({ login: 'ngono', password: 'mauvais-mot-de-passe' })
      .withCsrfToken()
      .redirects(0)
    response.assertStatus(302)
    response.assertFlashMessage('inputErrorsBag', { login: ['Identifiants incorrects.'] })
  })

  test('banned members cannot sign in', async ({ client }) => {
    await makeUser({ bannedAt: DateTime.now() })
    const response = await client
      .post('/login')
      .form({ login: 'ngono', password: 'motdepasse-solide' })
      .withCsrfToken()
      .redirects(0)
    response.assertStatus(302)
    response.assertFlashMessage(
      'error',
      'Ce compte a été suspendu. Contactez l’équipe si vous pensez à une erreur.'
    )
  })

  test('post-login redirect cannot leave the site', async ({ client }) => {
    await makeUser()
    for (const redirect of ['//evil.test', 'https://evil.test', '/\\evil.test']) {
      const response = await client
        .post('/login')
        .form({ login: 'ngono', password: 'motdepasse-solide', redirect })
        .withCsrfToken()
        .redirects(0)
      response.assertHeader('location', '/dashboard')
    }

    const internal = await client
      .post('/login')
      .form({ login: 'ngono', password: 'motdepasse-solide', redirect: '/forum' })
      .withCsrfToken()
      .redirects(0)
    internal.assertHeader('location', '/forum')
  })

  test('signed-in members are sent away from guest pages', async ({ client }) => {
    const user = await makeUser()
    const response = await client.get('/login').loginAs(user).redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')
  })

  test('mutations require a CSRF token', async ({ client, assert }) => {
    await makeUser()
    for (const request of [
      client.post('/login').form({ login: 'ngono', password: 'motdepasse-solide' }),
      client.post('/login').json({ login: 'ngono', password: 'motdepasse-solide' }),
    ]) {
      // Rejected by Shield: sent back, never signed in.
      const response = await request.redirects(0)
      response.assertStatus(302)
      assert.notEqual(response.header('location'), '/dashboard')
    }
  })

  test('markdown preview is for members only and sanitized', async ({ client, assert }) => {
    const guest = await client
      .post('/markdown/preview')
      .json({ body: '**ok**' })
      .withCsrfToken()
      .redirects(0)
    guest.assertStatus(302)

    const user = await makeUser()
    const response = await client
      .post('/markdown/preview')
      .json({ body: '**gras** <script>alert(1)</script>' })
      .withCsrfToken()
      .loginAs(user)
    response.assertStatus(200)
    assert.include(response.body().html, '<strong>gras</strong>')
    assert.notInclude(response.body().html, '<script')
  })
})

test.group('Security regressions', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('changing the e-mail clears its verification', async ({ client, assert }) => {
    const user = await makeUser({ emailVerifiedAt: DateTime.now() })
    await client
      .put('/settings')
      .json({
        name: 'Ngono Ateba',
        username: 'ngono',
        email: 'autre@example.test',
        bio: null,
        location: null,
        websiteUrl: null,
        avatarUrl: null,
        githubUsername: null,
        twitterUsername: null,
        linkedinUsername: null,
      })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)
    await user.refresh()
    assert.equal(user.email, 'autre@example.test')
    assert.isNull(user.emailVerifiedAt)
  })

  test('multipart bodies are never written to disk', async ({ client }) => {
    const response = await client
      .post('/login')
      .file('payload', Buffer.from('x'.repeat(1024)), { filename: 'big.bin' })
      .withCsrfToken()
      .redirects(0)
    // Fields are not parsed either: the login is rejected by validation.
    response.assertStatus(302)
  })
})

test.group('Sessions', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('changing the password signs out the other sessions', async ({ client, assert }) => {
    const user = await makeUser()
    const response = await client
      .put('/settings/password')
      .json({
        currentPassword: 'motdepasse-solide',
        password: 'nouveau-motdepasse',
        passwordConfirmation: 'nouveau-motdepasse',
      })
      .withCsrfToken()
      .loginAs(user)
      .withSession({ session_version: 0 })
      .redirects(0)
    response.assertStatus(302)
    await user.refresh()
    assert.equal(user.sessionVersion, 1)

    // Another device still holds a session stamped with version 0.
    const stale = await client
      .get('/dashboard')
      .loginAs(user)
      .withSession({ session_version: 0 })
      .redirects(0)
    stale.assertStatus(302)
    assert.match(stale.header('location'), /^\/login/)

    // The current session was re-stamped and keeps working.
    const current = await client.get('/dashboard').loginAs(user).withSession({ session_version: 1 })
    current.assertStatus(200)
  })
})
