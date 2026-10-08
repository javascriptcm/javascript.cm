import { Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent } from 'react'
import AuthLayout from '~/layouts/auth'
import { Seo } from '~/components/seo'
import { Button } from '~/components/ui/button'
import { Checkbox, Field, Input } from '~/components/ui/field'
import { GithubButton } from '~/components/github-button'

export default function Login({ redirect }: { redirect: string }) {
  const { features } = usePage().props
  const form = useForm({ login: '', password: '', remember: true, redirect })

  function submit(event: FormEvent) {
    event.preventDefault()
    form.post('/login', { onFinish: () => form.reset('password') })
  }

  return (
    <>
      <Seo title="Connexion" description="Connectez-vous à JavaScript Cameroun." noindex />
      <p className="label">Connexion</p>
      <h1 className="mt-3 text-[clamp(2.3rem,5vw,3.2rem)] leading-[0.95] font-bold tracking-[-0.04em]">
        Bon retour parmi nous.
      </h1>
      <p className="mt-3 text-[16px] text-ink-2">
        Reprenez là où vous en étiez : vos articles, vos questions, vos discussions.
      </p>

      {features.github && (
        <>
          <GithubButton className="mt-8" />
          <div className="my-7 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="label">ou</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form
        onSubmit={submit}
        className={features.github ? 'grid gap-5' : 'mt-8 grid gap-5'}
        noValidate
      >
        <Field label="E-mail ou nom d’utilisateur" htmlFor="login" error={form.errors.login}>
          <Input
            id="login"
            name="login"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={form.data.login}
            onChange={(e) => form.setData('login', e.target.value)}
            invalid={Boolean(form.errors.login)}
            aria-describedby={form.errors.login ? 'login-error' : undefined}
            required
            autoFocus
          />
        </Field>
        <Field label="Mot de passe" htmlFor="password" error={form.errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.data.password}
            onChange={(e) => form.setData('password', e.target.value)}
            invalid={Boolean(form.errors.password)}
            required
          />
        </Field>
        <Checkbox
          id="remember"
          label="Rester connecté sur cet appareil"
          checked={form.data.remember}
          onChange={(e) => form.setData('remember', e.target.checked)}
        />
        <Button type="submit" size="lg" block loading={form.processing} className="mt-1">
          {form.processing ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-[15px] text-ink-2">
        Pas encore membre ?{' '}
        <Link
          href="/register"
          className="font-semibold text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js"
        >
          Créer un compte
        </Link>
      </p>
    </>
  )
}

Login.layout = [AuthLayout]
