import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'
import type { Data } from '@generated/data'
import { Button } from '~/components/ui/button'
import { Field, Input } from '~/components/ui/field'
import { MarkdownEditor } from '~/components/ui/markdown-editor'
import { WritingTips, type Tip } from '~/components/forum/asking-tips'
import { cn } from '~/lib/format'

const MAX_TAGS = 3

const DISCUSSION_TIPS: Tip[] = [
  {
    title: 'Un titre qui ouvre la conversation',
    text: '« Vos retours sur Bun en production ? » invite plus qu’un simple « Bun ».',
  },
  {
    title: 'Votre point de départ',
    text: 'Votre expérience, votre avis, ce qui vous fait poser la question. Les autres rebondiront dessus.',
  },
  {
    title: 'Une vraie question ouverte',
    text: 'Terminez par ce que vous aimeriez entendre : des retours, des alternatives, des contradicteurs.',
  },
  {
    title: 'Le ton du 237',
    text: 'Bienveillant, concret, sans jargon gratuit. On débat des idées, jamais des personnes.',
  },
]

export function DiscussionTips({ variant }: { variant: 'aside' | 'disclosure' }) {
  return (
    <WritingTips
      title="Lancer une bonne discussion"
      tips={DISCUSSION_TIPS}
      variant={variant}
      footer={
        <>
          Un bug précis à résoudre ?{' '}
          <Link
            href="/forum/nouveau"
            className="text-ink-2 underline decoration-line-2 underline-offset-4 hover:decoration-ink"
          >
            Le forum d’entraide
          </Link>{' '}
          est fait pour ça.
        </>
      }
    />
  )
}

/**
 * Create / edit form of a discussion: title, up to three tags, body.
 */
export function DiscussionForm({
  tags,
  initial,
  action,
  method,
  submitLabel,
  cancelHref,
}: {
  tags: Data.Tag[]
  initial: { title: string; body: string; tags: number[] }
  action: string
  method: 'post' | 'put'
  submitLabel: string
  cancelHref: string
}) {
  const form = useForm({ title: initial.title, body: initial.body, tags: initial.tags })
  const titleLength = form.data.title.trim().length
  const full = form.data.tags.length >= MAX_TAGS
  const tagsError =
    (form.errors as Record<string, string | undefined>)['tags'] ??
    Object.entries(form.errors as Record<string, string | undefined>).find(([key]) =>
      key.startsWith('tags.')
    )?.[1]

  function toggleTag(id: number) {
    const selected = form.data.tags.includes(id)
    if (!selected && full) return
    form.setData(
      'tags',
      selected ? form.data.tags.filter((t) => t !== id) : [...form.data.tags, id]
    )
  }

  function submit(event?: FormEvent) {
    event?.preventDefault()
    form.submit(method, action, { preserveScroll: true })
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <Field
        label="Titre de la discussion"
        htmlFor="title"
        error={form.errors.title}
        hint={
          <span className="flex justify-between gap-4">
            <span>Une phrase qui donne envie de répondre.</span>
            <span
              className={cn(
                'font-mono tabular-nums',
                titleLength > 160 ? 'text-danger' : titleLength >= 10 ? 'text-ok' : ''
              )}
            >
              {titleLength}/160
            </span>
          </span>
        }
      >
        <Input
          id="title"
          name="title"
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value)}
          invalid={Boolean(form.errors.title)}
          aria-describedby={form.errors.title ? 'title-error' : 'title-hint'}
          placeholder="Ex. : Freelance depuis Douala, comment facturez-vous vos clients à l’étranger ?"
          maxLength={200}
          required
          autoFocus={!initial.title}
          className="h-12 text-[17px] font-medium"
        />
      </Field>

      <fieldset aria-describedby={tagsError ? 'tags-error' : 'tags-hint'}>
        <legend className="label flex w-full items-baseline justify-between text-ink-2">
          <span>Sujets</span>
          <span className={cn('tabular-nums', full ? 'text-ink' : 'text-muted')}>
            {form.data.tags.length}/{MAX_TAGS}
          </span>
        </legend>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const selected = form.data.tags.includes(tag.id)
            const disabled = !selected && full
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={selected}
                  disabled={disabled}
                  className={cn(
                    'inline-flex h-8 items-center rounded-sm border px-2.5 font-mono text-[12.5px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40',
                    selected
                      ? 'border-ink bg-js text-js-ink'
                      : 'border-line-2 text-ink-2 enabled:hover:border-ink enabled:hover:text-ink'
                  )}
                >
                  <span aria-hidden="true" className="opacity-50">
                    #
                  </span>
                  {tag.name}
                </button>
              </li>
            )
          })}
        </ul>
        {tagsError ? (
          <p id="tags-error" role="alert" className="mt-2 text-[13.5px] font-medium text-danger">
            {tagsError}
          </p>
        ) : (
          <p id="tags-hint" className="mt-2 text-[13.5px] text-muted">
            Jusqu’à trois sujets, pour que les bonnes personnes trouvent la discussion.
          </p>
        )}
      </fieldset>

      <Field
        label="Votre message"
        htmlFor="body"
        error={form.errors.body}
        hint="Markdown supporté. 20 caractères minimum."
      >
        <MarkdownEditor
          id="body"
          value={form.data.body}
          onChange={(value) => form.setData('body', value)}
          onSubmit={() => submit()}
          error={form.errors.body}
          placeholder="Racontez d’où vient la question, ce que vous en pensez, et ce que vous aimeriez entendre…"
          rows={14}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href={cancelHref} className="label link-draw self-start hover:text-ink sm:self-auto">
          Annuler
        </Link>
        <Button type="submit" size="lg" loading={form.processing}>
          {form.processing ? 'Publication…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
