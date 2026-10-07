import env from '#start/env'

/**
 * Social authentication providers. GitHub OAuth is implemented by
 * "app/services/github_oauth.ts" (no third-party dependency).
 *
 * The provider is considered disabled when its credentials are missing,
 * which hides the "Continuer avec GitHub" button in the UI.
 */
const socialConfig = {
  github: {
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackPath: '/auth/github/callback',
    scopes: ['read:user', 'user:email'],
  },
}

export function githubEnabled() {
  return Boolean(socialConfig.github.clientId && socialConfig.github.clientSecret)
}

export default socialConfig
