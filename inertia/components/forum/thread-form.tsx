import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'
import type { Data } from '@generated/data'
import { Button } from '~/components/ui/button'
import { Field, Input, Select } from '~/components/ui/field'
import { MarkdownEditor } from '~/components/ui/markdown-editor'
import { cn } from '~/lib/format'

const BODY_PLACEHOLDER = `Le contexte : ce que vous essayez de faire, et où ça bloque.

\`\`\`js
// Le plus petit code qui reproduit le problème
\`\`\`

Le message d’erreur exact, ce que vous avez déjà essayé, vos versions (Node, navigateur…).`

/**
 * Create / edit form of a forum question.
 */
export function ThreadForm({
  channels,
  initial,
  action,
  method,
  submitLabel,
  cancelHref,
}: {
  channels: Data.Channel[]
  initial: { title: string; channelId: number | null; body: string }
  action: string
  method: 'post' | 'put'
  submitLabel: string
  cancelHref: string
}) {
  const form = useForm({
    title: initial.title,
    channelId: initial.channelId ? String(initial.channelId) : '',
    body: initial.body,
  })

  const titleLength = form.data.title.trim().length

  function submit(event?: FormEvent) {
    event?.preventDefault()
    form.transform((data) => ({
      ...data,
      channelId: data.channelId ? Number(data.channelId) : null,
    }))
    form.submit(method, action, { preserveScroll: true })
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <Field
        label="Titre de la question"
        htmlFor="title"
        error={form.errors.title}
        hint={
          <span className="flex justify-between gap-4">
            <span>Le problème en une phrase, comme vous le chercheriez sur Google.</span>
            <span
              className={cn(
                'font-mono tabular-nums',
                titleLength > 160 ? 'text-danger' : titleLength >= 15 ? 'text-ok' : ''
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
          placeholder="Ex. : useEffect se déclenche deux fois en développement avec React 19"
          maxLength={200}
          required
          autoFocus={!initial.title}
          className="h-12 text-[17px] font-medium"
        />
      </Field>

      <Field
        label="Canal"
        htmlFor="channelId"
        error={form.errors.channelId}
        hint="Le domaine principal de votre question."
      >
        <Select
          id="channelId"
          name="channelId"
          value={form.data.channelId}
          onChange={(e) => form.setData('channelId', e.target.value)}
          invalid={Boolean(form.errors.channelId)}
          aria-describedby={form.errors.channelId ? 'channelId-error' : 'channelId-hint'}
          required
          className="sm:max-w-sm"
        >
          <option value="" disabled>
            Choisissez un canal…
          </option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Votre question"
        htmlFor="body"
        error={form.errors.body}
        hint="Markdown supporté. 30 caractères minimum."
      >
        <MarkdownEditor
          id="body"
          value={form.data.body}
          onChange={(value) => form.setData('body', value)}
          onSubmit={() => submit()}
          error={form.errors.body}
          placeholder={BODY_PLACEHOLDER}
          rows={16}
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
