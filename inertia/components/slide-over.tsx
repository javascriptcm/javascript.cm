import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Right-hand panel (e.g. filters on mobile).
 */
export default function SlideOver({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <DialogPanel
          transition
          className="flex w-screen max-w-sm flex-col border-l border-ink bg-paper transition duration-300 ease-out-expo data-closed:translate-x-full"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <DialogTitle className="label text-ink">{title}</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="grid size-9 place-items-center rounded-sm text-muted hover:bg-paper-2 hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
