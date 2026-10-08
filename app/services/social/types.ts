import type { HttpContext } from '@adonisjs/core/http'

export type SocialProviderName = 'github' | 'google' | 'apple'

/**
 * Optional profile data a provider may contribute to a new account.
 */
export type SocialExtras = {
  githubUsername?: string | null
  bio?: string | null
  location?: string | null
  websiteUrl?: string | null
  twitterUsername?: string | null
  /** Apple "Hide My Email" relay address. */
  privateEmail?: boolean
}

/**
 * Normalised identity returned by every provider after a successful
 * callback. `id` is the provider's stable account identifier (GitHub user
 * id, OpenID Connect "sub" for Google and Apple), never the e-mail.
 */
export type SocialProfile = {
  provider: SocialProviderName
  id: string
  email: string | null
  /** True only when the provider vouches for the address. */
  emailVerified: boolean
  name: string | null
  avatarUrl: string | null
  /** Suggested username for a new account (made unique by the controller). */
  usernameHint: string | null
  extras: SocialExtras
}

/**
 * Users table column holding the provider account id.
 */
export type SocialIdColumn = 'githubId' | 'googleId' | 'appleId'

export interface SocialProvider {
  name: SocialProviderName
  /** Brand name shown in messages ("GitHub", "Google", "Apple"). */
  label: string
  column: SocialIdColumn
  /** HTTP method of the callback: Apple posts the result (form_post). */
  callbackMethod: 'GET' | 'POST'
  /** True when every credential of the provider is configured. */
  enabled(): boolean
  /**
   * Store a fresh state (+ nonce, PKCE verifier) in an encrypted cookie and
   * return the provider's authorization URL.
   */
  authorizationUrl(ctx: HttpContext): string
  /**
   * Validate the callback (state, code exchange, ID token) and return the
   * profile, or null when the user cancelled or anything does not check out.
   */
  profile(ctx: HttpContext): Promise<SocialProfile | null>
}
