import { Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { Avatar } from '~/components/ui/avatar'
import { Button, ButtonLink } from '~/components/ui/button'
import { MarkdownEditor } from '~/components/ui/markdown-editor'

/**
 * Reply composer. Posts { body } to `action`. Guests get a sign-in prompt,
 * locked conversations a notice.
 */
export function ReplyForm({
  action,
  locked = false,
  placeholder = 'Votre réponse… (Markdown supporté, blocs de code avec ```js)',
  submitLabel = 'Publier la réponse',
}: {
  action: string
  locked?: boolean
  placeholder?: string
  submitLabel?: string
}) {
  const page = usePage()
  const { user } = page.props
  const form = useForm({ body: '' })

  function submit(event?: FormEvent) {
    event?.preventDefault()
    form.post(action, { preserveScroll: true, onSuccess: () => form.reset('body') })
  }

  if (locked) {
    return (
      <div className="rounded-sm border border-dashed border-line-2 px-6 py-6">
        <p className="label">Conversation verrouillée</p>
        <p className="mt-2 text-[15px] text-ink-2">
          Les modérateurs ont fermé ce sujet aux nouvelles réponses.
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4 rounded-sm border border-ink bg-card px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[18px] font-semibold tracking-[-0.015em]">Envie de participer ?</p>
          <p className="mt-1 text-[15px] text-ink-2">
            Connectez-vous pour répondre et aider la communauté.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/login?redirect=${encodeURIComponent(page.url)}`} variant="secondary">
            Se connecter
          </ButtonLink>
          <ButtonLink href="/register">Rejoindre</ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-5">
      <Link href={`/@${user.username}`} aria-label="Mon profil">
        <Avatar user={user} size="md" />
      </Link>
      <div>
        <label htmlFor="reply-body" className="sr-only">
          Votre réponse
        </label>
        <MarkdownEditor
          id="reply-body"
          value={form.data.body}
          onChange={(value) => form.setData('body', value)}
          onSubmit={() => submit()}
          error={form.errors.body}
          placeholder={placeholder}
          rows={6}
          compact
        />
        {form.errors.body && (
          <p
            id="reply-body-error"
            className="mt-2 text-[13.5px] font-medium text-danger"
            role="alert"
          >
            {form.errors.body}
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <Button type="submit" loading={form.processing} disabled={!form.data.body.trim()}>
            {form.processing ? 'Publication…' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
