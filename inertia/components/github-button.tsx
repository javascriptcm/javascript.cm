import { cn } from '~/lib/format'

/**
 * Plain anchor (not an Inertia visit): the OAuth flow leaves the site.
 */
export function GithubButton({ label = 'Continuer avec GitHub', className }: { label?: string; className?: string }) {
  return (
    <a
      href="/auth/github"
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-3 rounded-sm border border-ink bg-card text-[15px] font-medium transition-colors duration-150 hover:bg-ink hover:text-paper',
        className
      )}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
        <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
      </svg>
      {label}
    </a>
  )
}
