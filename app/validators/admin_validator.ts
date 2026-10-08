import vine from '@vinejs/vine'
import { withMessages } from '#validators/settings_validator'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const slugMessages = {
  'slug.regex': 'Lettres minuscules, chiffres et tirets uniquement (ex. : react-native).',
  'slug.database.unique': 'Ce slug est déjà utilisé.',
}

/**
 * Tag create / update. The slug is generated from the name when left blank.
 */
export const tagValidator = withMessages(
  vine.withMetaData<{ id?: number }>().create({
    name: vine.string().trim().minLength(2).maxLength(40),
    slug: vine
      .string()
      .trim()
      .toLowerCase()
      .maxLength(50)
      .regex(SLUG)
      .unique({
        table: 'tags',
        column: 'slug',
        filter: (db, _value, field) => {
          if (field.meta.id) db.whereNot('id', field.meta.id)
        },
      })
      .nullable(),
    description: vine.string().trim().maxLength(255).nullable(),
  }),
  slugMessages
)

/**
 * Forum channel create / update.
 */
export const channelValidator = withMessages(
  vine.withMetaData<{ id?: number }>().create({
    name: vine.string().trim().minLength(2).maxLength(60),
    slug: vine
      .string()
      .trim()
      .toLowerCase()
      .maxLength(70)
      .regex(SLUG)
      .unique({
        table: 'channels',
        column: 'slug',
        filter: (db, _value, field) => {
          if (field.meta.id) db.whereNot('id', field.meta.id)
        },
      })
      .nullable(),
    description: vine.string().trim().maxLength(255).nullable(),
    position: vine.number().withoutDecimals().min(0).max(999),
  }),
  {
    ...slugMessages,
    'position.withoutDecimals': 'Un nombre entier, s’il vous plaît.',
    'position.min': 'La position est un nombre entre 0 et 999.',
    'position.max': 'La position est un nombre entre 0 et 999.',
  }
)

/**
 * Role change (admins only).
 */
export const roleValidator = vine.create({
  role: vine.enum(['member', 'moderator', 'admin'] as const),
})
