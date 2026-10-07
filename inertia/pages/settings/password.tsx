import { useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Button } from '~/components/ui/button'
import { Field, Input } from '~/components/ui/field'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { FormSection } from '~/components/settings/form-section'

export default function SettingsPassword() {
  const user = usePage().props.user!
  const hasPassword = user.hasPassword
  const form = useForm({ currentPassword: '', password: '', passwordConfirmation: '' })
  const { data, errors } = form

  function submit(event: FormEvent) {
    event.preventDefault()
    form.put('/settings/password', {
      preserveScroll: true,
      onSuccess: () => form.reset(),
      onError: (errs) => {
        form.reset('password', 'passwordConfirmation')
        if (errs.currentPassword) form.reset('currentPassword')
      },
    })
  }

  const describedBy = (field: keyof typeof data) => (errors[field] ? `${field}-error` : undefined)

  return (
    <>
      <Seo title="Mot de passe" noindex />
      <WorkspaceHeader
        kicker="Paramètres · Mot de passe"
        title={hasPassword ? 'Changer de mot de passe.' : 'Définir un mot de passe.'}
        lead={
          hasPassword
            ? 'Après le changement, les appareils sur lesquels vous étiez resté connecté devront se reconnecter.'
            : 'Vous vous connectez avec GitHub. Ajoutez un mot de passe pour pouvoir aussi vous connecter avec votre e-mail ou votre nom d’utilisateur.'
        }
      />

      <form onSubmit={submit} noValidate className="mt-2">
        {/* Hidden username helps password managers attach the new password to the right account. */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={user.username}
          readOnly
          hidden
        />

        <FormSection
          index="01"
          title={hasPassword ? 'Nouveau mot de passe' : 'Premier mot de passe'}
          description="Au moins 8 caractères. Une phrase de passe (plusieurs mots) est plus facile à retenir et plus solide."
        >
          {hasPassword && (
            <Field
              label="Mot de passe actuel"
              htmlFor="currentPassword"
              error={errors.currentPassword}
            >
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={data.currentPassword}
                onChange={(e) => form.setData('currentPassword', e.target.value)}
                invalid={Boolean(errors.currentPassword)}
                aria-describedby={describedBy('currentPassword')}
                required
              />
            </Field>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Nouveau mot de passe"
              htmlFor="password"
              error={errors.password}
              hint="8 caractères minimum"
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={data.password}
                onChange={(e) => form.setData('password', e.target.value)}
                invalid={Boolean(errors.password)}
                aria-describedby={describedBy('password') ?? 'password-hint'}
                minLength={8}
                required
              />
            </Field>
            <Field
              label="Confirmation"
              htmlFor="passwordConfirmation"
              error={errors.passwordConfirmation}
            >
              <Input
                id="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                value={data.passwordConfirmation}
                onChange={(e) => form.setData('passwordConfirmation', e.target.value)}
                invalid={Boolean(errors.passwordConfirmation)}
                aria-describedby={describedBy('passwordConfirmation')}
                required
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button
              type="submit"
              loading={form.processing}
              disabled={!data.password || !data.passwordConfirmation}
            >
              <KeyRound size={15} strokeWidth={1.75} aria-hidden="true" />
              {form.processing
                ? 'Enregistrement…'
                : hasPassword
                  ? 'Changer le mot de passe'
                  : 'Définir le mot de passe'}
            </Button>
            {form.recentlySuccessful && (
              <p className="label text-ok" role="status">
                Mot de passe enregistré
              </p>
            )}
          </div>
        </FormSection>
      </form>
    </>
  )
}

SettingsPassword.layout = [DashboardLayout]
