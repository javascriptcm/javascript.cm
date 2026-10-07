import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import User from '#models/user'

const PRODUCTION_HOST = 'javascript.cm'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default class SeoController {
  /**
   * Only the production host is indexable: staging and previews are not.
   */
  async robots({ response }: HttpContext) {
    const appUrl = new URL(env.get('APP_URL'))
    response.header('Content-Type', 'text/plain; charset=utf-8')

    if (appUrl.hostname !== PRODUCTION_HOST) {
      return 'User-agent: *\nDisallow: /\n'
    }

    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /dashboard',
      'Disallow: /settings',
      'Disallow: /admin',
      '',
      `Sitemap: ${appUrl.origin}/sitemap.xml`,
      '',
    ].join('\n')
  }

  async sitemap({ response }: HttpContext) {
    const base = env.get('APP_URL')
    const [articles, threads, discussions, users] = await Promise.all([
      Article.query()
        .withScopes((s) => s.published())
        .select('slug', 'updated_at', 'published_at'),
      Thread.query().select('slug', 'last_activity_at'),
      Discussion.query().select('slug', 'last_activity_at'),
      User.query().whereNull('banned_at').select('username', 'updated_at'),
    ])

    const urls: { loc: string; lastmod?: string; priority?: string }[] = [
      { loc: '/', priority: '1.0' },
      { loc: '/articles', priority: '0.9' },
      { loc: '/forum', priority: '0.9' },
      { loc: '/discussions', priority: '0.8' },
      { loc: '/membres', priority: '0.5' },
      ...articles.map((a) => ({
        loc: `/articles/${a.slug}`,
        lastmod: (a.updatedAt ?? a.publishedAt)?.toISODate() ?? undefined,
        priority: '0.8',
      })),
      ...threads.map((t) => ({
        loc: `/forum/${t.slug}`,
        lastmod: t.lastActivityAt.toISODate() ?? undefined,
      })),
      ...discussions.map((d) => ({
        loc: `/discussions/${d.slug}`,
        lastmod: d.lastActivityAt.toISODate() ?? undefined,
      })),
      ...users.map((u) => ({ loc: `/@${u.username}`, priority: '0.3' })),
    ]

    const body = urls
      .map(
        (u) =>
          `<url><loc>${escapeXml(base + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}${u.priority ? `<priority>${u.priority}</priority>` : ''}</url>`
      )
      .join('')

    response.header('Content-Type', 'application/xml; charset=utf-8')
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
  }

  async feed({ response }: HttpContext) {
    const base = env.get('APP_URL')
    const articles = await Article.query()
      .withScopes((s) => s.published())
      .preload('author')
      .orderBy('published_at', 'desc')
      .limit(30)

    const items = articles
      .map(
        (a) => `<item>
  <title>${escapeXml(a.title)}</title>
  <link>${escapeXml(`${base}/articles/${a.slug}`)}</link>
  <guid isPermaLink="true">${escapeXml(`${base}/articles/${a.slug}`)}</guid>
  <pubDate>${a.publishedAt!.toRFC2822()}</pubDate>
  <dc:creator>${escapeXml(a.author.displayName)}</dc:creator>
  <description>${escapeXml(a.excerpt ?? '')}</description>
</item>`
      )
      .join('\n')

    response.header('Content-Type', 'application/rss+xml; charset=utf-8')
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>JavaScript Cameroun — Articles</title>
  <link>${escapeXml(base)}</link>
  <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
  <description>Les articles de la communauté des développeurs JavaScript du Cameroun.</description>
  <language>fr</language>
${items}
</channel>
</rss>`
  }
}
