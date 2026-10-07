import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import socialConfig from '#config/ally'
import env from '#start/env'

const STATE_COOKIE = 'gh_oauth_state'

export type GithubProfile = {
  id: string
  login: string
  name: string | null
  email: string | null
  avatarUrl: string | null
  bio: string | null
  location: string | null
  blog: string | null
  twitterUsername: string | null
}

function callbackUrl() {
  return new URL(socialConfig.github.callbackPath, env.get('APP_URL')).toString()
}

/**
 * Minimal GitHub OAuth (authorization code flow) with CSRF state cookie.
 */
export default class GithubOAuth {
  constructor(private ctx: HttpContext) {}

  redirectUrl() {
    const state = string.random(32)
    this.ctx.response.encryptedCookie(STATE_COOKIE, state, {
      maxAge: '10m',
      httpOnly: true,
      sameSite: 'lax',
    })

    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', socialConfig.github.clientId!)
    url.searchParams.set('redirect_uri', callbackUrl())
    url.searchParams.set('scope', socialConfig.github.scopes.join(' '))
    url.searchParams.set('state', state)
    url.searchParams.set('allow_signup', 'true')
    return url.toString()
  }

  /**
   * Validate the callback and fetch the GitHub profile. Returns null when
   * the user denied access or the state does not match.
   */
  async user(): Promise<GithubProfile | null> {
    const { request, response } = this.ctx
    const expectedState = request.encryptedCookie(STATE_COOKIE)
    response.clearCookie(STATE_COOKIE)

    const code = request.input('code')
    const state = request.input('state')
    if (!code || !state || !expectedState || state !== expectedState) {
      return null
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: socialConfig.github.clientId,
        client_secret: socialConfig.github.clientSecret,
        code,
        redirect_uri: callbackUrl(),
      }),
    })
    const token = (await tokenResponse.json()) as { access_token?: string }
    if (!token.access_token) return null

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token.access_token}`,
      'User-Agent': 'javascript.cm',
    }

    const profileResponse = await fetch('https://api.github.com/user', { headers })
    if (!profileResponse.ok) return null
    const profile = (await profileResponse.json()) as Record<string, any>

    let email: string | null = profile.email ?? null
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', { headers })
      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as {
          email: string
          primary: boolean
          verified: boolean
        }[]
        email = emails.find((e) => e.primary && e.verified)?.email ?? null
      }
    }

    return {
      id: String(profile.id),
      login: profile.login,
      name: profile.name ?? null,
      email,
      avatarUrl: profile.avatar_url ?? null,
      bio: profile.bio ?? null,
      location: profile.location ?? null,
      blog: profile.blog || null,
      twitterUsername: profile.twitter_username ?? null,
    }
  }
}
