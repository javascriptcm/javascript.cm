import { usePage } from '@inertiajs/react'
import type { ComponentType } from 'react'
import { cn } from '~/lib/format'

type ProviderName = 'github' | 'google' | 'apple'
type SocialFeatures = Partial<Record<ProviderName, boolean>>

/**
 * True when at least one social provider is configured (shows the
 * buttons and the "ou" divider).
 */
export function hasSocialProviders(features: SocialFeatures | undefined) {
  return Boolean(features?.github || features?.google || features?.apple)
}

const base =
  'inline-flex h-12 w-full items-center justify-center gap-3 rounded-sm border border-ink px-4 text-[15px] font-medium tracking-[-0.01em] transition-colors duration-150 active:translate-y-px'

const providers: {
  name: ProviderName
  label: string
  className: string
  Logo: ComponentType
}[] = [
  {
    name: 'github',
    label: 'Continuer avec GitHub',
    className: 'bg-card text-ink hover:bg-ink hover:text-paper',
    Logo: GithubMark,
  },
  {
    // Google: multicolour "G" on a light surface (dark surface on hover and
    // in dark mode, both allowed by Google's light/dark button themes).
    name: 'google',
    label: 'Continuer avec Google',
    className: 'bg-card text-ink hover:bg-ink hover:text-paper',
    Logo: GoogleMark,
  },
  {
    // Apple: "black" style (ink block, paper text), which the tokens turn
    // into the "white" style in dark mode.
    name: 'apple',
    label: 'Continuer avec Apple',
    className: 'bg-ink text-paper hover:bg-card hover:text-ink',
    Logo: AppleMark,
  },
]

/**
 * "Continuer avec …" buttons of the configured providers. Plain anchors,
 * not Inertia visits: the OAuth flow leaves the site.
 */
export function SocialButtons({ className }: { className?: string }) {
  const { features } = usePage().props
  const enabled = providers.filter((provider) => features?.[provider.name])
  if (enabled.length === 0) return null

  return (
    <div className={cn('grid gap-3', className)}>
      {enabled.map(({ name, label, className: variant, Logo }) => (
        <a key={name} href={`/auth/${name}`} rel="nofollow" className={cn(base, variant)}>
          <Logo />
          {label}
        </a>
      ))}
    </div>
  )
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

/** Official multicolour Google "G" (brand colours are part of the mark). */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}
