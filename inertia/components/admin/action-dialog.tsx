import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/format'

/**
 * Confirmation for reversible moderation actions (suspend / reactivate).
 * Same look as ConfirmDialog, without the "irreversible" warning, and with
 * a neutral tone for constructive actions.
 */
export function ActionDialog({
  open,
  onClose,
  onConfirm,
  kicker,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  processing = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  kicker: string
  title: ReactNode
  description?: ReactNode
  confirmLabel: string
  tone?: 'danger' | 'neutral'
  processing?: boolean
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPanel className="w-full max-w-md rounded-sm border border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)]">
          <p className={cn('label', tone === 'danger' ? 'text-danger' : 'text-ink')}>{kicker}</p>
          <DialogTitle className="mt-3 text-[22px] leading-tight font-semibold tracking-[-0.02em] break-words">
            {title}
          </DialogTitle>
          {description && (
            <Description className="mt-2 text-[15px] text-ink-2">{description}</Description>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={processing}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
