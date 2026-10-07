import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Lock, LockOpen, Pencil, Pin, PinOff, Settings2, Trash2 } from 'lucide-react'
import { Menu, MenuAction, MenuDivider, MenuLink } from '~/components/ui/menu'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'

/**
 * Owner / moderator menu of a thread or a discussion: edit, delete,
 * and for moderators pin + lock toggles.
 */
export function ContentActions({
  basePath,
  noun,
  canManage,
  canModerate,
  pinned,
  locked,
}: {
  basePath: string
  noun: 'question' | 'discussion'
  canManage: boolean
  canModerate: boolean
  pinned: boolean
  locked: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!canManage && !canModerate) return null

  const article = noun === 'question' ? 'cette question' : 'cette discussion'

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
    </>
  )
}
