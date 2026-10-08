import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import type { SearchType } from '~/components/search/url'
import { cn } from '~/lib/format'

/**
 * The big search field. Submits on Enter; "/" anywhere on the page brings
 * the focus back to it (unless the user is typing in another field).
 */
export function SearchField({
  value,
  type,
  error,
  autoFocus = false,
  onSearch,
}: {
  value: string
  type: SearchType
  error?: string | null
  autoFocus?: boolean
  onSearch: (term: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [term, setTerm] = useState(value)
  const [synced, setSynced] = useState(value)

  // Follow the URL (examples, back/forward) without an effect.
  if (value !== synced) {
    setSynced(value)
    setTerm(value)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(term.trim())
  }

  return (
    <form role="search" action="/recherche" method="get" onSubmit={submit}>
      <div
        className={cn(
          'relative flex items-center rounded-sm border-2 bg-card transition-[box-shadow,border-color] duration-150 focus-within:shadow-[0_0_0_4px_var(--js)]',
          error ? 'border-danger' : 'border-ink'
        )}
      >
        <Search
          size={22}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 text-ink sm:left-5"
        />
        <input
          ref={inputRef}
          id="search-q"
          name="q"
          type="search"
          aria-label="Rechercher dans les articles, le forum et les discussions"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'search-q-error' : 'search-q-hints'}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="closures, CORS, useEffect…"
          maxLength={100}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          className="h-15 w-full min-w-0 bg-transparent pr-2 pl-12 text-[19px] font-medium tracking-[-0.02em] text-ink placeholder:font-normal placeholder:text-muted/75 focus:outline-none sm:h-18 sm:pl-14 sm:text-[24px] [&::-webkit-search-cancel-button]:hidden"
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm('')
              inputRef.current?.focus()
            }}
            aria-label="Effacer le champ"
            className="mr-1 grid size-9 shrink-0 place-items-center rounded-xs text-muted transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-offset-0"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Lancer la recherche"
          className="mr-2 inline-flex h-11 shrink-0 items-center gap-2 rounded-sm border border-ink bg-ink px-3.5 text-[15px] font-medium text-paper transition-[background-color,color,box-shadow,translate] duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-js hover:text-js-ink hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-none sm:h-12 sm:px-5"
        >
          <span className="hidden sm:inline">Rechercher</span>
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      {type !== 'tout' && <input type="hidden" name="type" value={type} />}

      {error ? (
        <p id="search-q-error" role="alert" className="mt-3 text-[14.5px] font-medium text-danger">
          {error}
        </p>
      ) : (
        <SyntaxHints />
      )}
    </form>
  )
}

function SyntaxHints() {
  const code =
    'rounded-xs border border-line-2 bg-card px-1.5 py-0.5 font-mono text-[12px] font-medium tracking-normal text-ink normal-case'
  return (
    <ul
      id="search-q-hints"
      className="label mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2"
      aria-label="Syntaxe de recherche"
    >
      <li>
        <code className={code}>&quot;mots exacts&quot;</code> expression
      </li>
      <li>
        <code className={code}>-mot</code> exclure
      </li>
      <li>
        <code className={code}>vite OR webpack</code> l’un ou l’autre
      </li>
      <li className="hidden sm:list-item">
        <kbd className={code}>/</kbd> revenir au champ
      </li>
    </ul>
  )
}
