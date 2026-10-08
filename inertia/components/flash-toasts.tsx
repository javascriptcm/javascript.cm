import { useEffect, useRef } from 'react'
import { toast, Toaster } from 'sonner'
import { router, usePage } from '@inertiajs/react'
import { CircleAlert, CircleCheck } from 'lucide-react'

let sequence = 0

export default function FlashToasts() {
  const { flash } = usePage()
  // Toasts shown for previous pages: dismissed when the next visit starts.
  // Each flash gets its own id, so a fresh one is never removed along with
  // the toast it replaces.
  const shown = useRef<(string | number)[]>([])

  useEffect(() => {
    return router.on('start', () => {
      for (const id of shown.current) toast.dismiss(id)
      shown.current = []
    })
  }, [])

  useEffect(() => {
    if (flash?.error) shown.current.push(toast.error(flash.error, { id: `flash-${++sequence}` }))
    if (flash?.success) {
      shown.current.push(toast.success(flash.success, { id: `flash-${++sequence}` }))
    }
  }, [flash])

  return (
    <Toaster
      position="bottom-left"
      toastOptions={{ unstyled: true }}
      icons={{
        success: <CircleCheck size={18} strokeWidth={1.8} />,
        error: <CircleAlert size={18} strokeWidth={1.8} />,
      }}
    />
  )
}
