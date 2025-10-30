import Message from '#models/message'
import { getIO } from '#start/socket'
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
  async store({ request, auth, response }: HttpContext) {
    const { discussionId, type, content, fileUrl, tempId } = request.only([
      'discussionId',
      'type',
      'content',
      'fileUrl',
      'tempId',
    ])
    // fileUrl est fourni par le frontend après upload via presigned URL
    const message = await Message.create({
      discussionId,
      senderId: auth.user!.id,
      type,
      content,
      fileUrl: fileUrl || null,
      status: 'normal',
      history: [],
    })
    await message.load('sender')
    const sender = message.sender?.toJSON()
    const messageWithTempId = { ...message.toJSON(), tempId, sender }
    getIO()?.to(`discussion:${discussionId}`).emit('message:new', messageWithTempId)
    return response.ok(messageWithTempId)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const message = await Message.findOrFail(params.id)
    if (message.senderId !== auth.user!.id) {
      return response.unauthorized('Non autorisé')
    }
    // Historique
    const oldVersion = {
      content: message.content,
      fileUrl: message.fileUrl,
      updatedAt: message.updatedAt,
    }
    const history = message.history || []
    history.push(oldVersion)
    message.merge({
      content: request.input('content'),
      status: 'edited',
      history,
    })
    await message.save()
    // Émettre l'événement socket.io
    getIO()?.to(`discussion:${message.discussionId}`).emit('message:edit', message)
    return response.ok(message)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const message = await Message.findOrFail(params.id)
    // Suppression par sender ou admin (à vérifier dans la logique réelle)
    if (message.senderId === auth.user!.id) {
      message.status = 'deleted'
      message.deletedBy = 'sender'
    } else if (auth.user!.role === 'ADMIN') {
      message.status = 'deleted'
      message.deletedBy = 'admin'
    } else {
      return response.unauthorized('Non autorisé')
    }
    await message.save()
    // Émettre l'événement socket.io
    getIO()?.to(`discussion:${message.discussionId}`).emit('message:delete', message)
    return response.ok(message)
  }

  // Endpoint pour l'historique d'un message (admin)
  async history({ params, auth, response }: HttpContext) {
    if (auth.user?.role !== 'ADMIN') {
      return response.unauthorized('Réservé admin')
    }
    const message = await Message.findOrFail(params.id)
    return response.ok({ history: message.history || [] })
  }
}
