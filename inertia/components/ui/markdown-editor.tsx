import { useRef, useState, type KeyboardEvent } from 'react'
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  SquareCode,
} from 'lucide-react'
import { postJson } from '~/lib/http'
import { cn } from '~/lib/format'
import { Prose } from '~/components/ui/prose'

type Action = {
  label: string
  shortcut?: string
  icon: typeof Bold
  apply: (selected: string) => { text: string; select?: [number, number] }
}

const ACTIONS: Action[] = [
  { label: 'Intertitre', icon: Heading2, apply: (s) => ({ text: `\n## ${s || 'Intertitre'}\n` }) },
  {
    label: 'Gras',
    shortcut: 'b',
    icon: Bold,
    apply: (s) => ({ text: `**${s || 'texte'}**`, select: [2, 2 + (s || 'texte').length] }),
  },
  {
    label: 'Italique',
    shortcut: 'i',
    icon: Italic,
    apply: (s) => ({ text: `_${s || 'texte'}_`, select: [1, 1 + (s || 'texte').length] }),
  },
  {
    label: 'Lien',
    shortcut: 'k',
    icon: Link2,
    apply: (s) => ({
      text: `[${s || 'titre'}](https://)`,
      select: [(s || 'titre').length + 3, (s || 'titre').length + 11],
    }),
  },
  {
    label: 'Code',
    shortcut: 'e',
    icon: Code,
    apply: (s) => ({ text: `\`${s || 'code'}\``, select: [1, 1 + (s || 'code').length] }),
  },
  {
    label: 'Bloc de code',
    icon: SquareCode,
    apply: (s) => ({ text: `\n\`\`\`js\n${s || '// votre code'}\n\`\`\`\n` }),
  },
  { label: 'Citation', icon: Quote, apply: (s) => ({ text: `\n> ${s || 'citation'}\n` }) },
  { label: 'Liste', icon: List, apply: (s) => ({ text: `\n- ${s || 'élément'}\n` }) },
  {
    label: 'Liste numérotée',
    icon: ListOrdered,
    apply: (s) => ({ text: `\n1. ${s || 'élément'}\n` }),
  },
]

/**
 * Markdown textarea with a formatting toolbar and a server-rendered preview
 * (same pipeline as published content, so what you preview is what you get).
 */
export function MarkdownEditor({
  id,
  value,
  onChange,
  onSubmit,
  error,
  placeholder = 'Écrivez en Markdown…',
  rows = 12,
  compact = false,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  error?: string | string[]
  placeholder?: string
  rows?: number
  compact?: boolean
}) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [preview, setPreview] = useState<{ source: string; html: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const invalid = Boolean(error && (!Array.isArray(error) || error.length))

  async function showPreview() {
    setTab('preview')
    if (preview?.source === value) return
    setLoading(true)
    try {
      const { html } = await postJson<{ html: string }>('/markdown/preview', { body: value })
      setPreview({ source: value, html })
    } catch {
      setPreview({ source: value, html: '<p><em>Aperçu indisponible pour le moment.</em></p>' })
    } finally {
      setLoading(false)
    }
  }

  function apply(action: Action) {
    const el = textarea.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const selected = value.slice(start, end)
    const { text, select } = action.apply(selected)
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      if (select) el.setSelectionRange(start + select[0], start + select[1])
      else el.setSelectionRange(start + text.length, start + text.length)
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const mod = event.metaKey || event.ctrlKey
    if (!mod) return
    if (event.key === 'Enter' && onSubmit) {
      event.preventDefault()
      onSubmit()
      return
    }
    const action = ACTIONS.find((a) => a.shortcut === event.key.toLowerCase())
    if (action) {
      event.preventDefault()
      apply(action)
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      'h-10 px-3.5 font-mono text-[12px] font-medium uppercase tracking-[0.06em] transition-colors',
      active ? 'bg-card text-ink shadow-[inset_0_-2px_0_var(--ink)]' : 'text-muted hover:text-ink'
    )

  return (
    <div
      className={cn(
        'overflow-hidden rounded-sm border bg-card transition-[border-color,box-shadow] duration-150 focus-within:border-ink focus-within:shadow-[0_0_0_3px_var(--js)]',
        invalid ? 'border-danger' : 'border-line-2'
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line bg-paper-2/60">
        <div role="tablist" className="flex">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'write'}
            className={tabClass(tab === 'write')}
            onClick={() => setTab('write')}
          >
            Écrire
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            className={tabClass(tab === 'preview')}
            onClick={showPreview}
          >
            Aperçu
          </button>
        </div>
        {tab === 'write' && (
          <div className="hidden items-center pr-1 sm:flex">
            {ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => apply(action)}
                title={
                  action.shortcut
                    ? `${action.label} (⌘${action.shortcut.toUpperCase()})`
                    : action.label
                }
                aria-label={action.label}
                className="grid size-8 place-items-center rounded-xs text-muted transition-colors hover:bg-js hover:text-js-ink"
              >
                <action.icon size={15} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <textarea
          ref={textarea}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={cn(
            'block w-full resize-y bg-transparent px-4 py-3.5 font-mono text-[14px] leading-[1.7] text-ink placeholder:text-muted/80 focus:outline-none',
            compact ? 'min-h-32' : 'min-h-64'
          )}
        />
      ) : (
        <div className={cn('px-5 py-4', compact ? 'min-h-32' : 'min-h-64')}>
          {loading ? (
            <p className="label animate-pulse">Rendu en cours…</p>
          ) : value.trim() ? (
            <Prose html={preview?.html ?? ''} size={compact ? 'sm' : 'base'} />
          ) : (
            <p className="text-muted">Rien à prévisualiser pour l’instant.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line px-4 py-2">
        <a
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
          rel="noopener noreferrer"
          className="label link-draw hover:text-ink"
        >
          Markdown supporté ↗
        </a>
        {onSubmit && <span className="label hidden sm:inline">⌘ + Entrée pour publier</span>}
      </div>
    </div>
  )
}
