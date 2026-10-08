import vine from '@vinejs/vine'
import type { FieldContext, MessagesProviderContact } from '@vinejs/vine/types'
import { usernameRule } from '#validators/register_validator'

/**
 * Field-specific French messages ("githubUsername.regex") layered on top of
 * the global messages provider (start/validator.ts).
 */
export function withMessages<V extends { messagesProvider: MessagesProviderContact }>(
  validator: V,
  overrides: Record<string, string>
): V {
  const fallback = validator.messagesProvider
  validator.messagesProvider = {
    getMessage(
      defaultMessage: string,
      rule: string,
      field: FieldContext,
      args?: Record<string, any>
    ) {
      return (
        overrides[`${field.wildCardPath}.${rule}`] ??
        fallback.getMessage(defaultMessage, rule, field, args)
      )
    },
  }
  return validator
}

type SocialNetwork = 'github' | 'twitter' | 'linkedin'

/**
 * Hosts (and path prefixes) members tend to paste instead of a plain handle.
 */
const PROFILE_URL_PREFIXES: Record<SocialNetwork, RegExp> = {
  github: /^(?:[a-z0-9-]+\.)?github\.com\//i,
  twitter: /^(?:(?:mobile|www)\.)?(?:twitter|x)\.com\//i,
  linkedin: /^(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\//i,
}

/**
 * Turn "@foo", "https://github.com/foo/", "x.com/foo?s=21" into "foo".
 * Returns null for blank values.
 */
export function normalizeHandle(value: unknown, network: SocialNetwork): string | null {
  if (typeof value !== 'string') return null
  let handle = value.trim()
  if (!handle) return null
  handle = handle.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  handle = handle.replace(PROFILE_URL_PREFIXES[network], '')
  handle = handle.replace(/^@+/, '')
  handle = handle.split(/[/?#\s]/)[0] ?? ''
  try {
    handle = decodeURIComponent(handle)
  } catch {
    // keep the raw value, the format rule will reject it
  }
  return handle || null
}

const httpsUrl = (maxLength: number) =>
  vine
    .string()
    .trim()
    .maxLength(maxLength)
    .url({ protocols: ['https'], require_protocol: true, require_valid_protocol: true })

export const AVAILABILITIES = ['open_to_work', 'freelance', 'hiring'] as const
export const CV_VISIBILITIES = ['public', 'members', 'private'] as const
export const MAX_SKILLS = 12
export const MAX_LINKS = 4

/**
 * Skills arrive as an array (or a comma-separated string): trim, collapse
 * spaces, drop a leading "#", and de-duplicate case-insensitively (the
 * first spelling wins). Length and count limits are left to the validator.
 */
export function normalizeSkills(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  const seen = new Set<string>()
  const skills: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    const skill = item.replace(/\s+/g, ' ').trim().replace(/^#+/, '').trim()
    const key = skill.toLocaleLowerCase('fr')
    if (!skill || seen.has(key)) continue
    seen.add(key)
    skills.push(skill)
  }
  return skills
}

/**
 * Extra links: drop the rows left completely empty in the form. A blank
 * label or URL becomes undefined so that the "required" message shows.
 */
export function normalizeLinks(value: unknown): { label?: string; url?: string }[] {
  if (!Array.isArray(value)) return []
  const text = (input: unknown) =>
    typeof input === 'string' ? input.replace(/\s+/g, ' ').trim() || undefined : undefined
  return value
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    .map((row) => ({ label: text(row.label), url: text(row.url) }))
    .filter((row) => row.label || row.url)
}

/**
 * Public profile settings. Social handles are normalized by the controller
 * (see normalizeHandle) before validation. Empty inputs arrive as null
 * (bodyparser "convertEmptyStringsToNull").
 */
export const profileSettingsValidator = withMessages(
  vine.withMetaData<{ userId: number }>().create({
    name: vine.string().trim().minLength(2).maxLength(120),
    username: usernameRule().unique({
      table: 'users',
      column: 'username',
      caseInsensitive: true,
      filter: (db, _value, field) => {
        db.whereNot('id', field.meta.userId)
      },
    }),
    email: vine
      .string()
      .trim()
      .toLowerCase()
      .email()
      .maxLength(254)
      .unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
        filter: (db, _value, field) => {
          db.whereNot('id', field.meta.userId)
        },
      }),
    bio: vine.string().trim().maxLength(280).nullable(),
    location: vine.string().trim().maxLength(100).nullable(),
    websiteUrl: httpsUrl(255).nullable(),
    avatarUrl: httpsUrl(500).nullable(),
    // Professional fields: optional so that an older client which does not
    // send them leaves the stored values untouched (see the controller).
    headline: vine.string().trim().maxLength(120).nullable().optional(),
    availability: vine.enum(AVAILABILITIES).nullable().optional(),
    skills: vine
      .array(
        vine
          .string()
          .minLength(2)
          .maxLength(30)
          .regex(/^[\p{L}\p{N}.#+][\p{L}\p{N} .#+/&'_-]*$/u)
      )
      .maxLength(MAX_SKILLS)
      .optional(),
    portfolioUrl: httpsUrl(255).nullable().optional(),
    links: vine
      .array(
        vine.object({
          label: vine.string().minLength(2).maxLength(30),
          url: httpsUrl(255),
        })
      )
      .maxLength(MAX_LINKS)
      .optional(),
    githubUsername: vine
      .string()
      .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
      .nullable(),
    twitterUsername: vine
      .string()
      .regex(/^\w{1,15}$/)
      .nullable(),
    linkedinUsername: vine
      .string()
      .maxLength(100)
      .regex(/^[\p{L}\p{N}_-]{3,100}$/u)
      .nullable(),
  }),
  {
    'username.regex': 'Lettres minuscules, chiffres, - et _ uniquement (sans espace).',
    'username.notIn': 'Ce nom d’utilisateur est réservé.',
    'username.database.unique': 'Ce nom d’utilisateur est déjà pris.',
    'email.database.unique': 'Cette adresse e-mail est déjà utilisée par un autre compte.',
    'githubUsername.regex': 'Nom d’utilisateur GitHub invalide.',
    'twitterUsername.regex': 'Identifiant X invalide (15 caractères max : lettres, chiffres, _).',
    'linkedinUsername.regex': 'Identifiant LinkedIn invalide (la partie après linkedin.com/in/).',
    'linkedinUsername.maxLength': 'Identifiant LinkedIn trop long.',
    'avatarUrl.url': 'Adresse d’image invalide (elle doit commencer par https://).',
    'portfolioUrl.url': 'Adresse invalide (elle doit commencer par https://).',
    'websiteUrl.url': 'Adresse invalide (elle doit commencer par https://).',
    'availability.enum': 'Choisissez une disponibilité dans la liste.',
    'skills.array': 'Liste de compétences invalide.',
    'skills.array.maxLength': `${MAX_SKILLS} compétences au maximum.`,
    'skills.*.minLength': 'Chaque compétence doit faire au moins 2 caractères.',
    'skills.*.maxLength': 'Chaque compétence doit faire au plus 30 caractères.',
    'skills.*.regex':
      'Compétence invalide : lettres, chiffres, espaces et . # + / & - _ uniquement.',
    'links.array': 'Liste de liens invalide.',
    'links.array.maxLength': `${MAX_LINKS} liens supplémentaires au maximum.`,
    'links.*.label.required': 'Donnez un nom à ce lien (YouTube, Dev.to…).',
    'links.*.label.minLength': 'Le nom du lien doit faire au moins 2 caractères.',
    'links.*.label.maxLength': 'Le nom du lien doit faire au plus 30 caractères.',
    'links.*.url.required': 'Indiquez l’adresse du lien.',
    'links.*.url.url': 'Adresse invalide (elle doit commencer par https://).',
    'links.*.url.maxLength': 'Adresse trop longue (255 caractères maximum).',
  }
)

/**
 * CV upload: a PDF of 5 MB at most. The content is checked separately
 * (PDF signature) by the controller: the extension alone proves nothing.
 */
export const cvUploadValidator = withMessages(
  vine.create({
    cv: vine.file({ size: '5mb', extnames: ['pdf'] }),
  }),
  {
    'cv.required': 'Choisissez un fichier PDF.',
    'cv.file': 'Choisissez un fichier PDF.',
    'cv.file.size': 'Fichier trop volumineux : 5 Mo maximum.',
    'cv.file.extname': 'Seuls les fichiers PDF sont acceptés.',
    'cv.file.fatal': 'Le fichier n’a pas pu être reçu. Réessayez.',
  }
)

export const cvVisibilityValidator = withMessages(
  vine.create({
    visibility: vine.enum(CV_VISIBILITIES),
  }),
  {
    'visibility.required': 'Choisissez qui peut consulter votre CV.',
    'visibility.enum': 'Choisissez qui peut consulter votre CV.',
  }
)

/**
 * Password change. "currentPassword" is checked by the controller when the
 * member already has a password (GitHub-only accounts can set a first one).
 */
export const passwordSettingsValidator = withMessages(
  vine.create({
    currentPassword: vine.string().maxLength(128).optional(),
    password: vine.string().minLength(8).maxLength(128),
    passwordConfirmation: vine.string().sameAs('password'),
  }),
  {
    'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères.',
    'passwordConfirmation.sameAs': 'Les deux mots de passe ne correspondent pas.',
    'passwordConfirmation.required': 'Confirmez le nouveau mot de passe.',
  }
)

/**
 * Account deletion: the member types their username to confirm.
 */
export const deleteAccountValidator = vine.create({
  confirmation: vine.string().trim(),
})
