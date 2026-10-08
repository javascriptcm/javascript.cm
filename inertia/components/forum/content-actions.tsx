import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Flag, Lock, LockOpen, Pencil, Pin, PinOff, Settings2, Trash2 } from 'lucide-react'
import { Menu, MenuAction, MenuDivider, MenuLink } from '~/components/ui/menu'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { ReportDialog } from '~/components/reports/report-dialog'

type ReportSubject = { id: number; authorId: number | null }

/**
 * Owner / moderator menu of a thread or a discussion: edit, delete,
 * and for moderators pin + lock toggles. Signed-in members who did not
 * write the content get "Signaler" (a plain button when that is all they
 * can do).
 */
export function ContentActions({
  basePath,
  noun,
  canManage,
  canModerate,
  pinned,
  locked,
  report,
}: {
  basePath: string
  noun: 'question' | 'discussion'
  canManage: boolean
  canModerate: boolean
  pinned: boolean
  locked: boolean
  /** Content to report; defaults to the page's `thread` / `discussion` prop. */
  report?: ReportSubject
}) {
  const { props } = usePage()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reporting, setReporting] = useState(false)

  const subject = report ?? pageSubject(props, noun)
  const canReport = Boolean(props.user && subject && subject.authorId !== props.user.id)

  if (!canManage && !canModerate && !canReport) return null

  const article = noun === 'question' ? 'cette question' : 'cette discussion'
  const reportDialog = subject && canReport && (
    <ReportDialog
      open={reporting}
      onClose={() => setReporting(false)}
      target={noun === 'question' ? 'thread' : 'discussion'}
      id={subject.id}
    />
  )

  if (!canManage && !canModerate) {
    return (
      <>
        <button
          type="button"
          onClick={() => setReporting(true)}
          aria-haspopup="dialog"
          aria-label={`Signaler ${article}`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-sm border border-transparent px-3 text-[14px] font-medium text-muted transition-colors duration-150 hover:border-line-2 hover:text-ink focus-visible:border-ink focus-visible:text-ink focus-visible:shadow-[0_0_0_3px_var(--js)] focus-visible:outline-none active:translate-y-px"
        >
          <Flag size={15} strokeWidth={1.75} aria-hidden="true" />
          <span>Signaler</span>
        </button>
        {reportDialog}
      </>
    )
  }

  function toggle(action: 'pin' | 'lock') {
    router.post(`${basePath}/${action}`, {}, { preserveScroll: true })
  }

  function destroy() {
    setDeleting(true)
    router.delete(basePath, {
      onFinish: () => {
        setDeleting(false)
        setConfirming(false)
      },
    })
  }

  return (
    <>
      <Menu
        buttonLabel={`Gérer ${article}`}
        buttonClassName="inline-flex h-9 items-center gap-2 rounded-sm border border-line-2 px-3 text-[14px] font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink data-open:border-ink data-open:bg-ink data-open:text-paper"
        button={
          <>
            <Settings2 size={15} strokeWidth={1.75} aria-hidden="true" />
            <span>Gérer</span>
          </>
        }
      >
        {canManage && (
          <MenuLink href={`${basePath}/modifier`} icon={<Pencil size={15} strokeWidth={1.75} />}>
            Modifier
          </MenuLink>
        )}
        {canModerate && (
          <>
            {canManage && <MenuDivider />}
            <MenuAction
              onClick={() => toggle('pin')}
              icon={
                pinned ? (
                  <PinOff size={15} strokeWidth={1.75} />
                ) : (
                  <Pin size={15} strokeWidth={1.75} />
                )
              }
            >
              {pinned ? 'Désépingler' : 'Épingler en tête de liste'}
            </MenuAction>
            <MenuAction
              onClick={() => toggle('lock')}
              icon={
                locked ? (
                  <LockOpen size={15} strokeWidth={1.75} />
                ) : (
                  <Lock size={15} strokeWidth={1.75} />
                )
              }
            >
              {locked ? 'Déverrouiller les réponses' : 'Verrouiller les réponses'}
            </MenuAction>
          </>
        )}
        {canReport && (
          <>
            <MenuDivider />
            <MenuAction
              onClick={() => setReporting(true)}
              icon={<Flag size={15} strokeWidth={1.75} />}
            >
              Signaler {article}
            </MenuAction>
          </>
        )}
        {canManage && (
          <>
            <MenuDivider />
            <MenuAction
              onClick={() => setConfirming(true)}
              icon={<Trash2 size={15} strokeWidth={1.75} />}
              danger
            >
              Supprimer
            </MenuAction>
          </>
        )}
      </Menu>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={destroy}
        processing={deleting}
        title={`Supprimer ${article} ?`}
        description={
          noun === 'question'
            ? 'La question et toutes ses réponses disparaîtront définitivement, solution comprise.'
            : 'La discussion et toutes ses réponses disparaîtront définitivement.'
        }
      />
      {reportDialog}
    </>
  )
}

/**
 * The thread / discussion of the current page (forum/show, discussions/show).
 */
function pageSubject(props: object, noun: 'question' | 'discussion'): ReportSubject | null {
  const content = (props as Record<string, unknown>)[noun === 'question' ? 'thread' : 'discussion']
  if (!content || typeof content !== 'object' || !('id' in content)) return null
  const { id, author } = content as { id: number; author?: { id: number } | null }
  return { id, authorId: author?.id ?? null }
}
