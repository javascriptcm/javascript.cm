import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'

/**
 * Confirmation dialog for destructive actions (never use window.confirm).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Supprimer',
  processing = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  processing?: boolean
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPanel className="w-full max-w-md rounded-sm border border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)]">
          <p className="label text-danger">Action irréversible</p>
          <DialogTitle className="mt-3 text-[22px] font-semibold leading-tight tracking-[-0.02em]">{title}</DialogTitle>
          {description && <Description className="mt-2 text-[15px] text-ink-2">{description}</Description>}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="danger" onClick={onConfirm} loading={processing}>
              {confirmLabel}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
