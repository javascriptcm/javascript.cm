import { useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '~/lib/format'

const SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Vue.js',
  'Next.js',
  'React Native',
  'Angular',
  'NestJS',
  'AdonisJS',
  'Express',
  'Svelte',
  'Tailwind CSS',
  'GraphQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Figma',
  'Jest',
  'Playwright',
  'Electron',
]

/** Mirrors normalizeSkills() on the server. */
function cleanSkill(value: string) {
  return value.replace(/\s+/g, ' ').trim().replace(/^#+/, '').trim()
}

/**
 * Token input for skills: type then Enter or comma to add, Backspace on
 * the empty field removes the last one, each chip has its own remove
 * button. Changes are announced to screen readers.
 */
export function SkillsInput({
  id,
  value,
  onChange,
  max = 12,
  invalid = false,
  describedBy,
}: {
  id: string
  value: string[]
  onChange: (skills: string[]) => void
  max?: number
  invalid?: boolean
  describedBy?: string
}) {
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const helpId = useId()
  const full = value.length >= max

  function add(raw: string) {
    const next = [...value]
    const added: string[] = []
    let issue: string | null = null
    for (const part of raw.split(',')) {
      const skill = cleanSkill(part)
      if (!skill) continue
      if (skill.length < 2 || skill.length > 30) {
        issue = `« ${skill.slice(0, 30)} » : une compétence fait entre 2 et 30 caractères.`
        continue
      }
      if (next.some((s) => s.toLocaleLowerCase('fr') === skill.toLocaleLowerCase('fr'))) {
        issue = `« ${skill} » est déjà dans la liste.`
        continue
      }
      if (next.length >= max) {
        issue = `${max} compétences au maximum : retirez-en une pour en ajouter une autre.`
        break
      }
      next.push(skill)
      added.push(skill)
    }
    if (added.length) {
      onChange(next)
      setNotice(`Ajouté : ${added.join(', ')}. ${next.length} sur ${max}.`)
    }
    setProblem(issue)
  }

  function remove(index: number) {
    const skill = value[index]
    onChange(value.filter((_, i) => i !== index))
    setNotice(`${skill} retiré. ${value.length - 1} sur ${max}.`)
    setProblem(null)
    inputRef.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      if (draft.trim()) {
        add(draft)
        setDraft('')
      }
      return
    }
    if (event.key === 'Backspace' && draft === '' && value.length) {
      event.preventDefault()
      remove(value.length - 1)
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value
    // A pasted list ("React, Node.js, TypeScript"): add everything before
    // the last comma, keep the rest as the draft.
    if (text.includes(',')) {
      const last = text.lastIndexOf(',')
      add(text.slice(0, last))
      setDraft(text.slice(last + 1).trimStart())
      return
    }
    setDraft(text)
    if (problem) setProblem(null)
  }

  function onBlur() {
    if (draft.trim()) {
      add(draft)
      setDraft('')
    }
  }

  const query = cleanSkill(draft).toLocaleLowerCase('fr')
  const suggestions = full
    ? []
    : SUGGESTIONS.filter(
        (s) =>
          !value.some((v) => v.toLocaleLowerCase('fr') === s.toLocaleLowerCase('fr')) &&
          (!query || s.toLocaleLowerCase('fr').includes(query))
      ).slice(0, 6)

  return (
    <div>
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-sm border bg-card px-2 py-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-ink focus-within:shadow-[0_0_0_3px_var(--js)]',
          invalid || problem ? 'border-danger' : 'border-line-2'
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) inputRef.current?.focus()
        }}
      >
        {value.length > 0 && (
          <ul role="list" className="contents" aria-label="Compétences ajoutées">
            {value.map((skill, i) => (
              <li
                key={skill.toLocaleLowerCase('fr')}
                className="inline-flex h-8 items-center gap-0.5 rounded-sm border border-ink bg-paper-2 pr-0.5 pl-2.5 text-[14px] font-medium text-ink"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Retirer ${skill}`}
                  className="grid size-7 place-items-center rounded-xs text-muted transition-colors duration-150 hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-none active:translate-y-px"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          id={id}
          value={draft}
          onChange={onInput}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          maxLength={60}
          placeholder={
            full ? 'Liste complète' : value.length ? 'Ajouter…' : 'React, Node.js, TypeScript…'
          }
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={invalid || Boolean(problem) || undefined}
          aria-describedby={[helpId, describedBy].filter(Boolean).join(' ')}
          className="h-8 min-w-[9rem] flex-1 bg-transparent px-1.5 text-[15px] text-ink placeholder:text-muted/80 focus:outline-none"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <p id={helpId} className={cn('text-[13.5px]', problem ? 'text-danger' : 'text-muted')}>
          {problem ?? 'Entrée ou virgule pour ajouter, Retour arrière pour retirer la dernière.'}
        </p>
        <p
          className={cn(
            'font-mono text-[12px] tabular-nums',
            full ? 'font-semibold text-ink' : 'text-muted'
          )}
          aria-hidden="true"
        >
          {value.length}/{max}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {notice}
      </p>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="label mr-1">Suggestions</span>
          {suggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => {
                add(skill)
                setDraft('')
              }}
              className="inline-flex h-7 items-center gap-1 rounded-sm border border-dashed border-line-2 px-2 text-[13px] text-ink-2 transition-colors duration-150 hover:border-solid hover:border-ink hover:bg-js hover:text-js-ink active:translate-y-px"
            >
              <Plus size={12} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Ajouter </span>
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
