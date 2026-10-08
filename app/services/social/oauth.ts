import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import type { CookieOptions } from '@adonisjs/core/types/http'
import env from '#start/env'
import type { SocialProviderName } from '#services/social/types'

/**
 * Shared building blocks of the OAuth 2.0 / OpenID Connect flows
 * (no third-party dependency: Node "crypto" and "fetch" only).
 */

/** Lifetime of the state cookie: the user has 10 minutes to sign in. */
const STATE_TTL = '10m'

/** The state cookie is only sent to "/auth/*" (authorize + callback). */
const COOKIE_PATH = '/auth'

/** Outbound calls to the providers never hang a request for long. */
const FETCH_TIMEOUT_MS = 10_000

/** Clock skew tolerated on "exp" / "iat" (seconds). */
const CLOCK_LEEWAY = 60

export type OAuthState = {
  state: string
  /** OpenID Connect nonce, echoed back in the ID token (Google, Apple). */
  nonce?: string
  /** PKCE code verifier (Google). */
  verifier?: string
}

function cookieName(provider: SocialProviderName) {
  return `oauth_${provider}`
}

/**
 * Options of the state cookie. A cross-site POST callback (Apple's
 * "form_post") only carries cookies marked SameSite=None; Secure; the
 * others keep the default SameSite=Lax (sent on the top-level GET).
 */
function cookieOptions(crossSite: boolean): Partial<CookieOptions> {
  const options: Partial<CookieOptions> = { maxAge: STATE_TTL, httpOnly: true, path: COOKIE_PATH }
  if (crossSite) {
    options.sameSite = 'none'
    options.secure = true
  } else {
    options.sameSite = 'lax'
  }
  return options
}

/** URL-safe random token (256 bits by default). */
export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

/** PKCE S256 code challenge (RFC 7636 §4.2). */
export function pkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url')
}

/** Absolute callback URL registered at the provider. */
export function callbackUrl(path: string) {
  return new URL(path, env.get('APP_URL')).toString()
}

/**
 * Query string encoded with "%20" for spaces (Apple rejects "+").
 */
export function buildUrl(base: string, params: Record<string, string>) {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  return `${base}?${query}`
}

/**
 * Store the state (and nonce / verifier) in an encrypted, HTTP-only cookie.
 */
export function saveState(
  ctx: HttpContext,
  provider: SocialProviderName,
  data: OAuthState,
  { crossSite = false } = {}
) {
  ctx.response.encryptedCookie(cookieName(provider), data, cookieOptions(crossSite))
}

/**
 * Read the state cookie and delete it: a state can be used only once.
 */
export function consumeState(
  ctx: HttpContext,
  provider: SocialProviderName,
  { crossSite = false } = {}
): OAuthState | null {
  const value = ctx.request.encryptedCookie(cookieName(provider))
  const options = cookieOptions(crossSite)
  delete options.maxAge
  ctx.response.clearCookie(cookieName(provider), options)

  if (!value || typeof value !== 'object' || typeof value.state !== 'string' || !value.state) {
    return null
  }
  return {
    state: value.state,
    nonce: typeof value.nonce === 'string' ? value.nonce : undefined,
    verifier: typeof value.verifier === 'string' ? value.verifier : undefined,
  }
}

/** Constant-time string comparison. */
export function safeEqual(a: unknown, b: unknown) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/**
 * fetch() with a timeout, returning the parsed JSON body (null when the
 * body is not JSON).
 */
export async function fetchJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  const body = (await response.json().catch(() => null)) as Record<string, any> | null
  return { ok: response.ok, status: response.status, body }
}

/** Form-encoded POST body (token endpoints). */
export function formBody(params: Record<string, string>) {
  return {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  }
}

/**
 * Decode the claims of a compact JWT without checking its signature. Only
 * used for ID tokens received directly from the provider's token endpoint
 * over TLS (OpenID Connect Core §3.1.3.7, step 6).
 */
export function decodeJwtClaims(token: unknown): Record<string, any> | null {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    return claims && typeof claims === 'object' && !Array.isArray(claims) ? claims : null
  } catch {
    return null
  }
}

/**
 * Validate the ID token claims: issuer, audience (our client id), expiry,
 * issue date, nonce (replay protection) and subject.
 */
export function validIdTokenClaims(
  claims: Record<string, any> | null,
  expected: { issuers: string[]; audience: string; nonce: string | undefined },
  now = Math.floor(Date.now() / 1000)
): claims is Record<string, any> & { sub: string } {
  if (!claims || !expected.nonce) return false
  if (!expected.issuers.includes(claims.iss)) return false

  const aud = claims.aud
  if (Array.isArray(aud)) {
    if (!aud.includes(expected.audience)) return false
    // Several audiences: the token must have been issued to us (azp).
    if (aud.length > 1 && claims.azp !== expected.audience) return false
  } else if (aud !== expected.audience) {
    return false
  }

  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_LEEWAY < now) return false
  if (
    claims.iat !== undefined &&
    (typeof claims.iat !== 'number' || claims.iat - CLOCK_LEEWAY > now)
  ) {
    return false
  }
  if (!safeEqual(claims.nonce, expected.nonce)) return false
  return typeof claims.sub === 'string' && claims.sub.length > 0 && claims.sub.length <= 255
}

/** Keep a string only when it is a non-empty https URL of reasonable size. */
export function httpsUrl(value: unknown, maxLength = 500) {
  if (typeof value !== 'string' || value.length > maxLength) return null
  return /^https:\/\/[^\s]+$/i.test(value) ? value : null
}

/** Trimmed, length-capped string or null. */
export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  const text = value.trim().replace(/\s+/g, ' ')
  return text ? text.slice(0, maxLength) : null
}
