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
