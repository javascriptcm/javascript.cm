import vine from '@vinejs/vine'

/**
 * Create / edit a discussion. Up to three tags (ids), all existing.
 */
export const discussionValidator = vine.create({
  title: vine.string().trim().minLength(10).maxLength(160),
  body: vine.string().trim().minLength(20).maxLength(40_000),
  tags: vine
    .array(vine.number().withoutDecimals().exists({ table: 'tags', column: 'id' }))
    .maxLength(3)
    .distinct()
    .optional(),
})
