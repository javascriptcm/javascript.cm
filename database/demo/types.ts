/**
 * Shapes of the fictional demo content seeded by
 * "database/seeders/02_demo_seeder.ts".
 *
 * These modules live outside "database/seeders" on purpose: the Lucid seeds
 * runner imports every script file found (recursively) in that folder as a
 * seeder, so data modules there would break "node ace db:seed".
 *
 * Dates are relative to the moment the seeder runs, so the content always
 * looks fresh. Every person, company and handle here is fictional.
 */

export interface DemoMember {
  username: string
  name: string
  location: string
  /** ≤ 280 characters */
  bio: string
  role?: 'member' | 'moderator'
  /** Account creation, in days before the seed runs. */
  joinedDaysAgo: number
}

export interface DemoReply {
  /** Username of a demo member. */
  author: string
  /** Hours after the parent (thread, discussion or article publication). */
  after: number
  body: string
  /** Forum threads only: the accepted answer. */
  solution?: boolean
}

export interface DemoArticle {
  author: string
  /** ≤ 160 characters */
  title: string
  /** ≤ 300 characters */
  excerpt: string
  /** Tag slugs (see 01_base_seeder). */
  tags: string[]
  /** Days before the seed; null for a draft. */
  publishedDaysAgo: number | null
  /** Drafts only: when the draft was started. */
  createdDaysAgo?: number
  featured?: boolean
  views: number
  body: string
  /** Comments, "after" = hours after publication. */
  comments?: DemoReply[]
}

export interface DemoThread {
  author: string
  /** Channel slug (see 01_base_seeder). */
  channel: string
  title: string
  daysAgo: number
  /** Hour of the day (Africa/Douala). */
  hour: number
  views: number
  pinned?: boolean
  locked?: boolean
  body: string
  replies: DemoReply[]
}

export interface DemoDiscussion {
  author: string
  title: string
  tags: string[]
  daysAgo: number
  hour: number
  views: number
  pinned?: boolean
  body: string
  replies: DemoReply[]
}

/**
 * Template tag for markdown sources. It reads the raw template so that
 * backslashes survive untouched (regexes, markdown escapes, "\n" in code),
 * then un-escapes "\`" and "\${" and turns "~~~" fences into backtick
 * fences of the same length. Not named "md" so Prettier leaves it alone.
 */
export function text(strings: TemplateStringsArray, ...values: unknown[]): string {
  return (
    String.raw({ raw: strings.raw }, ...values)
      .replace(/\\`/g, '`')
      .replace(/\\\$\{/g, '${')
      .replace(
        /^([ \t]*)(~{3,})/gm,
        (_, indent: string, fence: string) => indent + '`'.repeat(fence.length)
      )
      .trim() + '\n'
  )
}
