import { useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/field'

export type EditableLink = { label: string; url: string }

/**
 * Up to `max` extra links (label + https address) with add/remove rows.
 * Errors are keyed like the server's: "links.0.url".
 */
export function LinksEditor({
  value,
  onChange,
  errors,
  max = 4,
}: {
  value: EditableLink[]
  onChange: (links: EditableLink[]) => void
  errors: Record<string, string | undefined>
  max?: number
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const listError = errors.links

  function update(index: number, patch: Partial<EditableLink>) {
    onChange(value.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  function add() {
    onChange([...value, { label: '', url: '' }])
    // Focus the new row's label once rendered.
    requestAnimationFrame(() => {
      const inputs = listRef.current?.querySelectorAll<HTMLInputElement>('input[data-link-label]')
      inputs?.[inputs.length - 1]?.focus()
    })
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="label text-ink-2">Autres liens</p>
        <p className="font-mono text-[12px] text-muted tabular-nums" aria-hidden="true">
          {value.length}/{max}
        </p>
      </div>

      {value.length > 0 && (
        <ol ref={listRef} className="grid gap-3">
          {value.map((link, i) => {
            const labelError = errors[`links.${i}.label`]
            const urlError = errors[`links.${i}.url`]
            return (
              <li
                key={i}
                className="grid gap-2 border-l-2 border-line-2 pl-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <label htmlFor={`link-${i}-label`} className="sr-only">
                    Nom du lien {i + 1}
                  </label>
                  <Input
                    id={`link-${i}-label`}
                    data-link-label
                    value={link.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    placeholder="YouTube, Dev.to…"
                    maxLength={30}
                    invalid={Boolean(labelError)}
                    aria-describedby={labelError ? `link-${i}-label-error` : undefined}
                  />
                  {labelError && (
                    <p
                      id={`link-${i}-label-error`}
                      className="mt-1.5 text-[13px] font-medium text-danger"
                      role="alert"
                    >
                      {labelError}
                    </p>
                  )}
                </div>
                <div className="min-w-0">
                  <label htmlFor={`link-${i}-url`} className="sr-only">
                    Adresse du lien {i + 1}
                  </label>
                  <Input
                    id={`link-${i}-url`}
                    type="url"
                    inputMode="url"
                    value={link.url}
                    onChange={(e) => update(i, { url: e.target.value })}
                    placeholder="https://"
                    maxLength={255}
                    invalid={Boolean(urlError)}
                    aria-describedby={urlError ? `link-${i}-url-error` : undefined}
                  />
                  {urlError && (
                    <p
                      id={`link-${i}-url-error`}
                      className="mt-1.5 text-[13px] font-medium text-danger"
                      role="alert"
                    >
                      {urlError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Retirer le lien ${link.label || i + 1}`}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 justify-self-start rounded-sm border border-transparent px-3 text-[14px] text-muted transition-colors duration-150 hover:border-danger hover:text-danger active:translate-y-px sm:w-11 sm:px-0"
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span className="sm:sr-only">Retirer</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {listError && (
        <p className="text-[13.5px] font-medium text-danger" role="alert">
          {listError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" onClick={add} disabled={value.length >= max}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" /> Ajouter un lien
        </Button>
        <p className="text-[13.5px] text-muted">
          {value.length >= max
            ? `${max} liens maximum.`
            : 'YouTube, Dev.to, Medium, Behance, une conférence…'}
        </p>
      </div>
    </div>
  )
}
