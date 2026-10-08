import { useState, type FormEvent, type ReactNode } from 'react'
import { useForm } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Button, ButtonLink } from '~/components/ui/button'
import { MarkdownEditor } from '~/components/ui/markdown-editor'
import { cn, formatNumber } from '~/lib/format'

export const ARTICLE_LIMITS = {
  titleMin: 10,
  titleMax: 160,
  excerptMax: 300,
  bodyMin: 100,
  tagsMax: 4,
}

type FormData = {
  title: string
  excerpt: string
  coverUrl: string
  tags: number[]
  body: string
}

type Intent = 'publish' | 'draft'

const FIELD_ORDER: (keyof FormData)[] = ['title', 'excerpt', 'body', 'tags', 'coverUrl']

const control =
  'w-full rounded-sm border border-line-2 bg-card text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none aria-[invalid=true]:border-danger'

/**
 * "12 / 160" counter, red when outside the allowed range.
 */
function Counter({ value, min = 0, max }: { value: number; min?: number; max: number }) {
  const off = value > max || (value > 0 && value < min)
  return (
    <span
      className={cn(
        'font-mono text-[12px] tabular-nums normal-case',
        off ? 'text-danger' : 'text-muted'
      )}
      aria-hidden="true"
    >
      {formatNumber(value)} / {formatNumber(max)}
    </span>
  )
}

function FieldShell({
  label,
  htmlFor,
  aside,
  hint,
  error,
  optional,
  children,
}: {
  label: ReactNode
  htmlFor: string
  aside?: ReactNode
  hint?: ReactNode
  error?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="label text-ink-2">
          {label}
          {optional && (
            <span className="ml-2 tracking-normal normal-case text-muted">facultatif</span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[13.5px] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[13.5px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function CoverPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  if (!/^https:\/\/\S+\.\S+/.test(url)) return null
  if (failed === url) {
    return <p className="label text-danger">Impossible de charger cette image pour l’instant.</p>
  }
  return (
    <img
      src={url}
      alt="Aperçu de l’image de couverture"
      onError={() => setFailed(url)}
      className="aspect-[2/1] w-full max-w-sm rounded-sm border border-line bg-paper-2 object-cover"
    />
  )
}

/**
 * Shared create / edit form for articles. Two submit intents:
 * publish (or keep published) and save as draft.
 */
export function ArticleForm({
  article,
  tags,
  excerptIsAuto = false,
}: {
  article?: Data.Article.Variants['forEdit']
  tags: Data.Tag[]
  excerptIsAuto?: boolean
}) {
  const isEdit = Boolean(article)
  const isPublished = Boolean(article?.isPublished)
  const [intent, setIntent] = useState<Intent>('publish')

  const form = useForm<FormData>({
    title: article?.title ?? '',
    excerpt: article && !excerptIsAuto ? (article.excerpt ?? '') : '',
    coverUrl: article?.coverUrl ?? '',
    tags: article?.tags?.map((tag) => tag.id) ?? [],
    body: article?.body ?? '',
  })

  const bodyLength = form.data.body.trim().length
  const minutes = Math.max(1, Math.round(form.data.body.split(/\s+/).filter(Boolean).length / 220))
  const tagsFull = form.data.tags.length >= ARTICLE_LIMITS.tagsMax
  const tagError =
    (form.errors as Record<string, string | undefined>)['tags'] ??
    Object.entries(form.errors).find(([key]) => key.startsWith('tags.'))?.[1]

  function toggleTag(id: number) {
    const selected = form.data.tags.includes(id)
    if (!selected && tagsFull) return
    form.setData(
      'tags',
      selected ? form.data.tags.filter((tagId) => tagId !== id) : [...form.data.tags, id]
    )
  }

  function submit(next: Intent, event?: FormEvent) {
    event?.preventDefault()
    setIntent(next)
    form.transform((data) => ({ ...data, publish: next === 'publish' }))
    const options = {
      // Stay in place to show validation errors; start at the top of the article on success.
      preserveScroll: 'errors' as const,
      onError: (errors: Record<string, string>) => {
        const first = FIELD_ORDER.find((key) =>
          Object.keys(errors).some((e) => e === key || e.startsWith(`${key}.`))
        )
        if (first) document.getElementById(first === 'tags' ? 'tags-legend' : first)?.focus()
      },
    }
    if (article) form.put(`/articles/${article.slug}`, options)
    else form.post('/articles', options)
  }

  const primaryLabel = isPublished ? 'Enregistrer les modifications' : 'Publier l’article'
  const busyLabel = intent === 'publish' && !isPublished ? 'Publication…' : 'Enregistrement…'

  return (
    <form onSubmit={(event) => submit('publish', event)} noValidate className="grid gap-9">
      <FieldShell
        label="Titre"
        htmlFor="title"
        aside={
          <Counter
            value={form.data.title.trim().length}
            min={ARTICLE_LIMITS.titleMin}
            max={ARTICLE_LIMITS.titleMax}
          />
        }
        hint="Explicite et précis : le lecteur doit savoir ce qu’il va apprendre (10 à 160 caractères)."
        error={form.errors.title}
      >
        <textarea
          id="title"
          name="title"
          rows={2}
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value.replace(/\n/g, ' '))}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          placeholder="Ex. : Accepter les paiements Mobile Money dans une app Node.js"
          maxLength={ARTICLE_LIMITS.titleMax + 40}
          aria-invalid={form.errors.title ? true : undefined}
          aria-describedby={form.errors.title ? 'title-error' : 'title-hint'}
          className={cn(
            control,
            'block min-h-[3.4rem] resize-none px-4 py-3 text-[clamp(1.35rem,2.6vw,1.8rem)] leading-[1.2] font-bold tracking-[-0.03em] [field-sizing:content]'
          )}
        />
      </FieldShell>

      <FieldShell
        label="Chapô"
        htmlFor="excerpt"
        optional
        aside={<Counter value={form.data.excerpt.trim().length} max={ARTICLE_LIMITS.excerptMax} />}
        hint="Deux phrases qui donnent envie de lire. Laissé vide, il sera tiré du début de l’article."
        error={form.errors.excerpt}
      >
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={form.data.excerpt}
          onChange={(e) => form.setData('excerpt', e.target.value)}
          placeholder="De quoi parle l’article, et pour qui ?"
          aria-invalid={form.errors.excerpt ? true : undefined}
          aria-describedby={form.errors.excerpt ? 'excerpt-error' : 'excerpt-hint'}
          className={cn(control, 'block resize-y px-3.5 py-3 text-[16px] leading-relaxed')}
        />
      </FieldShell>

      <FieldShell
        label="Contenu"
        htmlFor="body"
        aside={
          <span
            className={cn(
              'font-mono text-[12px] tabular-nums',
              bodyLength > 0 && bodyLength < ARTICLE_LIMITS.bodyMin ? 'text-danger' : 'text-muted'
            )}
          >
            {formatNumber(bodyLength)} car. · ~{minutes} min
          </span>
        }
        hint={`Markdown : intertitres ##, blocs de code \`\`\`js, liens, listes. ${ARTICLE_LIMITS.bodyMin} caractères minimum.`}
        error={form.errors.body}
      >
        <MarkdownEditor
          id="body"
          value={form.data.body}
          onChange={(value) => form.setData('body', value)}
          error={form.errors.body}
          rows={20}
          placeholder={
            '## Le contexte\n\nExpliquez le problème de départ…\n\n```js\n// puis le code, commenté\n```'
          }
        />
      </FieldShell>

      <fieldset aria-describedby={tagError ? 'tags-error' : 'tags-hint'}>
        <legend
          id="tags-legend"
          tabIndex={-1}
          className="label float-left mb-2 flex w-full items-baseline justify-between gap-4 text-ink-2 focus:outline-none"
        >
          <span>Tags</span>
          <span
            className={cn(
              'font-mono text-[12px] tracking-normal tabular-nums',
              tagsFull ? 'text-ink' : 'text-muted'
            )}
          >
            <span className="sr-only">sélectionnés : </span>
            {form.data.tags.length} / {ARTICLE_LIMITS.tagsMax}
          </span>
        </legend>
        <ul className="clear-both flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const selected = form.data.tags.includes(tag.id)
            const disabled = !selected && tagsFull
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'inline-flex h-8 items-center rounded-sm border px-2.5 font-mono text-[12.5px] font-medium transition-colors duration-150 focus-visible:shadow-[0_0_0_3px_var(--js)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40',
                    selected
                      ? 'border-ink bg-js text-js-ink'
                      : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
                  )}
                >
                  <span className="opacity-50" aria-hidden="true">
                    #
                  </span>
                  {tag.name}
                </button>
              </li>
            )
          })}
        </ul>
        {tagError ? (
          <p id="tags-error" className="mt-3 text-[13.5px] font-medium text-danger" role="alert">
            {tagError}
          </p>
        ) : (
          <p id="tags-hint" className="mt-3 text-[13.5px] text-muted">
            Jusqu’à {ARTICLE_LIMITS.tagsMax} sujets, pour que les bons lecteurs trouvent votre
            article.
          </p>
        )}
      </fieldset>

      <FieldShell
        label="Image de couverture"
        htmlFor="coverUrl"
        optional
        hint="Adresse https:// d’une image au format paysage (idéalement 1600 × 800). Elle sert aussi d’aperçu sur les réseaux."
        error={form.errors.coverUrl}
      >
        <input
          id="coverUrl"
          name="coverUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={form.data.coverUrl}
          onChange={(e) => form.setData('coverUrl', e.target.value)}
          placeholder="https://"
          aria-invalid={form.errors.coverUrl ? true : undefined}
          aria-describedby={form.errors.coverUrl ? 'coverUrl-error' : 'coverUrl-hint'}
          className={cn(control, 'h-11 px-3.5 font-mono text-[14px]')}
        />
        <CoverPreview url={form.data.coverUrl.trim()} />
      </FieldShell>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-ink bg-paper px-4 py-3 sm:mx-0 sm:px-0 sm:py-4">
        <p className="label hidden sm:block" aria-live="polite">
          {form.isDirty
            ? 'Modifications non enregistrées'
            : isPublished
              ? 'Publié'
              : isEdit
                ? 'Brouillon'
                : 'Nouvel article'}
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          {isPublished ? (
            <ButtonLink
              href={`/articles/${article!.slug}`}
              variant="ghost"
              className="flex-1 sm:flex-none"
            >
              Annuler
            </ButtonLink>
          ) : (
            <Button
              variant="secondary"
              onClick={() => submit('draft')}
              loading={form.processing && intent === 'draft'}
              disabled={form.processing}
              className="flex-1 sm:flex-none"
            >
              {form.processing && intent === 'draft' ? (
                'Enregistrement…'
              ) : (
                <>
                  <span className="sm:hidden">Brouillon</span>
                  <span className="hidden sm:inline">Enregistrer le brouillon</span>
                </>
              )}
            </Button>
          )}
          <Button
            type="submit"
            loading={form.processing && intent === 'publish'}
            disabled={form.processing}
            className="flex-1 sm:flex-none"
          >
            {form.processing && intent === 'publish' ? (
              busyLabel
            ) : (
              <>
                <span className="sm:hidden">{isPublished ? 'Enregistrer' : 'Publier'}</span>
                <span className="hidden sm:inline">{primaryLabel}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
