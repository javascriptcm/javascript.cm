import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { renderMarkdown } from '#services/markdown'

const previewValidator = vine.create({
  body: vine.string().maxLength(60_000),
})

export default class MarkdownController {
  async preview({ request }: HttpContext) {
    const { body } = await request.validateUsing(previewValidator)
    return { html: await renderMarkdown(body) }
  }
}
