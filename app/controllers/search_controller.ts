import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Tag from '#models/tag'
import Channel from '#models/channel'
import ArticleTransformer from '#transformers/article_transformer'
import ThreadTransformer from '#transformers/thread_transformer'
import DiscussionTransformer from '#transformers/discussion_transformer'
import TagTransformer from '#transformers/tag_transformer'
import ChannelTransformer from '#transformers/channel_transformer'
import { searchMessages, searchValidator } from '#validators/search_validator'
import {
  SEARCH_SECTIONS,
  SEARCH_TYPES,
  countAll,
  exactQuery,
  findHits,
  prefixQuery,
  type SearchCounts,
  type SearchHit,
  type SearchSection,
  type SearchType,
} from '#services/search'

/** Results per page on a filtered tab. */
const PER_PAGE = 15
/** Results per section on the "tout" tab. */
const PREVIEW = 4

type Status = 'landing' | 'invalid' | 'throttled' | 'results' | 'empty'

type Meta = { total: number; perPage: number; currentPage: number; lastPage: number }

function toPage(value: unknown) {
  const page = Number.parseInt(String(value ?? '1'), 10)
  return Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1
}

function meta(total: number, perPage: number, currentPage: number): Meta {
  return { total, perPage, currentPage, lastPage: Math.max(1, Math.ceil(total / perPage)) }
}

/**
 * Lucid returns "whereIn" rows in any order: restore the ranking.
 */
function inRankOrder<T extends { id: number }>(hits: SearchHit[], rows: T[]) {
  const byId = new Map(rows.map((row) => [row.id, row]))
  return hits.map((hit) => byId.get(hit.id)).filter((row): row is T => Boolean(row))
}

const loaders = {
  articles: (ids: number[]) =>
    Article.query().whereIn('id', ids).preload('author').preload('tags').withCount('comments'),
  questions: (ids: number[]) =>
    Thread.query().whereIn('id', ids).preload('author').preload('channel'),
  discussions: (ids: number[]) =>
    Discussion.query().whereIn('id', ids).preload('author').preload('tags'),
}

/**
 * Popular topics and forum channels, offered on the landing state and
 * when nothing matches.
 */
async function suggestions() {
  const [tags, channels] = await Promise.all([
    Tag.query().withCount('articles', (query) => {
      query
        .whereNotNull('articles.published_at')
        .where('articles.published_at', '<=', DateTime.now().toSQL()!)
    }),
    Channel.query().withCount('threads').orderBy('position', 'asc'),
  ])
  const popular = tags
    .filter((tag) => Number(tag.$extras.articles_count) > 0)
    .sort((a, b) => Number(b.$extras.articles_count) - Number(a.$extras.articles_count))
    .slice(0, 12)
  return {
    popularTags: TagTransformer.transform(popular),
    channels: ChannelTransformer.transform(channels),
  }
}

/**
 * Size of the searchable index (landing state), same visibility rules.
 */
async function indexSize(): Promise<SearchCounts> {
  const visibleAuthor = (table: string) =>
    `not exists (select 1 from users where users.id = ${table}.user_id and users.banned_at is not null)`
  const result = await db.rawQuery(
    `select
      (select count(*) from articles where published_at is not null and published_at <= now() and ${visibleAuthor('articles')}) as articles,
      (select count(*) from threads where ${visibleAuthor('threads')}) as questions,
      (select count(*) from discussions where ${visibleAuthor('discussions')}) as discussions`
  )
  const row = result.rows[0] ?? {}
  return {
    articles: Number(row.articles ?? 0),
    questions: Number(row.questions ?? 0),
    discussions: Number(row.discussions ?? 0),
  }
}

const sum = (counts: SearchCounts) => counts.articles + counts.questions + counts.discussions

export default class SearchController {
  /**
   * GET /recherche?q=&type=tout|articles|questions|discussions&page=
   */
  async index(ctx: HttpContext) {
    const qs = ctx.request.qs()
    const rawQ = typeof qs.q === 'string' ? qs.q.trim() : ''
    const type: SearchType = SEARCH_TYPES.includes(qs.type) ? qs.type : 'tout'

    if (!rawQ) return this.landing(ctx, { type })

    const [error, input] = await searchValidator.tryValidate(
      { q: rawQ, type, page: toPage(qs.page) },
      { messagesProvider: searchMessages }
    )
    if (error) {
      return this.landing(ctx, {
        type,
        q: rawQ.slice(0, 100),
        status: 'invalid',
        error: error.messages[0]?.message ?? 'Recherche invalide.',
      })
    }

    const q = input.q
    const page = input.page ?? 1

    // Exact (websearch) query first; prefixes ("clos" → closures) only
    // when it finds nothing at all.
    let query = exactQuery(q)
    let counts = await countAll(query)
    if (sum(counts) === 0) {
      const fallback = prefixQuery(q)
      if (fallback) {
        const fallbackCounts = await countAll(fallback)
        if (sum(fallbackCounts) > 0) {
          query = fallback
          counts = fallbackCounts
        }
      }
    }

    if (sum(counts) === 0) {
      return ctx.inertia.render('search/index', {
        ...this.emptyProps(type, q),
        status: 'empty',
        counts,
        ...(await suggestions()),
      })
    }

    const filtered = type !== 'tout'
    const perPage = filtered ? PER_PAGE : PREVIEW
    const currentPage = filtered ? page : 1
    const sections = SEARCH_SECTIONS.filter((section) =>
      filtered ? section === type : counts[section] > 0
    )

    const results = await Promise.all(
      sections.map(async (section) => {
        const hits = counts[section]
          ? await findHits(section, query, { limit: perPage, offset: (currentPage - 1) * perPage })
          : []
        const ids = hits.map((hit) => hit.id)
        const rows = ids.length ? await loaders[section](ids) : []
        return { section, hits, rows: inRankOrder(hits, rows as { id: number }[]) }
      })
    )

    const highlights: Record<string, { titleHtml: string; snippetHtml: string }> = {}
    for (const { section, hits } of results) {
      for (const hit of hits) {
        highlights[`${section}:${hit.id}`] = {
          titleHtml: hit.titleHtml,
          snippetHtml: hit.snippetHtml,
        }
      }
    }

    const pick = (section: SearchSection) => results.find((result) => result.section === section)
    const sectionMeta = (section: SearchSection) => meta(counts[section], perPage, currentPage)
    const articles = pick('articles')
    const questions = pick('questions')
    const discussions = pick('discussions')

    return ctx.inertia.render('search/index', {
      ...this.emptyProps(type, q),
      status: 'results',
      mode: query.mode,
      counts,
      highlights,
      articles: articles
        ? ArticleTransformer.paginate(articles.rows as Article[], sectionMeta('articles'))
        : null,
      questions: questions
        ? ThreadTransformer.paginate(questions.rows as Thread[], sectionMeta('questions'))
        : null,
      discussions: discussions
        ? DiscussionTransformer.paginate(
            discussions.rows as Discussion[],
            sectionMeta('discussions')
          )
        : null,
    })
  }

  /**
   * Rendered by the search limiter (start/routes/search.ts) for Inertia
   * visits instead of a bare "429" text response. No database query.
   */
  async throttled(ctx: HttpContext, message: string) {
    const qs = ctx.request.qs()
    const type: SearchType = SEARCH_TYPES.includes(qs.type) ? qs.type : 'tout'
    const q = typeof qs.q === 'string' ? qs.q.trim().slice(0, 100) : ''
    const page = await ctx.inertia.render('search/index', {
      ...this.emptyProps(type, q),
      status: 'throttled',
      error: message,
    })
    // Called from an exception handler: the return value is not sent.
    ctx.response.status(429).send(page)
  }

  private emptyProps(type: SearchType, q: string) {
    return {
      q,
      type,
      status: 'landing' as Status,
      error: null as string | null,
      mode: null,
      counts: null as SearchCounts | null,
      index: null as SearchCounts | null,
      highlights: {},
      articles: null,
      questions: null,
      discussions: null,
      popularTags: null,
      channels: null,
    }
  }

  private async landing(
    ctx: HttpContext,
    options: {
      type: SearchType
      q?: string
      status?: Status
      error?: string
    }
  ) {
    const [hints, index] = await Promise.all([suggestions(), indexSize()])
    return ctx.inertia.render('search/index', {
      ...this.emptyProps(options.type, options.q ?? ''),
      status: options.status ?? 'landing',
      error: options.error ?? null,
      index,
      ...hints,
    })
  }
}
