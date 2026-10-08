import type { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import ChannelTransformer from '#transformers/channel_transformer'
import { channelValidator } from '#validators/admin_validator'
import { uniqueSlug } from '#services/slug'

export default class AdminChannelsController {
  /**
   * GET /admin/canaux
   */
  async index({ inertia }: HttpContext) {
    const channels = await Channel.query()
      .withCount('threads')
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')

    return inertia.render('admin/channels', {
      // ChannelTransformer has no "position": extend its public shape.
      channels: channels.map((channel) => ({
        ...new ChannelTransformer(channel).toObject(),
        position: channel.position,
      })),
      nextPosition: channels.reduce((max, channel) => Math.max(max, channel.position), 0) + 1,
    })
  }

  /**
   * POST /admin/canaux
   */
  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(channelValidator, { meta: {} })
    const channel = await Channel.create({
      name: data.name,
      slug: data.slug ?? (await uniqueSlug('channels', data.name)),
      description: data.description,
      position: data.position,
    })
    session.flash('success', `Canal « ${channel.name} » créé.`)
    return response.redirect().toPath('/admin/canaux')
  }

  /**
   * PUT /admin/canaux/:id
   */
  async update({ params, request, response, session }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)
    const data = await request.validateUsing(channelValidator, { meta: { id: channel.id } })
    channel.merge({
      name: data.name,
      slug: data.slug ?? channel.slug,
      description: data.description,
      position: data.position,
    })
    await channel.save()
    session.flash('success', `Canal « ${channel.name} » mis à jour.`)
    return response.redirect().toPath('/admin/canaux')
  }

  /**
   * DELETE /admin/canaux/:id — refused while questions live in the channel
   * (the foreign key would delete them with it).
   */
  async destroy({ params, response, session }: HttpContext) {
    const channel = await Channel.query().where('id', params.id).withCount('threads').firstOrFail()
    const threads = Number(channel.$extras.threads_count ?? 0)
    if (threads > 0) {
      session.flash(
        'error',
        `Le canal « ${channel.name} » contient ${threads} question${threads > 1 ? 's' : ''} : déplacez-les avant de le supprimer.`
      )
      return response.redirect().toPath('/admin/canaux')
    }
    await channel.delete()
    session.flash('success', `Canal « ${channel.name} » supprimé.`)
    return response.redirect().toPath('/admin/canaux')
  }
}
