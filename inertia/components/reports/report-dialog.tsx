import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { useForm } from '@inertiajs/react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Flag } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/field'
import { cn } from '~/lib/format'

export type ReportTargetType = 'article' | 'thread' | 'discussion' | 'reply'
export type ReportReason = 'spam' | 'abuse' | 'off_topic' | 'other'

export const REPORT_REASONS: { value: ReportReason; label: string; hint: string }[] = [
  {
    value: 'spam',
    label: 'Spam ou publicité',
    hint: 'Promotion non sollicitée, liens douteux, messages répétés.',
  },
  {
    value: 'abuse',
    label: 'Contenu offensant ou harcèlement',
    hint: 'Insultes, propos discriminatoires, attaques personnelles.',
  },
  {
    value: 'off_topic',
    label: 'Hors sujet',
    hint: 'Sans rapport avec la conversation ou avec la communauté.',
  },
  {
    value: 'other',
    label: 'Autre',
    hint: 'Un autre problème : décrivez-le en quelques mots ci-dessous.',
  },
]

export const REPORT_REASON_LABELS = Object.fromEntries(
  REPORT_REASONS.map((reason) => [reason.value, reason.label])
) as Record<ReportReason, string>

const NOUNS: Record<ReportTargetType, string> = {
  article: 'cet article',
  thread: 'cette question',
  discussion: 'cette discussion',
  reply: 'cette réponse',
}

const MAX_DETAILS = 500

type ReportForm = {
  target: ReportTargetType
  id: number
  reason: ReportReason | ''
  details: string
}

/**
 * "Signaler": pick a reason, add details (required for "Autre"), send it
 * to the moderators. Same look as ConfirmDialog (ink border, hard shadow).
 */
export function ReportDialog({
  open,
  onClose,
  target,
  id,
  noun,
}: {
  open: boolean
  onClose: () => void
  target: ReportTargetType
  id: number
  /** "ce commentaire"… defaults to the target's noun ("cette réponse"). */
  noun?: string
}) {
  const uid = useId()
  const form = useForm<ReportForm>({ target, id, reason: '', details: '' })
  const firstReason = useRef<HTMLInputElement>(null)
  const detailsRef = useRef<HTMLTextAreaElement>(null)
  const detailsRequired = form.data.reason === 'other'
  const ids = {
    legend: `${uid}-reasons`,
    reasonError: `${uid}-reason-error`,
    details: `${uid}-details`,
    detailsHelp: `${uid}-details-help`,
  }

  function close() {
    if (form.processing) return
    onClose()
    form.reset()
    form.clearErrors()
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    form.clearErrors()
    if (!form.data.reason) {
      form.setError('reason', 'Choisissez un motif.')
      firstReason.current?.focus()
      return
    }
    if (detailsRequired && form.data.details.trim().length < 3) {
      form.setError('details', 'Précisez en quelques mots ce qui pose problème.')
      detailsRef.current?.focus()
      return
    }
    // Always the current target, even if the dialog outlives a prop change.
    form.transform((data) => ({ ...data, target, id }))
    form.post('/signalements', {
      preserveScroll: true,
      onSuccess: () => {
        onClose()
        form.reset()
      },
    })
  }

  const generalError = form.errors.target ?? form.errors.id

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="grid min-h-full place-items-center p-4">
          <DialogPanel className="w-full max-w-lg rounded-sm border border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-7">
            <p className="label inline-flex items-center gap-1.5 text-ink">
              <Flag size={12} strokeWidth={1.75} aria-hidden="true" />
              Signalement
            </p>
            <DialogTitle className="mt-3 text-[22px] leading-tight font-semibold tracking-[-0.02em]">
              Signaler {noun ?? NOUNS[target]}
            </DialogTitle>
            <Description className="mt-2 text-[15px] text-ink-2">
              L’équipe de modération examinera votre signalement. L’auteur ne saura pas qui l’a
              envoyé.
            </Description>

            <form onSubmit={submit} noValidate className="mt-6">
              <fieldset
                aria-describedby={form.errors.reason ? ids.reasonError : undefined}
                aria-invalid={form.errors.reason ? true : undefined}
              >
                <legend id={ids.legend} className="label text-ink-2">
                  Motif
                </legend>
                <div className="mt-2.5 grid gap-2">
                  {REPORT_REASONS.map((reason, index) => {
                    const checked = form.data.reason === reason.value
                    const inputId = `${uid}-reason-${reason.value}`
                    return (
                      <label
                        key={reason.value}
                        htmlFor={inputId}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-sm border px-3.5 py-3 transition-[border-color,background-color,box-shadow] duration-150 has-[input:focus-visible]:shadow-[0_0_0_3px_var(--js)]',
                          checked
                            ? 'border-ink bg-paper-2'
                            : 'border-line-2 hover:border-ink hover:bg-paper-2/60'
                        )}
                      >
                        <input
                          ref={index === 0 ? firstReason : undefined}
                          id={inputId}
                          type="radio"
                          name={`${uid}-reason`}
                          value={reason.value}
                          checked={checked}
                          onChange={() => {
                            form.setData('reason', reason.value)
                            form.clearErrors('reason', 'details')
                          }}
                          aria-describedby={`${inputId}-hint`}
                          className="mt-[3px] size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-line-2 bg-card transition-[background-color,border-color,box-shadow] duration-150 checked:border-ink checked:bg-ink checked:shadow-[inset_0_0_0_3px_var(--card)] focus-visible:outline-none"
                        />
                        <span className="min-w-0">
                          <span className="block text-[15px] leading-snug font-semibold text-ink">
                            {reason.label}
                          </span>
                          <span
                            id={`${inputId}-hint`}
                            className="mt-0.5 block text-[13.5px] leading-snug text-muted"
                          >
                            {reason.hint}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {form.errors.reason && (
                  <p
                    id={ids.reasonError}
                    role="alert"
                    className="mt-2 text-[13.5px] font-medium text-danger"
                  >
                    {form.errors.reason}
                  </p>
                )}
              </fieldset>

              <div className="mt-5 flex flex-col gap-2">
                <label
                  htmlFor={ids.details}
                  className="label flex items-baseline justify-between text-ink-2"
                >
                  <span>Précisions</span>
                  <span
                    className={cn(
                      'tracking-normal normal-case',
                      detailsRequired ? 'text-ink' : 'text-muted'
                    )}
                  >
                    {detailsRequired ? 'obligatoire' : 'facultatif'}
                  </span>
                </label>
                <Textarea
                  ref={detailsRef}
                  id={ids.details}
                  value={form.data.details}
                  onChange={(event) => form.setData('details', event.target.value)}
                  maxLength={MAX_DETAILS}
                  rows={3}
                  required={detailsRequired}
                  invalid={Boolean(form.errors.details)}
                  aria-describedby={ids.detailsHelp}
                  placeholder={
                    detailsRequired
                      ? 'Qu’est-ce qui pose problème ?'
                      : 'Un lien, un contexte, ce qui vous a alerté…'
                  }
                  className="min-h-24"
                />
                <div
                  id={ids.detailsHelp}
                  className="flex items-start justify-between gap-4 text-[13.5px]"
                >
                  {form.errors.details ? (
                    <p role="alert" className="font-medium text-danger">
                      {form.errors.details}
                    </p>
                  ) : (
                    <p className="text-muted">Visible uniquement par l’équipe de modération.</p>
                  )}
                  <span
                    className={cn(
                      'shrink-0 font-mono text-[12px] tabular-nums',
                      form.data.details.length >= MAX_DETAILS ? 'text-danger' : 'text-muted'
                    )}
                    aria-hidden="true"
                  >
                    {form.data.details.length}/{MAX_DETAILS}
                  </span>
                </div>
              </div>

              {generalError && (
                <p role="alert" className="mt-4 text-[13.5px] font-medium text-danger">
                  Ce contenu ne peut pas être signalé.
                </p>
              )}

              <div className="mt-7 flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={close} disabled={form.processing}>
                  Annuler
                </Button>
                <Button type="submit" loading={form.processing}>
                  {form.processing ? 'Envoi…' : 'Envoyer le signalement'}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

/**
 * Discreet "Signaler" text button that opens the dialog (article pages).
 */
export function ReportButton({
  target,
  id,
  noun,
  label = 'Signaler',
  className,
}: {
  target: ReportTargetType
  id: number
  noun?: string
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          'label group inline-flex items-center gap-1.5 rounded-xs text-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink focus-visible:shadow-[0_0_0_3px_var(--js)] focus-visible:outline-none',
          className
        )}
      >
        <Flag size={12} strokeWidth={1.75} aria-hidden="true" />
        <span className="underline-offset-4 group-hover:underline">{label}</span>
      </button>
      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        target={target}
        id={id}
        noun={noun}
      />
    </>
  )
}
