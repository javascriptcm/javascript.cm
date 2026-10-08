import vine from '@vinejs/vine'

/**
 * Create / edit a forum question.
 */
export const threadValidator = vine.create({
  title: vine.string().trim().minLength(15).maxLength(160),
  channelId: vine.number().withoutDecimals().exists({ table: 'channels', column: 'id' }),
  body: vine.string().trim().minLength(30).maxLength(40_000),
})

/**
 * Accept a reply as the solution of a thread.
 */
export const solutionValidator = vine.create({
  replyId: vine.number().withoutDecimals().positive(),
})
