import type { HttpContext } from '@adonisjs/core/http'
import socialConfig, { githubEnabled } from '#config/ally'
import {
  buildUrl,
  callbackUrl,
  cleanText,
  consumeState,
  fetchJson,
  httpsUrl,
  randomToken,
  safeEqual,
  saveState,
} from '#services/social/oauth'
import type { SocialProfile, SocialProvider } from '#services/social/types'

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const TOKEN_URL = 'https://github.com/login/oauth/access_token'
const API_URL = 'https://api.github.com'

/**
 * GitHub OAuth app (authorization code flow, state in an encrypted cookie).
 * GitHub only exposes verified addresses: the public profile e-mail must be
 * verified, and the fallback picks the primary verified one.
 */
const github: SocialProvider = {
  name: 'github',
  label: 'GitHub',
  column: 'githubId',
  callbackMethod: 'GET',

  enabled: githubEnabled,

  authorizationUrl(ctx: HttpContext) {
    const state = randomToken()
    saveState(ctx, 'github', { state })

    return buildUrl(AUTHORIZE_URL, {
      client_id: socialConfig.github.clientId!,
      redirect_uri: callbackUrl(socialConfig.github.callbackPath),
      scope: socialConfig.github.scopes.join(' '),
      state,
      allow_signup: 'true',
    })
  },

  async profile(ctx: HttpContext): Promise<SocialProfile | null> {
    const { request } = ctx
    const saved = consumeState(ctx, 'github')
    const code = request.input('code')
    if (
      typeof code !== 'string' ||
      !code ||
      !saved ||
      !safeEqual(request.input('state'), saved.state)
    ) {
      return null
    }

    const token = await fetchJson(TOKEN_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: socialConfig.github.clientId,
        client_secret: socialConfig.github.clientSecret,
        code,
        redirect_uri: callbackUrl(socialConfig.github.callbackPath),
      }),
    })
    const accessToken = token.body?.access_token
    if (typeof accessToken !== 'string' || !accessToken) return null

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'javascript.cm',
    }

    const user = await fetchJson(`${API_URL}/user`, { headers })
    const profile = user.body
    if (!user.ok || !profile || profile.id === undefined || typeof profile.login !== 'string') {
      return null
    }

    let email: string | null =
      typeof profile.email === 'string' && profile.email ? profile.email : null
    if (!email) {
      const emails = await fetchJson(`${API_URL}/user/emails`, { headers })
      if (emails.ok && Array.isArray(emails.body)) {
        const primary = (
          emails.body as { email: string; primary: boolean; verified: boolean }[]
        ).find((entry) => entry.primary && entry.verified)
        email = primary?.email ?? null
      }
    }

    const blog = typeof profile.blog === 'string' ? profile.blog.trim() : ''
    return {
      provider: 'github',
      id: String(profile.id),
      email,
      emailVerified: email !== null,
      name: cleanText(profile.name, 120),
      avatarUrl: httpsUrl(profile.avatar_url),
      usernameHint: profile.login,
      extras: {
        githubUsername: profile.login.slice(0, 40),
        bio: cleanText(profile.bio, 280),
        location: cleanText(profile.location, 100),
        websiteUrl: /^https?:\/\//.test(blog) ? blog.slice(0, 255) : null,
        twitterUsername: cleanText(profile.twitter_username, 40),
      },
    }
  },
}

export default github
