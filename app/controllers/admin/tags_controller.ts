import type { HttpContext } from '@adonisjs/core/http'
import Tag from '#models/tag'
import TagTransformer from '#transformers/tag_transformer'
import { tagValidator } from '#validators/admin_validator'
import { uniqueSlug } from '#services/slug'

export default class AdminTagsController {
  /**
   * GET /admin/tags
   */
  async index({ inertia }: HttpContext) {
    const tags = await Tag.query().withCount('articles').withCount('discussions')
    // French alphabetical order ("Événements" next to "DevOps", not after "Vue").
    tags.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))

    return inertia.render('admin/tags', {
      tags: TagTransformer.transform(tags),
    })
  }

  /**
   * POST /admin/tags
   */
  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(tagValidator, { meta: {} })
    const tag = await Tag.create({
      name: data.name,
      slug: data.slug ?? (await uniqueSlug('tags', data.name)),
      description: data.description,
    })
    session.flash('success', `Tag « ${tag.name} » créé.`)
    return response.redirect().toPath('/admin/tags')
  }

  /**
   * PUT /admin/tags/:id — the slug only changes when edited explicitly
   * (it appears in public URLs such as /articles?tag=…).
   */
  async update({ params, request, response, session }: HttpContext) {
    const tag = await Tag.findOrFail(params.id)
    const data = await request.validateUsing(tagValidator, { meta: { id: tag.id } })
    tag.merge({
      name: data.name,
      slug: data.slug ?? tag.slug,
      description: data.description,
    })
    await tag.save()
    session.flash('success', `Tag « ${tag.name} » mis à jour.`)
    return response.redirect().toPath('/admin/tags')
  }

  /**
   * DELETE /admin/tags/:id — content keeps existing, only the label goes.
   */
  async destroy({ params, response, session }: HttpContext) {
    const tag = await Tag.findOrFail(params.id)
    await tag.delete()
    session.flash('success', `Tag « ${tag.name} » supprimé.`)
    return response.redirect().toPath('/admin/tags')
  }
}
