import vine from '@vinejs/vine'

export const replyValidator = vine.create({
  body: vine.string().trim().minLength(2).maxLength(20_000),
})
