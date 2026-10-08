import { Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Field, Input, Textarea } from '~/components/ui/field'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { FormSection } from '~/components/settings/form-section'
import { cn } from '~/lib/format'

const BIO_MAX = 280

/**
 * Mirrors normalizeHandle() on the server: keep only the handle when a
 * profile URL or "@handle" is pasted.
 */
const PREFIXES = {
  githubUsername: /^(?:[a-z0-9-]+\.)?github\.com\//i,
  twitterUsername: /^(?:(?:mobile|www)\.)?(?:twitter|x)\.com\//i,
  linkedinUsername: /^(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\//i,
}

function handleFrom(value: string, field: keyof typeof PREFIXES) {
  let handle = value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
  handle = handle.replace(PREFIXES[field], '').replace(/^@+/, '')
  return handle.split(/[/?#\s]/)[0] ?? ''
}

function PrefixedInput({
  id,
  prefix,
  value,
  onChange,
  onBlur,
  invalid,
  placeholder,
}: {
  id: string
  prefix: ReactNode
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  placeholder?: string
}) {
  return (
    <div
      className={cn(
        'flex h-11 min-w-0 overflow-hidden rounded-sm border bg-card transition-[border-color,box-shadow] duration-150 focus-within:border-ink focus-within:shadow-[0_0_0_3px_var(--js)]',
        invalid ? 'border-danger' : 'border-line-2'
      )}
    >
      <span
        className="inline-flex shrink-0 items-center border-r border-line bg-paper-2 px-3 font-mono text-[12.5px] text-muted select-none"
        aria-hidden="true"
      >
        {prefix}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink placeholder:text-muted/80 focus:outline-none"
      />
    </div>
  )
}

export default function SettingsProfile() {
  const user = usePage().props.user!
  const form = useForm({
    name: user.name ?? '',
    username: user.username,
    email: user.email,
    bio: user.bio ?? '',
    location: user.location ?? '',
    websiteUrl: user.websiteUrl ?? '',
    avatarUrl: user.avatarUrl ?? '',
    githubUsername: user.githubUsername ?? '',
    twitterUsername: user.twitterUsername ?? '',
    linkedinUsername: user.linkedinUsername ?? '',
  })
  const { data, errors } = form

  function submit(event: FormEvent) {
    event.preventDefault()
    form.put('/settings', {
      preserveScroll: true,
      onSuccess: (page) => {
        const fresh = page.props.user
        if (fresh) {
          form.setDefaults({
            name: fresh.name ?? '',
            username: fresh.username,
            email: fresh.email,
            bio: fresh.bio ?? '',
            location: fresh.location ?? '',
            websiteUrl: fresh.websiteUrl ?? '',
            avatarUrl: fresh.avatarUrl ?? '',
            githubUsername: fresh.githubUsername ?? '',
            twitterUsername: fresh.twitterUsername ?? '',
            linkedinUsername: fresh.linkedinUsername ?? '',
          })
        }
      },
    })
  }

  const githubHandle = handleFrom(data.githubUsername, 'githubUsername')
  const githubAvatar = githubHandle ? `https://github.com/${githubHandle}.png` : null
  const bioLeft = BIO_MAX - data.bio.length
  const preview = {
    displayName: data.name || data.username,
    initials: user.initials,
    avatarUrl: /^https:\/\/\S+$/.test(data.avatarUrl) ? data.avatarUrl : null,
  }

  const text = (field: keyof typeof data) => ({
    'id': field,
    'value': data[field],
    'onChange': (e: { target: { value: string } }) => form.setData(field, e.target.value),
    'invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })

  const handleProps = (field: keyof typeof PREFIXES) => ({
    id: field,
    value: data[field],
    onChange: (value: string) => form.setData(field, value),
    onBlur: () => form.setData(field, handleFrom(data[field], field)),
    invalid: Boolean(errors[field]),
  })

  return (
    <>
      <Seo title="Paramètres du profil" noindex />
      <WorkspaceHeader
        kicker="Paramètres · Profil"
        title="Votre profil public."
        lead={
          <>
            Ce que la communauté voit sur{' '}
            <Link
              href={`/@${user.username}`}
              className="font-mono text-[15px] text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js hover:text-js-ink"
            >
              javascript.cm/@{user.username}
            </Link>
            . Votre e-mail reste privé.
          </>
        }
      />

      <form onSubmit={submit} noValidate className="mt-2">
        <FormSection
          index="01"
          title="Identité"
          description="Votre nom affiché, votre adresse de profil et l’e-mail de connexion (jamais affiché)."
        >
          <Field label="Nom complet" htmlFor="name" error={errors.name}>
            <Input autoComplete="name" required {...text('name')} />
          </Field>
          <Field
            label="Nom d’utilisateur"
            htmlFor="username"
            error={errors.username}
            hint={
              data.username !== user.username
                ? `Nouvelle adresse : javascript.cm/@${data.username.toLowerCase()} — l’ancienne ne fonctionnera plus.`
                : 'Lettres minuscules, chiffres, - et _'
            }
          >
            <Input
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              {...text('username')}
              onChange={(e) => form.setData('username', e.target.value.replace(/\s/g, ''))}
            />
          </Field>
          <Field
            label="E-mail"
            htmlFor="email"
            error={errors.email}
            hint="Sert à vous connecter. Il n’apparaît nulle part sur le site."
          >
            <Input type="email" autoComplete="email" required {...text('email')} />
          </Field>
        </FormSection>

        <FormSection
          index="02"
          title="Présentation"
          description="Quelques mots sur vous, votre ville, votre site. Tout est facultatif."
        >
          <Field
            label="Bio"
            htmlFor="bio"
            error={errors.bio}
            hint="Ce sur quoi vous travaillez, ce que vous aimez apprendre."
            optional
          >
            <div className="relative">
              <Textarea
                rows={3}
                className="pb-8"
                placeholder="Développeuse front-end à Douala, passionnée d’accessibilité…"
                {...text('bio')}
              />
              <span
                className={cn(
                  'pointer-events-none absolute right-3 bottom-2.5 font-mono text-[12px] tabular-nums',
                  bioLeft < 0
                    ? 'font-semibold text-danger'
                    : bioLeft <= 30
                      ? 'text-ink'
                      : 'text-muted'
                )}
                aria-hidden="true"
              >
                {data.bio.length}/{BIO_MAX}
              </span>
              <span className="sr-only" aria-live="polite">
                {bioLeft < 0
                  ? `${-bioLeft} caractères de trop`
                  : bioLeft <= 30
                    ? `${bioLeft} caractères restants`
                    : ''}
              </span>
            </div>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ville" htmlFor="location" error={errors.location} optional>
              <Input
                autoComplete="address-level2"
                placeholder="Douala, Yaoundé, Buea…"
                {...text('location')}
              />
            </Field>
            <Field label="Site web" htmlFor="websiteUrl" error={errors.websiteUrl} optional>
              <Input
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://"
                {...text('websiteUrl')}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          index="03"
          title="Réseaux"
          description="Votre identifiant seul suffit ; si vous collez l’adresse complète du profil, nous gardons l’identifiant."
        >
          <Field label="GitHub" htmlFor="githubUsername" error={errors.githubUsername} optional>
            <PrefixedInput
              prefix="github.com/"
              placeholder="votre-pseudo"
              {...handleProps('githubUsername')}
            />
          </Field>
          <Field
            label="X (Twitter)"
            htmlFor="twitterUsername"
            error={errors.twitterUsername}
            optional
          >
            <PrefixedInput
              prefix="x.com/"
              placeholder="votre_pseudo"
              {...handleProps('twitterUsername')}
            />
          </Field>
          <Field
            label="LinkedIn"
            htmlFor="linkedinUsername"
            error={errors.linkedinUsername}
            optional
          >
            <PrefixedInput
              prefix="linkedin.com/in/"
              placeholder="prenom-nom"
              {...handleProps('linkedinUsername')}
            />
          </Field>
        </FormSection>

        <FormSection
          index="04"
          title="Avatar"
          description="Une image carrée hébergée en https (au moins 256 × 256 px)."
        >
          <div className="flex items-start gap-5">
            <Avatar user={preview} size="xl" />
            <div className="grid min-w-0 flex-1 gap-3">
              <Field
                label="Adresse de l’image"
                htmlFor="avatarUrl"
                error={errors.avatarUrl}
                optional
              >
                <Input type="url" inputMode="url" placeholder="https://…" {...text('avatarUrl')} />
              </Field>
              <div className="flex flex-wrap gap-2">
                {githubAvatar && data.avatarUrl !== githubAvatar && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => form.setData('avatarUrl', githubAvatar)}
                  >
                    Utiliser mon avatar GitHub
                  </Button>
                )}
                {data.avatarUrl && (
                  <Button size="sm" variant="ghost" onClick={() => form.setData('avatarUrl', '')}>
                    Retirer l’image
                  </Button>
                )}
              </div>
              {!githubAvatar && (
                <p className="text-[13.5px] text-muted">
                  Renseignez votre pseudo GitHub pour réutiliser votre avatar GitHub en un clic.
                </p>
              )}
            </div>
          </div>
        </FormSection>

        <div
          className={cn(
            'z-10 -mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink bg-paper px-4 py-4 sm:mx-0 sm:px-0',
            form.isDirty && 'sticky bottom-0'
          )}
        >
          <p className="label" aria-live="polite">
            {form.isDirty
              ? 'Modifications non enregistrées'
              : form.recentlySuccessful
                ? 'Enregistré'
                : 'À jour'}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/@${user.username}`}
              className="label hidden items-center gap-1 px-2 text-ink hover:underline sm:inline-flex"
            >
              Voir mon profil <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
            <Button type="submit" loading={form.processing} disabled={!form.isDirty}>
              {form.processing ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

SettingsProfile.layout = [DashboardLayout]
