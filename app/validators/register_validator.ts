import vine from '@vinejs/vine'

/**
 * Usernames that would collide with routes or impersonate the staff.
 */
export const RESERVED_USERNAMES = [
  'admin',
  'administrateur',
  'moderateur',
  'root',
  'api',
  'articles',
  'forum',
  'discussions',
  'membres',
  'login',
  'logout',
  'register',
  'settings',
  'dashboard',
  'javascript',
  'javascriptcm',
  'support',
  'staff',
]

export const usernameRule = () =>
  vine
    .string()
    .trim()
    .toLowerCase()
    .minLength(3)
    .maxLength(30)
    .regex(/^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/)
    .notIn(RESERVED_USERNAMES)

export const registerValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  username: usernameRule().unique({ table: 'users', column: 'username' }),
  email: vine
    .string()
    .trim()
    .toLowerCase()
    .email()
    .maxLength(254)
    .unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(128),
  passwordConfirmation: vine.string().sameAs('password'),
})
