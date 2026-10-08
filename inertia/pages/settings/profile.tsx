import { Link, useForm, usePage } from '@inertiajs/react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Field, Input, Textarea } from '~/components/ui/field'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { FormSection } from '~/components/settings/form-section'
import { RadioCards } from '~/components/settings/radio-cards'
import { SkillsInput } from '~/components/settings/skills-input'
import { LinksEditor } from '~/components/settings/links-editor'
import { AVAILABILITY_LABELS, type Availability } from '~/components/profile/availability'
import { cn } from '~/lib/format'

const BIO_MAX = 280
const HEADLINE_MAX = 120

type AvailabilityChoice = Availability | ''

const AVAILABILITY_OPTIONS: { value: AvailabilityChoice; label: string; description: string }[] = [
  { value: '', label: 'Non précisé', description: 'Rien n’est affiché sur votre profil.' },
  {
    value: 'open_to_work',
    label: AVAILABILITY_LABELS.open_to_work,
    description: 'Vous écoutez les propositions de poste.',
  },
  {
    value: 'freelance',
    label: AVAILABILITY_LABELS.freelance,
    description: 'Vous acceptez des missions.',
  },
  {
    value: 'hiring',
    label: AVAILABILITY_LABELS.hiring,
    description: 'Vous cherchez des profils pour votre équipe.',
  },
]

/**
 * Character counter drawn inside a text control (bottom right).
 */
function Counter({ length, max, warnAt = 20 }: { length: number; max: number; warnAt?: number }) {
  const left = max - length
  return (
    <>
      <span
        className={cn(
          'pointer-events-none absolute right-3 bottom-2.5 font-mono text-[12px] tabular-nums',
          left < 0 ? 'font-semibold text-danger' : left <= warnAt ? 'text-ink' : 'text-muted'
        )}
        aria-hidden="true"
      >
        {length}/{max}
      </span>
      <span className="sr-only" aria-live="polite">
        {left < 0
          ? `${-left} caractères de trop`
          : left <= warnAt
            ? `${left} caractères restants`
            : ''}
      </span>
    </>
  )
}

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

type SessionUser = NonNullable<ReturnType<typeof usePage>['props']['user']>

function formValues(user: SessionUser) {
  return {
    name: user.name ?? '',
    username: user.username,
    email: user.email,
    headline: user.headline ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    availability: (user.availability ?? '') as AvailabilityChoice,
    skills: [...(user.skills ?? [])],
    portfolioUrl: user.portfolioUrl ?? '',
    websiteUrl: user.websiteUrl ?? '',
    avatarUrl: user.avatarUrl ?? '',
    githubUsername: user.githubUsername ?? '',
    twitterUsername: user.twitterUsername ?? '',
    linkedinUsername: user.linkedinUsername ?? '',
    links: (user.links ?? []).map((link) => ({ label: link.label, url: link.url })),
  }
}

type TextField =
  | 'name'
  | 'username'
  | 'email'
  | 'headline'
  | 'bio'
  | 'location'
  | 'portfolioUrl'
  | 'websiteUrl'
  | 'avatarUrl'

export default function SettingsProfile() {
  const user = usePage().props.user!
  const form = useForm(formValues(user))
  const { data } = form
  const errors = form.errors as Record<string, string | undefined>

  function submit(event: FormEvent) {
    event.preventDefault()
    form.put('/settings', {
      preserveScroll: true,
      onSuccess: (page) => {
        const fresh = page.props.user
        if (fresh) {
          const values = formValues(fresh)
          form.setDefaults(values)
          // The server normalizes skills and links: show what was saved.
          form.setData(values)
        }
      },
    })
  }

  const skillsError = Object.entries(errors).find(([key]) => key.startsWith('skills'))?.[1]

  const githubHandle = handleFrom(data.githubUsername, 'githubUsername')
  const githubAvatar = githubHandle ? `https://github.com/${githubHandle}.png` : null
  const preview = {
    displayName: data.name || data.username,
    initials: user.initials,
    avatarUrl: /^https:\/\/\S+$/.test(data.avatarUrl) ? data.avatarUrl : null,
  }

  const text = (field: TextField) => ({
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
          title="Profil professionnel"
          description="Ce que les recruteurs et les membres lisent en premier : votre titre, votre ville, ce que vous savez faire et si vous êtes disponible."
        >
          <Field
            label="Titre"
            htmlFor="headline"
            error={errors.headline}
            hint="Votre métier et votre spécialité, en une ligne."
            optional
          >
            <div className="relative">
              <Input
                className="pr-20"
                placeholder="Développeuse full-stack React / Node · Douala"
                {...text('headline')}
              />
              <Counter length={data.headline.length} max={HEADLINE_MAX} />
            </div>
          </Field>
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
              <Counter length={data.bio.length} max={BIO_MAX} warnAt={30} />
            </div>
          </Field>
          <Field label="Ville" htmlFor="location" error={errors.location} optional>
            <Input
              autoComplete="address-level2"
              placeholder="Douala, Yaoundé, Buea…"
              className="sm:max-w-sm"
              {...text('location')}
            />
          </Field>
          <RadioCards
            name="availability"
            legend="Disponibilité"
            value={data.availability}
            options={AVAILABILITY_OPTIONS}
            onChange={(value) => form.setData('availability', value)}
            describedBy={errors.availability ? 'availability-error' : undefined}
          />
          {errors.availability && (
            <p id="availability-error" className="-mt-3 text-[13.5px] font-medium text-danger">
              {errors.availability}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="skills"
              className="label flex items-baseline justify-between text-ink-2"
            >
              <span>Compétences</span>
              <span className="tracking-normal normal-case text-muted">jusqu’à 12</span>
            </label>
            <SkillsInput
              id="skills"
              value={data.skills}
              onChange={(skills) => form.setData('skills', skills)}
              invalid={Boolean(skillsError)}
              describedBy={skillsError ? 'skills-error' : undefined}
            />
            {skillsError && (
              <p id="skills-error" className="text-[13.5px] font-medium text-danger" role="alert">
                {skillsError}
              </p>
            )}
          </div>
        </FormSection>

        <FormSection
          index="03"
          title="Liens"
          description="Votre portfolio s’affiche en premier. Pour les réseaux, votre identifiant suffit : si vous collez l’adresse du profil, nous gardons l’identifiant."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Portfolio"
              htmlFor="portfolioUrl"
              error={errors.portfolioUrl}
              hint="Vos projets, vos réalisations."
              optional
            >
              <Input type="url" inputMode="url" placeholder="https://" {...text('portfolioUrl')} />
            </Field>
            <Field
              label="Site personnel / blog"
              htmlFor="websiteUrl"
              error={errors.websiteUrl}
              optional
            >
              <Input
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://"
                {...text('websiteUrl')}
              />
            </Field>
          </div>
          <Field label="GitHub" htmlFor="githubUsername" error={errors.githubUsername} optional>
            <PrefixedInput
              prefix="github.com/"
              placeholder="votre-pseudo"
              {...handleProps('githubUsername')}
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
          <div className="border-t border-line pt-5">
            <LinksEditor
              value={data.links}
              onChange={(links) => form.setData('links', links)}
              errors={errors}
            />
          </div>
          <Link
            href="/settings/cv"
            className="group flex items-center gap-3 rounded-sm border border-line-2 bg-card px-4 py-3.5 transition-colors duration-150 hover:border-ink"
          >
            <FileText
              size={18}
              strokeWidth={1.75}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 text-[14.5px] text-ink-2">
              <span className="font-semibold text-ink">Votre CV</span> se gère sur sa propre page :
              envoi du PDF et choix de qui peut le consulter.
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-muted transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:text-ink"
              aria-hidden="true"
            />
          </Link>
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
