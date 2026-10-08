import db from '@adonisjs/lucid/services/db'
import { SEARCH_CONFIG, SEARCH_DOCUMENTS } from '#services/search_documents'

/**
 * Site-wide full-text search (PostgreSQL, French stemming).
 *
 * Every condition uses the exact document expressions of
 * `#services/search_documents`, so the planner can answer `@@` with the
 * GIN indexes "<table>_search_idx". Only public content is searchable:
 * published articles, threads and discussions, never anything written by
 * a banned member.
 */

export const SEARCH_TYPES = ['tout', 'articles', 'questions', 'discussions'] as const
export type SearchType = (typeof SEARCH_TYPES)[number]
export type SearchSection = Exclude<SearchType, 'tout'>
export const SEARCH_SECTIONS: SearchSection[] = ['articles', 'questions', 'discussions']

export type SearchMode = 'exact' | 'prefix'
export type SearchCounts = Record<SearchSection, number>

/**
 * A text-search query ready to be bound: user syntax through
 * `websearch_to_tsquery` ("phrase", -exclusion, OR) or the prefix fallback.
 */
export type TextQuery = {
  mode: SearchMode
  fn: 'websearch_to_tsquery' | 'to_tsquery'
  value: string
}

export type SearchHit = {
  id: number
  score: number
  /** Escaped HTML, matches wrapped in <mark>. */
  titleHtml: string
  /** Escaped plain text (markdown stripped), matches wrapped in <mark>. */
  snippetHtml: string
}

type SectionConfig = {
  table: 'articles' | 'threads' | 'discussions'
  document: string
  /** Extra visibility condition (drafts and scheduled articles stay private). */
  visible: string
  /** Date used for the recency boost. */
  freshness: string
  /** Multiplier on the score (solved questions are worth a little more). */
  boost: string
}

const SECTIONS: Record<SearchSection, SectionConfig> = {
  articles: {
    table: 'articles',
    document: SEARCH_DOCUMENTS.articles,
    visible: 'published_at is not null and published_at <= now()',
    freshness: 'published_at',
    boost: '1',
  },
  questions: {
    table: 'threads',
    document: SEARCH_DOCUMENTS.threads,
    visible: 'true',
    freshness: 'last_activity_at',
    boost: 'case when solution_reply_id is not null then 1.1 else 1 end',
  },
  discussions: {
    table: 'discussions',
    document: SEARCH_DOCUMENTS.discussions,
    visible: 'true',
    freshness: 'last_activity_at',
    boost: '1',
  },
}

/**
 * Sentinels for ts_headline: control characters that never survive in the
 * final text, so the whole headline can be HTML-escaped before they are
 * turned into <mark> tags.
 */
const START = '\u0001'
const STOP = '\u0002'

const TITLE_HEADLINE = `StartSel=${START},StopSel=${STOP},HighlightAll=true`
const SNIPPET_HEADLINE = `StartSel=${START},StopSel=${STOP},MaxFragments=2,MaxWords=28,MinWords=12,FragmentDelimiter=" … "`

/**
 * Recency boost: up to +30 % for brand-new content, halved after ~90 days,
 * fading towards +0 % (hyperbolic decay: no exp() underflow on old rows).
 */
const RECENCY_SECONDS = 90 * 24 * 3600

function filters(section: SearchSection, query: TextQuery) {
  const config = SECTIONS[section]
  return `${config.document} @@ ${query.fn}('${SEARCH_CONFIG}', :query)
    and ${config.visible}
    and not exists (
      select 1 from users
      where users.id = ${config.table}.user_id and users.banned_at is not null
    )`
}

/**
 * Query typed by the user (websearch syntax).
 */
export function exactQuery(q: string): TextQuery {
  return { mode: 'exact', fn: 'websearch_to_tsquery', value: q }
}

/**
 * Fallback for short or partial words ("clos" → closures): every kept
 * word becomes a "word:*" prefix. Words are reduced to letters and digits,
 * so the to_tsquery syntax can never be injected; excluded words (-mot)
 * and the OR keyword are dropped.
 */
export function prefixQuery(q: string): TextQuery | null {
  const words = q
    .split(/\s+/)
    .filter((token) => token && !token.startsWith('-') && token !== 'OR')
    .flatMap((token) => token.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => word.length >= 2)

  const unique = [...new Set(words)].slice(0, 6)
  if (!unique.length) return null
  return { mode: 'prefix', fn: 'to_tsquery', value: unique.map((w) => `${w}:*`).join(' & ') }
}

/**
 * Number of matches for one section (one aggregate query on the index).
 */
export async function countMatches(section: SearchSection, query: TextQuery) {
  const { table } = SECTIONS[section]
  const result = await db.rawQuery(
    `select count(*) as total from ${table} where ${filters(section, query)}`,
    { query: query.value }
  )
  return Number(result.rows[0]?.total ?? 0)
}

export async function countAll(query: TextQuery): Promise<SearchCounts> {
  const [articles, questions, discussions] = await Promise.all(
    SEARCH_SECTIONS.map((section) => countMatches(section, query))
  )
  return { articles, questions, discussions }
}

/**
 * Ranked page of matches with highlighted title and snippet. Headlines
 * are only computed for the rows of the page (outer query).
 */
export async function findHits(
  section: SearchSection,
  query: TextQuery,
  { limit, offset = 0 }: { limit: number; offset?: number }
): Promise<SearchHit[]> {
  const config = SECTIONS[section]
  const tsquery = `${query.fn}('${SEARCH_CONFIG}', :query)`
  const clean = (column: string) => `translate(${column}, :sentinels, '')`

  const result = await db.rawQuery(
    `with hits as (
      select id,
        ts_rank_cd(${config.document}, ${tsquery}, 32)
          * ${config.boost}
          * (1 + 0.3 / (1 + greatest(extract(epoch from (now() - ${config.freshness})), 0) / ${RECENCY_SECONDS})) as score
      from ${config.table}
      where ${filters(section, query)}
      order by score desc, id desc
      limit :limit offset :offset
    )
    select hits.id, hits.score, doc.title,
      ts_headline('${SEARCH_CONFIG}', ${clean('doc.title')}, ${tsquery}, :titleOptions) as title_headline,
      ts_headline('${SEARCH_CONFIG}', ${clean('doc.body')}, ${tsquery}, :snippetOptions) as body_headline,
      ${
        section === 'articles'
          ? `ts_headline('${SEARCH_CONFIG}', ${clean("coalesce(doc.excerpt, '')")}, ${tsquery}, :titleOptions)`
          : `''`
      } as excerpt_headline
    from hits
    join ${config.table} as doc on doc.id = hits.id
    order by hits.score desc, hits.id desc`,
    {
      query: query.value,
      limit,
      offset,
      sentinels: `${START}${STOP}`,
      titleOptions: TITLE_HEADLINE,
      snippetOptions: SNIPPET_HEADLINE,
    }
  )

  return result.rows.map(
    (row: {
      id: number
      score: number
      title: string
      title_headline: string
      body_headline: string
      excerpt_headline: string
    }) => ({
      id: Number(row.id),
      score: Number(row.score),
      titleHtml: titleToHtml(row.title, row.title_headline),
      snippetHtml: snippetToHtml(row.body_headline, row.excerpt_headline),
    })
  )
}

/* --------------------------------------------------------------------------
   Headline → safe HTML
   -------------------------------------------------------------------------- */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

// Control characters other than the sentinels (tab/newline are whitespace):
// matching them is the point here.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000\u0003-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

/**
 * Escape everything, then turn the (balanced) sentinels into <mark> tags.
 * The only markup that can ever come out of this function is <mark>.
 */
export function markersToHtml(text: string) {
  const escaped = escapeHtml(text.replace(CONTROL_CHARS, ''))
  let html = ''
  let open = false
  for (const char of escaped) {
    if (char === START) {
      if (!open) html += '<mark>'
      open = true
    } else if (char === STOP) {
      if (open) html += '</mark>'
      open = false
    } else {
      html += char
    }
  }
  if (open) html += '</mark>'
  return html.replace(/<mark>(\s*)<\/mark>/g, '$1')
}

const hasMatch = (headline: string) => headline.includes(START)
const withoutMarkers = (text: string) => text.replaceAll(START, '').replaceAll(STOP, '')
const squash = (text: string) => text.replace(/\s+/g, ' ').trim()

/**
 * ts_headline drops what its parser takes for HTML tags ("<div>"): if the
 * headline no longer spells the title, show the exact title unhighlighted.
 */
export function titleToHtml(title: string, headline: string) {
  const faithful = squash(withoutMarkers(headline)) === squash(title)
  return markersToHtml(squash(faithful ? headline : title))
}

/**
 * Body excerpt around the matches. When the body does not contain them
 * (title-only match), an article shows its summary rather than the first
 * words of the body.
 */
export function snippetToHtml(bodyHeadline: string, excerptHeadline = '') {
  const useExcerpt = !hasMatch(bodyHeadline) && withoutMarkers(excerptHeadline).trim().length > 0
  return markersToHtml(stripMarkdown(useExcerpt ? excerptHeadline : bodyHeadline))
}

/**
 * Remove the markdown syntax noise from a headline fragment (it is plain
 * text: the result is escaped afterwards). Sentinels are left in place.
 */
export function stripMarkdown(text: string) {
  return (
    text
      // Code fences (with their language) and horizontal rules
      .replace(/^[ \t]*(```|~~~)[^\n]*$/gm, ' ')
      .replace(/^[ \t]*([-*_][ \t]*){3,}$/gm, ' ')
      // Table separator rows
      .replace(/^[ \t]*\|?([ \t]*:?-{3,}:?[ \t]*\|?)+[ \t]*$/gm, ' ')
      // Headings, blockquotes, list markers and task boxes
      .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
      .replace(/^[ \t]{0,3}(>[ \t]?)+/gm, '')
      .replace(/^[ \t]*([-*+]|\d{1,3}[.)])[ \t]+(\[[ xX]\][ \t]+)?/gm, '')
      // Link definitions, images and links → their text
      .replace(/^[ \t]*\[[^\]\n]+\]:[ \t]*\S+.*$/gm, ' ')
      .replace(/!\[([^\]\n]*)\]\([^)\n]*\)/g, '$1')
      .replace(/\[([^\]\n]+)\]\([^)\n]*\)/g, '$1')
      .replace(/\[([^\]\n]+)\]\[[^\]\n]*\]/g, '$1')
      // A link cut by the fragment boundary: "[texte](https://exam…"
      .replace(/\]\(\S*/g, ' ')
      .replace(/<(https?:\/\/[^>\s]+)>/g, '$1')
      // Emphasis, strikethrough, inline code
      .replace(/\*\*|__|~~/g, '')
      .replace(/(^|[^\p{L}\p{N}*])\*(?=\S)([^*\n]*?\S)\*(?![\p{L}\p{N}*])/gu, '$1$2')
      .replace(/(^|[^\p{L}\p{N}_])_(?=\S)([^_\n]*?\S)_(?![\p{L}\p{N}_])/gu, '$1$2')
      .replace(/`+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  )
}
