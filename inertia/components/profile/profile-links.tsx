import {
  ArrowUpRight,
  Briefcase,
  Code,
  GitBranch,
  Globe,
  Link2,
  MessagesSquare,
  Newspaper,
  Package,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

type Mark = (props: { className?: string }) => ReactNode

function svgMark(path: string): Mark {
  return function BrandMark({ className }) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        aria-hidden="true"
        fill="currentColor"
        className={className}
      >
        <path d={path} />
      </svg>
    )
  }
}

const GithubMark = svgMark(
  'M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z'
)

const LinkedinMark = svgMark(
  'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z'
)

const XMark = svgMark(
  'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z'
)

const YoutubeMark = svgMark(
  'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z'
)

function lucideMark(Icon: LucideIcon): Mark {
  return function LucideMark({ className }) {
    return <Icon size={16} strokeWidth={1.75} aria-hidden="true" className={className} />
  }
}

const LinkMark = lucideMark(Link2)
const BriefcaseMark = lucideMark(Briefcase)
const GlobeMark = lucideMark(Globe)
const GitMark = lucideMark(GitBranch)
const ArticleMark = lucideMark(Newspaper)
const DesignMark = lucideMark(Palette)
const QaMark = lucideMark(MessagesSquare)
const CodeMark = lucideMark(Code)
const PackageMark = lucideMark(Package)

/**
 * Icon of a custom link, guessed from its host name.
 */
function markForUrl(url: string): Mark {
  let host = ''
  try {
    host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return LinkMark
  }
  const is = (...domains: string[]) => domains.some((d) => host === d || host.endsWith(`.${d}`))
  if (is('github.com')) return GithubMark
  if (is('linkedin.com')) return LinkedinMark
  if (is('x.com', 'twitter.com')) return XMark
  if (is('youtube.com', 'youtu.be')) return YoutubeMark
  if (is('gitlab.com', 'bitbucket.org', 'codeberg.org')) return GitMark
  if (is('dev.to', 'medium.com', 'hashnode.dev', 'hashnode.com', 'substack.com')) return ArticleMark
  if (is('behance.net', 'dribbble.com', 'figma.com')) return DesignMark
  if (is('stackoverflow.com', 'stackexchange.com')) return QaMark
  if (is('codepen.io', 'codesandbox.io', 'stackblitz.com', 'replit.com')) return CodeMark
  if (is('npmjs.com')) return PackageMark
  return LinkMark
}

export type ProfileLinkItem = {
  key: string
  label: string
  href: string
  display: string
  Mark: Mark
}

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

type LinkSource = {
  portfolioUrl?: string | null
  websiteUrl?: string | null
  githubUsername?: string | null
  linkedinUsername?: string | null
  twitterUsername?: string | null
  links?: { label: string; url: string }[]
}

/**
 * Every link of a profile, portfolio first, then the personal site, the
 * networks and the custom links.
 */
export function profileLinks(profile: LinkSource): ProfileLinkItem[] {
  const items: ProfileLinkItem[] = []
  if (profile.portfolioUrl) {
    items.push({
      key: 'portfolio',
      label: 'Portfolio',
      href: profile.portfolioUrl,
      display: displayUrl(profile.portfolioUrl),
      Mark: BriefcaseMark,
    })
  }
  if (profile.websiteUrl) {
    items.push({
      key: 'website',
      label: 'Site personnel',
      href: profile.websiteUrl,
      display: displayUrl(profile.websiteUrl),
      Mark: GlobeMark,
    })
  }
  if (profile.githubUsername) {
    items.push({
      key: 'github',
      label: 'GitHub',
      href: `https://github.com/${profile.githubUsername}`,
      display: profile.githubUsername,
      Mark: GithubMark,
    })
  }
  if (profile.linkedinUsername) {
    items.push({
      key: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/in/${profile.linkedinUsername}`,
      display: profile.linkedinUsername,
      Mark: LinkedinMark,
    })
  }
  if (profile.twitterUsername) {
    items.push({
      key: 'x',
      label: 'X',
      href: `https://x.com/${profile.twitterUsername}`,
      display: `@${profile.twitterUsername}`,
      Mark: XMark,
    })
  }
  for (const [i, link] of (profile.links ?? []).entries()) {
    items.push({
      key: `link-${i}`,
      label: link.label,
      href: link.url,
      display: displayUrl(link.url),
      Mark: markForUrl(link.url),
    })
  }
  return items
}

/**
 * Hairline list of profile links: icon, label, address.
 * rel="me" lets the member prove ownership (Mastodon, IndieWeb).
 */
export function ProfileLinkList({
  items,
  className,
}: {
  items: ProfileLinkItem[]
  className?: string
}) {
  return (
    <ul className={cn('border-t border-line', className)}>
      {items.map(({ key, label, href, display, Mark }) => (
        <li key={key} className="border-b border-line">
          <a
            href={href}
            target="_blank"
            rel="me nofollow noopener noreferrer"
            className="group grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3 transition-colors duration-150 hover:bg-paper-2 focus-visible:bg-paper-2"
          >
            <Mark className="text-muted transition-colors duration-150 group-hover:text-ink" />
            <span className="min-w-0">
              <span className="block text-[15px] leading-tight font-medium text-ink">{label}</span>
              <span className="mt-0.5 block truncate font-mono text-[12px] text-muted">
                {display}
              </span>
            </span>
            <ArrowUpRight
              size={14}
              className="text-muted transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
              aria-hidden="true"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
