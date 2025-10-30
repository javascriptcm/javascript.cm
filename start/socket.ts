import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server as IOServer } from 'socket.io'

let io: IOServer | null = null

function setupSocket() {
  io = new IOServer(server.getNodeServer(), {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  io.use(async (socket, next) => {
    // Auth de base (à améliorer selon besoin)
    const userId = socket.handshake.auth?.userId
    if (!userId) return next(new Error('Unauthorized'))
    socket.data.userId = userId
    next()
  })

  io.on('connection', (socket) => {
    // Join room par discussion
    socket.on('join', (discussionId: number) => {
      socket.join(`discussion:${discussionId}`)
    })
    socket.on('leave', (discussionId: number) => {
      socket.leave(`discussion:${discussionId}`)
    })

    // Message events
    socket.on('message:send', (payload) => {
      io?.to(`discussion:${payload.discussionId}`).emit('message:new', payload)
    })
    socket.on('message:edit', (payload) => {
      io?.to(`discussion:${payload.discussionId}`).emit('message:edit', payload)
    })
    socket.on('message:delete', (payload) => {
      io?.to(`discussion:${payload.discussionId}`).emit('message:delete', payload)
    })
  })
}

export function getIO() {
  return io
}

app.ready(() => {
  if (!io) setupSocket()
})
