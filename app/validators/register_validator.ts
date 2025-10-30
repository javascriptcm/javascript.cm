import vine from '@vinejs/vine'
import { ROLES_LIST } from '#enums/role'

/**
 * Validates the register action
 */
export const registerValidator = vine.compile(
  vine.object({
    username: vine.string(),
    name: vine.string(),
    email: vine.string().email(),
    password: vine.string().minLength(6),
    role: vine.enum(ROLES_LIST).optional(),
  })
)
