import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(userId: number | string) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return
    // Connexion socket.io avec auth userId
    const socket = io('/', {
      auth: { userId },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket.io connecté !', socket.id)
    })
    socket.on('connect_error', (err) => {
      console.error('Erreur de connexion Socket.io', err)
    })

    return () => {
      socket.disconnect()
    }
  }, [userId])

  function joinDiscussion(discussionId: number) {
    socketRef.current?.emit('join', discussionId)
  }
  function leaveDiscussion(discussionId: number) {
    socketRef.current?.emit('leave', discussionId)
  }
  function sendMessage(event: string, payload: any) {
    socketRef.current?.emit(event, payload)
  }
  function on(event: string, cb: (...args: any[]) => void) {
    socketRef.current?.on(event, cb)
  }
  function off(event: string, cb?: (...args: any[]) => void) {
    socketRef.current?.off(event, cb)
  }

  return {
    socket: socketRef.current,
    joinDiscussion,
    leaveDiscussion,
    sendMessage,
    on,
    off,
  }
}
