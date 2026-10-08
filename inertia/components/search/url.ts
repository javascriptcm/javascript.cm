import type { Data } from '@generated/data'
import type { PaginationMeta } from '~/components/ui/pagination'

export type SearchType = 'tout' | 'articles' | 'questions' | 'discussions'
export type SearchSection = Exclude<SearchType, 'tout'>
export type SearchCounts = Record<SearchSection, number>

/** Server-escaped HTML: the only tags it can contain are <mark>. */
export type Highlight = { titleHtml: string; snippetHtml: string }

export type ResultPage<T> = { data: T[]; metadata: PaginationMeta }

export type SearchResults = {
  articles: ResultPage<Data.Article> | null
  questions: ResultPage<Data.Thread> | null
  discussions: ResultPage<Data.Discussion> | null
}

export const SECTIONS: {
  value: SearchSection
  label: string
  code: string
  /** "13 articles" / "1 article" */
  noun: [string, string]
}[] = [
  { value: 'articles', label: 'Articles', code: 'ART', noun: ['article', 'articles'] },
  { value: 'questions', label: 'Questions', code: 'FRM', noun: ['question', 'questions'] },
  { value: 'discussions', label: 'Discussions', code: 'DSC', noun: ['discussion', 'discussions'] },
]

/**
 * "/recherche?q=…&type=…&page=…", leaving defaults out.
 */
export function searchHref({ q, type, page }: { q?: string; type?: SearchType; page?: number }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (type && type !== 'tout') params.set('type', type)
  if (page && page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/recherche?${qs}` : '/recherche'
}

/**
 * Yellow highlighter on the <mark> tags of server headlines.
 */
export const MARKS =
  '[&_mark]:rounded-xs [&_mark]:bg-js [&_mark]:px-[0.08em] [&_mark]:text-js-ink [&_mark]:[box-decoration-break:clone] [&_mark]:[-webkit-box-decoration-break:clone]'
