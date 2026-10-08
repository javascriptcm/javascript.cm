import { useForm, usePage } from '@inertiajs/react'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Button } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { FormSection } from '~/components/settings/form-section'
import { formatDate, plural } from '~/lib/format'

type ProviderName = 'github' | 'google' | 'apple'

type Props = {
  linkedProviders: Record<ProviderName, boolean>
  content: { articles: number; threads: number; discussions: number; replies: number }
}

const PROVIDER_LABELS: Record<ProviderName, string> = {
  github: 'GitHub',
  google: 'Google',
  apple: 'Apple',
}

export default function SettingsAccount({ linkedProviders, content }: Props) {
  const { user: sessionUser, features } = usePage().props
  const user = sessionUser!
  const [open, setOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const form = useForm({ confirmation: '' })
  const matches =
    form.data.confirmation.trim().replace(/^@/, '').toLowerCase() === user.username.toLowerCase()
  const error = localError ?? form.errors.confirmation

  function close() {
    setOpen(false)
    setLocalError(null)
    form.reset()
    form.clearErrors()
  }

  function confirm() {
    if (!matches) {
      setLocalError('Saisissez exactement votre nom d’utilisateur pour confirmer.')
      document.getElementById('confirmation')?.focus()
      return
    }
    form.delete('/settings/account', { preserveScroll: true })
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      confirm()
    }
  }

  // Providers linked to the account, plus the ones available to link.
  const providers = (Object.keys(PROVIDER_LABELS) as ProviderName[]).filter(
    (name) => linkedProviders[name] || features?.[name]
  )
  const linkedLabels = providers
    .filter((name) => linkedProviders[name])
    .map((name) => PROVIDER_LABELS[name])

  const facts: [string, ReactNode][] = [
    ['E-mail de connexion', user.email],
    ['Membre depuis le', formatDate(user.createdAt)],
    ...providers.map((name): [string, ReactNode] => [
      `Connexion ${PROVIDER_LABELS[name]}`,
      linkedProviders[name] ? 'Liée' : 'Non liée',
    ]),
    [
      'Mot de passe',
      user.hasPassword
        ? 'Défini'
        : `Aucun (connexion ${linkedLabels.length ? `avec ${linkedLabels.join(' ou ')}` : 'externe'} uniquement)`,
    ],
  ]

  const losses = [
    plural(content.articles, 'article', 'articles', 'aucun article'),
    plural(content.threads, 'question', 'questions', 'aucune question'),
    plural(content.discussions, 'discussion', 'discussions', 'aucune discussion'),
    plural(content.replies, 'réponse', 'réponses', 'aucune réponse'),
  ]

  return (
    <>
      <Seo title="Compte" noindex />
      <WorkspaceHeader
        kicker="Paramètres · Compte"
        title="Votre compte."
        lead="Les informations de connexion de votre compte, et la porte de sortie."
      />

      <div className="mt-2">
        <FormSection
          index="01"
          title="Informations"
          description="Visibles par vous seul. Modifiez votre e-mail depuis la page Profil."
        >
          <dl className="border-t border-line">
            {facts.map(([term, value]) => (
              <div
                key={term}
                className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="label pt-0.5">{term}</dt>
                <dd className="min-w-0 text-[15.5px] break-words text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </FormSection>

        <FormSection
          index="02"
          title="Supprimer mon compte"
          description="Définitif : il n’y a ni corbeille, ni retour en arrière."
          className="[&_h2]:text-danger"
        >
          <div className="rounded-sm border border-danger p-5 sm:p-6">
            <p className="text-[15.5px] text-ink-2">
              Votre profil et tout ce que vous avez publié seront effacés :{' '}
              <strong className="font-semibold text-ink">{losses.join(', ')}</strong>, ainsi que vos
              j’aime. Les questions auxquelles vous avez répondu perdront vos réponses.
            </p>
            <Button variant="danger" className="mt-5" onClick={() => setOpen(true)}>
              <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" /> Supprimer mon compte
            </Button>
          </div>
        </FormSection>
      </div>

      <ConfirmDialog
        open={open}
        onClose={close}
        onConfirm={confirm}
        processing={form.processing}
        confirmLabel="Supprimer définitivement"
        title="Supprimer votre compte ?"
        description={
          <>
            Tapez <strong className="font-mono font-semibold text-ink">{user.username}</strong> pour
            confirmer.
            <label htmlFor="confirmation" className="sr-only">
              Votre nom d’utilisateur
            </label>
            <input
              id="confirmation"
              value={form.data.confirmation}
              onChange={(e) => {
                setLocalError(null)
                form.setData('confirmation', e.target.value)
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'confirmation-error' : undefined}
              placeholder={user.username}
              className="mt-4 block h-11 w-full rounded-sm border border-line-2 bg-paper px-3.5 font-mono text-[15px] text-ink placeholder:text-muted/60 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none aria-[invalid=true]:border-danger"
            />
            {error && (
              <span
                id="confirmation-error"
                role="alert"
                className="mt-2 block text-[13.5px] font-medium text-danger"
              >
                {error}
              </span>
            )}
          </>
        }
      />
    </>
  )
}

SettingsAccount.layout = [DashboardLayout]
