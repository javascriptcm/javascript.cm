import { ARTICLE_STATUS_LIST } from '#enums/article_status'
import vine from '@vinejs/vine'

export const articleValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(10).maxLength(255),
    content: vine.string().minLength(100),
    excerpt: vine.string().minLength(50).maxLength(160),
    coverImage: vine.string().optional().nullable(),
    canonicalUrl: vine.string().optional().nullable(),
    tags: vine.array(vine.string()).optional(),
    status: vine.enum(ARTICLE_STATUS_LIST),
  })
)
