import apple from '#services/social/apple'
import github from '#services/social/github'
import google from '#services/social/google'
import type { SocialProvider, SocialProviderName } from '#services/social/types'

export type { SocialProfile, SocialProvider, SocialProviderName } from '#services/social/types'

/**
 * Every supported provider, in display order.
 */
export const socialProviders: Record<SocialProviderName, SocialProvider> = { github, google, apple }

export const SOCIAL_PROVIDER_NAMES = Object.keys(socialProviders) as SocialProviderName[]

/**
 * The provider named `name`, only when it is supported AND configured.
 */
export function enabledProvider(name: unknown): SocialProvider | null {
  if (typeof name !== 'string' || !Object.hasOwn(socialProviders, name)) return null
  const provider = socialProviders[name as SocialProviderName]
  return provider.enabled() ? provider : null
}

/**
 * `{ github, google, apple }` flags shared with the frontend.
 */
export function socialFeatures() {
  return {
    github: github.enabled(),
    google: google.enabled(),
    apple: apple.enabled(),
  }
}
