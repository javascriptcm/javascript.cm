import type { HttpContext } from '@adonisjs/core/http'
import socialConfig, { googleEnabled } from '#config/ally'
import {
  buildUrl,
  callbackUrl,
  cleanText,
  consumeState,
  decodeJwtClaims,
  fetchJson,
  formBody,
  httpsUrl,
  pkceChallenge,
  randomToken,
  safeEqual,
  saveState,
  validIdTokenClaims,
} from '#services/social/oauth'
import type { SocialProfile, SocialProvider } from '#services/social/types'

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com']

/**
 * Google sign-in (OpenID Connect, authorization code flow + PKCE S256).
 *
 * The identity comes from the ID token returned by Google's token endpoint:
 * it is received over TLS directly from Google, so (OpenID Connect Core
 * §3.1.3.7) its signature does not need to be checked; its claims are.
 */
const google: SocialProvider = {
  name: 'google',
  label: 'Google',
  column: 'googleId',
  callbackMethod: 'GET',

  enabled: googleEnabled,

  authorizationUrl(ctx: HttpContext) {
    const state = randomToken()
    const nonce = randomToken()
    const verifier = randomToken(48)
    saveState(ctx, 'google', { state, nonce, verifier })

    return buildUrl(AUTHORIZE_URL, {
      client_id: socialConfig.google.clientId!,
      redirect_uri: callbackUrl(socialConfig.google.callbackPath),
      response_type: 'code',
      scope: socialConfig.google.scopes.join(' '),
      state,
      nonce,
      code_challenge: pkceChallenge(verifier),
      code_challenge_method: 'S256',
      prompt: 'select_account',
    })
  },

  async profile(ctx: HttpContext): Promise<SocialProfile | null> {
    const { request } = ctx
    const saved = consumeState(ctx, 'google')
    const code = request.input('code')
    if (
      typeof code !== 'string' ||
      !code ||
      !saved?.verifier ||
      !safeEqual(request.input('state'), saved.state)
    ) {
      return null
    }

    const clientId = socialConfig.google.clientId!
    const token = await fetchJson(
      TOKEN_URL,
      formBody({
        client_id: clientId,
        client_secret: socialConfig.google.clientSecret!,
        code,
        code_verifier: saved.verifier,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl(socialConfig.google.callbackPath),
      })
    )
    if (!token.ok) return null

    const claims = decodeJwtClaims(token.body?.id_token)
    if (!validIdTokenClaims(claims, { issuers: ISSUERS, audience: clientId, nonce: saved.nonce })) {
      return null
    }

    const email = typeof claims.email === 'string' && claims.email ? claims.email : null
    return {
      provider: 'google',
      id: claims.sub,
      email,
      // Strict: only a boolean true counts as verified.
      emailVerified: email !== null && claims.email_verified === true,
      name: cleanText(claims.name, 120),
      avatarUrl: httpsUrl(claims.picture),
      // The name, not the e-mail: the local part of an address is private.
      usernameHint: cleanText(claims.name, 120) ?? cleanText(claims.given_name, 60),
      extras: {},
    }
  },
}

export default google
