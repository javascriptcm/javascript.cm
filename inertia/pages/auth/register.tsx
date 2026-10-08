import { Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import AuthLayout from '~/layouts/auth'
import { Seo } from '~/components/seo'
import { Button } from '~/components/ui/button'
import { Field, Input } from '~/components/ui/field'
import { hasSocialProviders, SocialButtons } from '~/components/social-buttons'

export default function Register() {
  const { features } = usePage().props
  const showSocial = hasSocialProviders(features)
  const form = useForm({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    form.post('/register', { onFinish: () => form.reset('password', 'passwordConfirmation') })
  }

  return (
    <>
      <Seo
        title="Rejoindre la communauté"
        description="Créez votre compte JavaScript Cameroun : publiez des articles, posez vos questions, aidez les autres."
      />
      <p className="label">Adhésion — gratuite, pour toujours</p>
      <h1 className="mt-3 text-[clamp(2.3rem,5vw,3.2rem)] leading-[0.95] font-bold tracking-[-0.04em]">
        Rejoignez le 237 du JavaScript.
      </h1>
      <p className="mt-3 text-[16px] text-ink-2">
        Un compte pour écrire, demander de l’aide et aider les autres.
      </p>

      {showSocial && (
        <>
          <SocialButtons className="mt-8" />
          <div className="my-7 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="label">ou avec votre e-mail</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={showSocial ? 'grid gap-5' : 'mt-8 grid gap-5'} noValidate>
        <Field label="Nom complet" htmlFor="name" error={form.errors.name}>
          <Input
            id="name"
            autoComplete="name"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            invalid={Boolean(form.errors.name)}
            required
            autoFocus
          />
        </Field>
        <Field
          label="Nom d’utilisateur"
          htmlFor="username"
          error={form.errors.username}
          hint={
            form.data.username
              ? `Votre profil : javascript.cm/@${form.data.username.toLowerCase()}`
              : 'Lettres minuscules, chiffres, - et _'
          }
        >
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={form.data.username}
            onChange={(e) => form.setData('username', e.target.value.replace(/\s/g, ''))}
            invalid={Boolean(form.errors.username)}
            required
          />
        </Field>
        <Field label="E-mail" htmlFor="email" error={form.errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            invalid={Boolean(form.errors.email)}
            required
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Mot de passe"
            htmlFor="password"
            error={form.errors.password}
            hint="8 caractères minimum"
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.data.password}
              onChange={(e) => form.setData('password', e.target.value)}
              invalid={Boolean(form.errors.password)}
              required
            />
          </Field>
          <Field
            label="Confirmation"
            htmlFor="passwordConfirmation"
            error={form.errors.passwordConfirmation}
          >
            <Input
              id="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              value={form.data.passwordConfirmation}
              onChange={(e) => form.setData('passwordConfirmation', e.target.value)}
              invalid={Boolean(form.errors.passwordConfirmation)}
              required
            />
          </Field>
        </div>
        <Button type="submit" size="lg" block loading={form.processing} className="mt-1">
          {form.processing ? 'Création du compte…' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-[15px] text-ink-2">
        Déjà membre ?{' '}
        <Link
          href="/login"
          className="font-semibold text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js hover:text-js-ink"
        >
          Se connecter
        </Link>
      </p>
    </>
  )
}

Register.layout = [AuthLayout]
