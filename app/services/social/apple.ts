import { createPrivateKey, sign } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import socialConfig, { appleEnabled } from '#config/ally'
import {
  buildUrl,
  callbackUrl,
  cleanText,
  consumeState,
  decodeJwtClaims,
  fetchJson,
  formBody,
  randomToken,
  safeEqual,
  saveState,
  validIdTokenClaims,
} from '#services/social/oauth'
import type { SocialProfile, SocialProvider } from '#services/social/types'

const AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize'
const TOKEN_URL = 'https://appleid.apple.com/auth/token'
const ISSUER = 'https://appleid.apple.com'

/** Lifetime of the client secret JWT (Apple accepts up to 6 months). */
const CLIENT_SECRET_TTL = 10 * 60

/**
 * Parse the .p8 key (PEM, PKCS#8). Escaped "\n" (one-line env values) are
 * turned back into newlines. Sign in with Apple keys are P-256 (ES256).
 */
function privateKey(pem: string) {
  const key = createPrivateKey(pem.replace(/\\n/g, '\n').trim())
  if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') {
    throw new Error('APPLE_PRIVATE_KEY must be the P-256 (ES256) .p8 key issued by Apple')
  }
  return key
}

/**
 * Client secret of the token request: a short-lived JWT signed ES256 with
 * the .p8 key (header "kid"; claims iss = Team ID, sub = Services ID).
 * JOSE expects the raw r||s signature, hence "ieee-p1363".
 */
export function appleClientSecret(now = Math.floor(Date.now() / 1000)) {
  const { clientId, teamId, keyId, privateKey: pem } = socialConfig.apple
  if (!clientId || !teamId || !keyId || !pem) {
    throw new Error('Sign in with Apple is not configured')
  }

  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const header = { alg: 'ES256', kid: keyId }
  const claims = { iss: teamId, iat: now, exp: now + CLIENT_SECRET_TTL, aud: ISSUER, sub: clientId }
  const signingInput = `${encode(header)}.${encode(claims)}`
  const signature = sign('sha256', Buffer.from(signingInput), {
    key: privateKey(pem),
    dsaEncoding: 'ieee-p1363',
  })
  return `${signingInput}.${signature.toString('base64url')}`
}

/**
 * Apple sends the user's name only once, on the first authorization, in the
 * (unsigned) "user" JSON field of the POST. Only the name is used from it:
 * the e-mail always comes from the ID token.
 */
function nameFromUserField(value: unknown) {
  if (typeof value !== 'string' || !value || value.length > 2000) return null
  try {
    const user = JSON.parse(value)
    const first = cleanText(user?.name?.firstName, 60)
    const last = cleanText(user?.name?.lastName, 60)
    return cleanText([first, last].filter(Boolean).join(' '), 120)
  } catch {
    return null
  }
}

/** Apple sends booleans either as JSON booleans or as "true"/"false". */
function claimFlag(value: unknown) {
  return value === true || value === 'true'
}

/**
 * Sign in with Apple for the web (authorization code flow, response_mode
 * "form_post"): Apple POSTs the code cross-site to the callback, so the
 * state cookie is SameSite=None; Secure and the route is excluded from CSRF
 * (the state check protects it instead).
 */
const apple: SocialProvider = {
  name: 'apple',
  label: 'Apple',
  column: 'appleId',
  callbackMethod: 'POST',

  enabled: appleEnabled,

  authorizationUrl(ctx: HttpContext) {
    const state = randomToken()
    const nonce = randomToken()
    saveState(ctx, 'apple', { state, nonce }, { crossSite: true })

    return buildUrl(AUTHORIZE_URL, {
      client_id: socialConfig.apple.clientId!,
      redirect_uri: callbackUrl(socialConfig.apple.callbackPath),
      response_type: 'code',
      response_mode: 'form_post',
      scope: socialConfig.apple.scopes.join(' '),
      state,
      nonce,
    })
  },

  async profile(ctx: HttpContext): Promise<SocialProfile | null> {
    const { request } = ctx
    const saved = consumeState(ctx, 'apple', { crossSite: true })
    const code = request.input('code')
    if (
      request.method() !== 'POST' ||
      typeof code !== 'string' ||
      !code ||
      !saved ||
      !safeEqual(request.input('state'), saved.state)
    ) {
      return null
    }

    const clientId = socialConfig.apple.clientId!
    const token = await fetchJson(
      TOKEN_URL,
      formBody({
        client_id: clientId,
        client_secret: appleClientSecret(),
        code,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl(socialConfig.apple.callbackPath),
      })
    )
    if (!token.ok) return null

    const claims = decodeJwtClaims(token.body?.id_token)
    if (
      !validIdTokenClaims(claims, { issuers: [ISSUER], audience: clientId, nonce: saved.nonce })
    ) {
      return null
    }

    const email = typeof claims.email === 'string' && claims.email ? claims.email : null
    const name = nameFromUserField(request.input('user'))
    return {
      provider: 'apple',
      id: claims.sub,
      email,
      // Apple verifies its addresses (relay ones included); it only flags
      // "false" for some "Sign in with Apple at Work & School" accounts.
      emailVerified:
        email !== null && claims.email_verified !== false && claims.email_verified !== 'false',
      name,
      avatarUrl: null,
      usernameHint: name,
      extras: { privateEmail: claimFlag(claims.is_private_email) },
    }
  },
}

export default apple
