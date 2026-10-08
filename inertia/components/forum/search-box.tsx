import { useState, type FormEvent } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '~/lib/format'

/**
 * Search field submitting on Enter. Used by the forum and the discussions.
 */
export function SearchBox({
  id,
  label,
  placeholder,
  value,
  onSearch,
  className,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onSearch: (term: string) => void
  className?: string
}) {
  const [term, setTerm] = useState(value)
  const [synced, setSynced] = useState(value)

  // Follow the URL (back/forward, "effacer" links) without an effect.
  if (value !== synced) {
    setSynced(value)
    setTerm(value)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(term.trim())
  }

  return (
    <form role="search" onSubmit={submit} className={cn('relative w-full', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={placeholder}
        maxLength={120}
        enterKeyHint="search"
        className="h-10 w-full rounded-sm border border-line-2 bg-card pr-10 pl-9 text-[15px] text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted/80 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {term ? (
        <button
          type="button"
          onClick={() => {
            setTerm('')
            if (value) onSearch('')
          }}
          aria-label="Effacer la recherche"
          className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-xs text-muted transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <X size={15} strokeWidth={1.75} />
        </button>
      ) : null}
      <button type="submit" className="sr-only">
        Rechercher
      </button>
    </form>
  )
}
