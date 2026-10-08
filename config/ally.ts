import env from '#start/env'

/**
 * Social sign-in providers (GitHub, Google, Apple), implemented without any
 * third-party dependency in "app/services/social/*".
 *
 * A provider is enabled only when ALL its variables are set: otherwise its
 * button is hidden and its routes answer 404. Callback URLs to register at
 * each provider: `${APP_URL}${callbackPath}`.
 *
 * The values are read once at boot; tests override them on this object
 * (and restore them afterwards).
 */
const socialConfig = {
  github: {
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackPath: '/auth/github/callback',
    scopes: ['read:user', 'user:email'],
  },
  google: {
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackPath: '/auth/google/callback',
    scopes: ['openid', 'email', 'profile'],
  },
  apple: {
    /** Services ID (e.g. "cm.javascript.web"), used as OAuth client id. */
    clientId: env.get('APPLE_CLIENT_ID'),
    teamId: env.get('APPLE_TEAM_ID'),
    keyId: env.get('APPLE_KEY_ID'),
    /** Contents of the .p8 key (PEM). Escaped "\n" are accepted. */
    privateKey: env.get('APPLE_PRIVATE_KEY'),
    callbackPath: '/auth/apple/callback',
    scopes: ['name', 'email'],
  },
}

export function githubEnabled() {
  return Boolean(socialConfig.github.clientId && socialConfig.github.clientSecret)
}

export function googleEnabled() {
  return Boolean(socialConfig.google.clientId && socialConfig.google.clientSecret)
}

export function appleEnabled() {
  const { clientId, teamId, keyId, privateKey } = socialConfig.apple
  return Boolean(clientId && teamId && keyId && privateKey)
}

export default socialConfig
