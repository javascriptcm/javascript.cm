import { test } from '@japa/runner'
import { createHash, generateKeyPairSync, verify, type KeyObject } from 'node:crypto'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import socialConfig from '#config/ally'
import User from '#models/user'
import { createUser } from '#tests/helpers'

/*
|--------------------------------------------------------------------------
| Social sign-in (GitHub, Google, Apple)
|--------------------------------------------------------------------------
|
| Outbound HTTP calls are answered by a stub of globalThis.fetch, and the
| provider credentials are overridden on the config object: both are
| restored after every test.
|
*/

const GOOGLE = { clientId: 'jscm-test.apps.googleusercontent.com', clientSecret: 'google-secret' }
const APPLE = { clientId: 'cm.javascript.test', teamId: 'TEAM123456', keyId: 'KEY1234567' }
const GITHUB = { clientId: 'github-client', clientSecret: 'github-secret' }

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'

type ProviderName = 'github' | 'google' | 'apple'
type FetchCall = { url: string; init: RequestInit }
type FakeResponse = { status?: number; body: unknown }

let appleKeys: { privateKey: KeyObject; publicKey: KeyObject }

/** Throwaway P-256 key, given as one line with escaped "\n" (like an env value). */
function applePem() {
  const pem = appleKeys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  return pem.replace(/\n/g, '\\n')
}

/**
 * Enable every provider with fake credentials for the current test.
 * Returns the function restoring the original values.
 */
function configureProviders() {
  const snapshot = {
    github: { ...socialConfig.github },
    google: { ...socialConfig.google },
    apple: { ...socialConfig.apple },
  }

  Object.assign(socialConfig.github, GITHUB)
  Object.assign(socialConfig.google, GOOGLE)
  Object.assign(socialConfig.apple, { ...APPLE, privateKey: applePem() })

  return () => {
    Object.assign(socialConfig.github, snapshot.github)
    Object.assign(socialConfig.google, snapshot.google)
    Object.assign(socialConfig.apple, snapshot.apple)
  }
}

/** Unconfigure providers (restored with the others after the test). */
function disableProviders(...names: ProviderName[]) {
  for (const name of names) socialConfig[name].clientId = undefined
}

/**
 * Replace globalThis.fetch: `handler` answers each call (undefined = an
 * unexpected call, which fails loudly). The group restores the original.
 */
function mockFetch(handler: (call: FetchCall) => FakeResponse | undefined) {
  const calls: FetchCall[] = []
  globalThis.fetch = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const call = { url, init }
    calls.push(call)
    const answer = handler(call)
    if (!answer) throw new Error(`Unexpected outbound request to ${url}`)
    return Response.json(answer.body, { status: answer.status ?? 200 })
  }) as typeof fetch
  return calls
}

/** Unsigned compact JWT (ID tokens are trusted through TLS, see oauth.ts). */
function idToken(claims: Record<string, unknown>) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'RS256', kid: 'test' })}.${encode(claims)}.${Buffer.from('signature').toString('base64url')}`
}

function now() {
  return Math.floor(Date.now() / 1000)
}

function googleClaims(nonce: string, overrides: Record<string, unknown> = {}) {
  return {
    iss: 'https://accounts.google.com',
    aud: GOOGLE.clientId,
    azp: GOOGLE.clientId,
    sub: '109876543210987654321',
    email: 'Ekane.Mbappe@gmail.test',
    email_verified: true,
    name: 'Ekane Mbappé',
    picture: 'https://lh3.googleusercontent.com/a/ekane',
    iat: now(),
    exp: now() + 3600,
    nonce,
    ...overrides,
  }
}

function appleClaims(nonce: string, overrides: Record<string, unknown> = {}) {
  return {
    iss: 'https://appleid.apple.com',
    aud: APPLE.clientId,
    sub: '001234.5f2c8e1a9b7d4c3e.1234',
    email: 'x7k2p9q4r1@privaterelay.appleid.com',
    email_verified: 'true',
    is_private_email: 'true',
    iat: now(),
    exp: now() + 600,
    nonce,
    ...overrides,
  }
}

const GOOGLE_STATE = { state: 'google-state', nonce: 'google-nonce', verifier: 'google-verifier' }
const APPLE_STATE = { state: 'apple-state', nonce: 'apple-nonce' }

/** Answer the Google token endpoint with an ID token built from `claims`. */
function googleAnswers(claims: Record<string, unknown>) {
  return mockFetch(({ url }) =>
    url === GOOGLE_TOKEN_URL
      ? { body: { access_token: 'ya29.test', id_token: idToken(claims), token_type: 'Bearer' } }
      : undefined
  )
}

test.group('Social sign-in', (group) => {
  const originalFetch = globalThis.fetch

  group.setup(() => {
    appleKeys = generateKeyPairSync('ec', { namedCurve: 'P-256' })
  })
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    const restoreProviders = configureProviders()
    return () => {
      restoreProviders()
      globalThis.fetch = originalFetch
    }
  })

  test('unknown or unconfigured providers answer 404', async ({ client }) => {
    disableProviders('google', 'apple')

    for (const url of ['/auth/google', '/auth/google/callback', '/auth/apple', '/auth/facebook']) {
      const response = await client.get(url).redirects(0)
      response.assertStatus(404)
    }
    // Apple's POST callback is excluded from CSRF, but still 404 when disabled.
    const apple = await client.post('/auth/apple/callback').form({ code: 'x' }).redirects(0)
    apple.assertStatus(404)
    // Apple only answers with a POST.
    socialConfig.apple.clientId = APPLE.clientId
    const get = await client.get('/auth/apple/callback').redirects(0)
    get.assertStatus(404)
  })

  test('Google redirect stores state, nonce and PKCE verifier', async ({ client, assert }) => {
    const response = await client.get('/auth/google').redirects(0)
    response.assertStatus(302)

    const location = new URL(response.header('location')!)
    assert.equal(
      location.origin + location.pathname,
      'https://accounts.google.com/o/oauth2/v2/auth'
    )
    const params = location.searchParams
    assert.equal(params.get('client_id'), GOOGLE.clientId)
    assert.equal(params.get('redirect_uri'), 'http://localhost:3333/auth/google/callback')
    assert.equal(params.get('response_type'), 'code')
    assert.equal(params.get('scope'), 'openid email profile')
    assert.equal(params.get('prompt'), 'select_account')
    assert.equal(params.get('code_challenge_method'), 'S256')

    const saved = response.cookie('oauth_google')!.value
    assert.equal(params.get('state'), saved.state)
    assert.equal(params.get('nonce'), saved.nonce)
    assert.equal(
      params.get('code_challenge'),
      createHash('sha256').update(saved.verifier).digest('base64url')
    )
    assert.isAtLeast(saved.state.length, 40)
  })

  test('Apple redirect uses form_post and a SameSite=None state cookie', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/auth/apple').redirects(0)
    response.assertStatus(302)

    const location = new URL(response.header('location')!)
    assert.equal(location.origin + location.pathname, 'https://appleid.apple.com/auth/authorize')
    assert.equal(location.searchParams.get('response_mode'), 'form_post')
    assert.equal(location.searchParams.get('scope'), 'name email')
    // Spaces are encoded as %20 (Apple rejects "+").
    assert.include(response.header('location'), 'scope=name%20email')

    const cookie = response.cookie('oauth_apple')!
    assert.equal(location.searchParams.get('state'), cookie.value.state)
    assert.equal(location.searchParams.get('nonce'), cookie.value.nonce)
    assert.equal(cookie.sameSite?.toLowerCase(), 'none')
    assert.isTrue(cookie.secure)
  })

  test('a state mismatch is refused before any outbound call', async ({ client, assert }) => {
    const calls = mockFetch(() => undefined)

    const mismatch = await client
      .get('/auth/google/callback')
      .qs({ code: 'code', state: 'forged-state' })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)
    mismatch.assertStatus(302)
    mismatch.assertHeader('location', '/login')
    mismatch.assertFlashMessage('error', 'Connexion Google annulée ou expirée. Réessayez.')

    // No state cookie at all (expired or another browser).
    const missing = await client
      .get('/auth/google/callback')
      .qs({ code: 'code', state: GOOGLE_STATE.state })
      .redirects(0)
    missing.assertHeader('location', '/login')
    missing.assertFlashMessage('error', 'Connexion Google annulée ou expirée. Réessayez.')

    assert.lengthOf(calls, 0)
  })

  test('Google creates a verified account and signs it in', async ({ client, assert }) => {
    const calls = googleAnswers(googleClaims(GOOGLE_STATE.nonce))

    const response = await client
      .get('/auth/google/callback')
      .qs({ code: 'google-code', state: GOOGLE_STATE.state })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')
    response.assertFlashMessage('success', 'Bienvenue dans la communauté, Ekane Mbappé !')

    const user = await User.findByOrFail('googleId', '109876543210987654321')
    assert.equal(user.email, 'ekane.mbappe@gmail.test')
    assert.equal(user.username, 'ekane-mbappe')
    assert.equal(user.name, 'Ekane Mbappé')
    assert.equal(user.avatarUrl, 'https://lh3.googleusercontent.com/a/ekane')
    assert.isNotNull(user.emailVerifiedAt)
    assert.isNull(user.password)
    response.assertSession('auth_web', user.id)
    response.assertSession('session_version', user.sessionVersion)

    // Code exchanged with the PKCE verifier and the client secret.
    assert.lengthOf(calls, 1)
    const body = new URLSearchParams(String(calls[0].init.body))
    assert.equal(body.get('code'), 'google-code')
    assert.equal(body.get('code_verifier'), GOOGLE_STATE.verifier)
    assert.equal(body.get('client_secret'), GOOGLE.clientSecret)
    assert.equal(body.get('grant_type'), 'authorization_code')
    assert.equal(body.get('redirect_uri'), 'http://localhost:3333/auth/google/callback')
  })

  test('Google refuses an unverified e-mail', async ({ client, assert }) => {
    googleAnswers(googleClaims(GOOGLE_STATE.nonce, { email_verified: false }))

    const response = await client
      .get('/auth/google/callback')
      .qs({ code: 'google-code', state: GOOGLE_STATE.state })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)

    response.assertHeader('location', '/login')
    response.assertFlashMessage(
      'error',
      'Votre adresse e-mail Google n’est pas vérifiée. Vérifiez-la auprès de Google, ou créez un compte avec votre e-mail.'
    )
    response.assertSessionMissing('auth_web')
    assert.isNull(await User.findBy('googleId', '109876543210987654321'))
  })

  test('Google refuses an ID token with another nonce, audience or expiry', async ({
    client,
    assert,
  }) => {
    for (const overrides of [
      { nonce: 'replayed-nonce' },
      { aud: 'another-client.apps.googleusercontent.com' },
      { iss: 'https://evil.test' },
      { exp: now() - 3600 },
    ]) {
      googleAnswers(googleClaims(GOOGLE_STATE.nonce, overrides))
      const response = await client
        .get('/auth/google/callback')
        .qs({ code: 'google-code', state: GOOGLE_STATE.state })
        .withEncryptedCookie('oauth_google', GOOGLE_STATE)
        .redirects(0)
      response.assertHeader('location', '/login')
      response.assertFlashMessage('error', 'Connexion Google annulée ou expirée. Réessayez.')
    }
    assert.isNull(await User.findBy('googleId', '109876543210987654321'))
  })

  test('links an existing account only when its e-mail is verified', async ({ client, assert }) => {
    const verified = await createUser({
      email: 'ekane.mbappe@gmail.test',
      emailVerifiedAt: DateTime.now(),
    })
    googleAnswers(googleClaims(GOOGLE_STATE.nonce))
    const linked = await client
      .get('/auth/google/callback')
      .qs({ code: 'google-code', state: GOOGLE_STATE.state })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)
    linked.assertHeader('location', '/dashboard')
    linked.assertSession('auth_web', verified.id)
    await verified.refresh()
    assert.equal(verified.googleId, '109876543210987654321')

    const unverified = await createUser({ email: 'ngono@gmail.test', emailVerifiedAt: null })
    googleAnswers(googleClaims(GOOGLE_STATE.nonce, { sub: '200', email: 'ngono@gmail.test' }))
    const refused = await client
      .get('/auth/google/callback')
      .qs({ code: 'google-code', state: GOOGLE_STATE.state })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)
    refused.assertHeader('location', '/login')
    refused.assertFlashMessage(
      'error',
      'Un compte existe déjà avec cette adresse e-mail. Connectez-vous avec votre mot de passe.'
    )
    refused.assertSessionMissing('auth_web')
    await unverified.refresh()
    assert.isNull(unverified.googleId)
  })

  test('never replaces the Google account already linked to an account', async ({
    client,
    assert,
  }) => {
    const user = await createUser({
      email: 'ekane.mbappe@gmail.test',
      emailVerifiedAt: DateTime.now(),
      googleId: 'original-google-account',
    })
    googleAnswers(googleClaims(GOOGLE_STATE.nonce))

    const response = await client
      .get('/auth/google/callback')
      .qs({ code: 'google-code', state: GOOGLE_STATE.state })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)
    response.assertHeader('location', '/login')
    response.assertSessionMissing('auth_web')
    await user.refresh()
    assert.equal(user.googleId, 'original-google-account')
  })

  test('banned members are refused', async ({ client }) => {
    await createUser({ googleId: '109876543210987654321', bannedAt: DateTime.now() })
    googleAnswers(googleClaims(GOOGLE_STATE.nonce))

    const response = await client
      .get('/auth/google/callback')
      .qs({ code: 'google-code', state: GOOGLE_STATE.state })
      .withEncryptedCookie('oauth_google', GOOGLE_STATE)
      .redirects(0)
    response.assertHeader('location', '/login')
    response.assertFlashMessage('error', 'Ce compte a été suspendu.')
    response.assertSessionMissing('auth_web')
  })

  test('Apple form_post callback: no CSRF token, state checked, name from "user"', async ({
    client,
    assert,
  }) => {
    const calls = mockFetch(({ url }) =>
      url === APPLE_TOKEN_URL
        ? { body: { access_token: 'a.b', id_token: idToken(appleClaims(APPLE_STATE.nonce)) } }
        : undefined
    )

    // Cross-site POST from appleid.apple.com: no CSRF token is sent.
    const response = await client
      .post('/auth/apple/callback')
      .form({
        code: 'apple-code',
        state: APPLE_STATE.state,
        user: JSON.stringify({
          name: { firstName: 'Ngo', lastName: 'Biyong' },
          email: 'attacker@example.test',
        }),
      })
      .withEncryptedCookie('oauth_apple', APPLE_STATE)
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')
    const user = await User.findByOrFail('appleId', '001234.5f2c8e1a9b7d4c3e.1234')
    assert.equal(user.name, 'Ngo Biyong')
    assert.equal(user.username, 'ngo-biyong')
    // The e-mail comes from the ID token, never from the unsigned "user" field.
    assert.equal(user.email, 'x7k2p9q4r1@privaterelay.appleid.com')
    assert.isNotNull(user.emailVerifiedAt)
    response.assertSession('auth_web', user.id)

    assert.lengthOf(calls, 1)
    const body = new URLSearchParams(String(calls[0].init.body))
    assert.equal(body.get('client_id'), APPLE.clientId)
    assert.equal(body.get('code'), 'apple-code')
    assert.equal(body.get('redirect_uri'), 'http://localhost:3333/auth/apple/callback')

    // The client secret is an ES256 JWT signed with the .p8 key.
    const [header, claims, signature] = body.get('client_secret')!.split('.')
    assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url').toString()), {
      alg: 'ES256',
      kid: APPLE.keyId,
    })
    const payload = JSON.parse(Buffer.from(claims, 'base64url').toString())
    assert.equal(payload.iss, APPLE.teamId)
    assert.equal(payload.sub, APPLE.clientId)
    assert.equal(payload.aud, 'https://appleid.apple.com')
    assert.isAtMost(payload.iat, now())
    assert.isAbove(payload.exp, now())
    assert.isAtMost(payload.exp - payload.iat, 15_777_000)
    const raw = Buffer.from(signature, 'base64url')
    assert.lengthOf(raw, 64)
    assert.isTrue(
      verify(
        'sha256',
        Buffer.from(`${header}.${claims}`),
        { key: appleKeys.publicKey, dsaEncoding: 'ieee-p1363' },
        raw
      )
    )
  })

  test('Apple callback with a forged state is refused', async ({ client, assert }) => {
    const calls = mockFetch(() => undefined)

    const response = await client
      .post('/auth/apple/callback')
      .form({ code: 'apple-code', state: 'forged-state' })
      .withEncryptedCookie('oauth_apple', APPLE_STATE)
      .redirects(0)
    response.assertHeader('location', '/login')
    response.assertFlashMessage('error', 'Connexion Apple annulée ou expirée. Réessayez.')
    response.assertSessionMissing('auth_web')
    assert.lengthOf(calls, 0)

    // The user cancelled on Apple's side.
    const cancelled = await client
      .post('/auth/apple/callback')
      .form({ error: 'user_cancelled_authorize', state: APPLE_STATE.state })
      .withEncryptedCookie('oauth_apple', APPLE_STATE)
      .redirects(0)
    cancelled.assertHeader('location', '/login')
    cancelled.assertFlashMessage('error', 'Connexion Apple annulée ou expirée. Réessayez.')
  })

  test('GitHub keeps working through the shared controller', async ({ client, assert }) => {
    const calls = mockFetch(({ url }) => {
      if (url === 'https://github.com/login/oauth/access_token') {
        return { body: { access_token: 'gho_test' } }
      }
      if (url === 'https://api.github.com/user') {
        return {
          body: {
            id: 4242,
            login: 'Ekane-Dev',
            name: 'Ekane',
            email: null,
            avatar_url: 'https://avatars.githubusercontent.com/u/4242',
            bio: 'Développeur à Douala',
            location: 'Douala',
            blog: 'https://ekane.dev',
            twitter_username: 'ekane',
          },
        }
      }
      if (url === 'https://api.github.com/user/emails') {
        return {
          body: [
            { email: 'old@example.test', primary: false, verified: true },
            { email: 'ekane@example.test', primary: true, verified: true },
          ],
        }
      }
      return undefined
    })

    const response = await client
      .get('/auth/github/callback')
      .qs({ code: 'github-code', state: 'github-state' })
      .withEncryptedCookie('oauth_github', { state: 'github-state' })
      .redirects(0)
    response.assertHeader('location', '/dashboard')

    const user = await User.findByOrFail('githubId', '4242')
    assert.equal(user.username, 'ekane-dev')
    assert.equal(user.githubUsername, 'Ekane-Dev')
    assert.equal(user.email, 'ekane@example.test')
    assert.equal(user.websiteUrl, 'https://ekane.dev')
    assert.isNotNull(user.emailVerifiedAt)
    assert.lengthOf(calls, 3)
  })

  test('shares the enabled providers with the pages', async ({ client }) => {
    disableProviders('apple')
    const response = await client.get('/login').withInertia()
    response.assertInertiaPropsContains({ features: { github: true, google: true, apple: false } })
  })
})
