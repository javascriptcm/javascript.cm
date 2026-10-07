import vine from '@vinejs/vine'

/**
 * Login with e-mail or username.
 */
export const loginValidator = vine.create({
  login: vine.string().trim().minLength(2).maxLength(254),
  password: vine.string().minLength(1).maxLength(128),
  remember: vine.boolean().optional(),
})
