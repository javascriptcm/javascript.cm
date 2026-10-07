import { useState, type ReactNode } from 'react'
import { Link, router, useForm, usePage } from '@inertiajs/react'
import { Heart, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { Prose } from '~/components/ui/prose'
import { TimeAgo } from '~/components/ui/time-ago'
import { Button } from '~/components/ui/button'
import { MarkdownEditor } from '~/components/ui/markdown-editor'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { Menu, MenuAction } from '~/components/ui/menu'
import { cn } from '~/lib/format'

type Reply = Data.Reply

/**
 * One reply: author column, rendered body, like / edit / delete.
 * `badge` and `actions` let parents add context (e.g. forum "Solution").
 */
export function ReplyItem({
  reply,
  badge,
  actions,
  highlighted = false,
  opAuthorId,
}: {
  reply: Reply
  badge?: ReactNode
  actions?: ReactNode
  highlighted?: boolean
  opAuthorId?: number
}) {
  const { user } = usePage().props
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const form = useForm({ body: reply.body })
  const canManage = Boolean(
    user && reply.author && (user.id === reply.author.id || user.isModerator)
  )
  const isMine = Boolean(user && reply.author && user.id === reply.author.id)

  function save() {
    form.put(`/replies/${reply.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) })
  }

  function destroy() {
    setDeleting(true)
    router.delete(`/replies/${reply.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setDeleting(false)
        setConfirming(false)
      },
    })
  }

  function toggleLike() {
    if (!user)
      return router.visit(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    router.post(`/replies/${reply.id}/like`, {}, { preserveScroll: true, preserveState: true })
  }

  return (
    <article
      id={`reponse-${reply.id}`}
      className={cn(
        'grid scroll-mt-28 grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-line py-7 sm:gap-x-5',
        highlighted && 'border-t-2 border-t-ok'
      )}
    >
      {reply.author ? (
        <Link href={`/@${reply.author.username}`} aria-label={reply.author.displayName}>
          <Avatar user={reply.author} size="md" />
        </Link>
      ) : (
        <span />
      )}
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px]">
          {reply.author && (
            <Link
              href={`/@${reply.author.username}`}
              className="font-semibold text-ink hover:underline"
            >
              {reply.author.displayName}
            </Link>
          )}
          {reply.author && opAuthorId === reply.author.id && (
            <span className="label rounded-xs border border-line-2 px-1.5 py-0.5 text-[10px]">
              Auteur
            </span>
          )}
          <span className="text-muted" aria-hidden="true">
            ·
          </span>
          <a href={`#reponse-${reply.id}`} className="text-muted hover:text-ink">
            <TimeAgo date={reply.createdAt} />
          </a>
          {badge}
          {canManage && !editing && (
            <div className="ml-auto">
              <Menu
                buttonLabel="Actions sur la réponse"
                buttonClassName="grid size-8 place-items-center rounded-sm text-muted hover:bg-paper-2 hover:text-ink"
                button={<MoreHorizontal size={17} />}
              >
                <MenuAction onClick={() => setEditing(true)} icon={<Pencil size={15} />}>
                  Modifier
                </MenuAction>
                <MenuAction onClick={() => setConfirming(true)} icon={<Trash2 size={15} />} danger>
                  Supprimer
                </MenuAction>
              </Menu>
            </div>
          )}
        </header>

        {editing ? (
          <div className="mt-4">
            <MarkdownEditor
              id={`edit-reply-${reply.id}`}
              value={form.data.body}
              onChange={(v) => form.setData('body', v)}
              onSubmit={save}
              error={form.errors.body}
              compact
              rows={6}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={save} loading={form.processing}>
                Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <Prose html={reply.bodyHtml} size="sm" className="mt-3" />
        )}

        <footer className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleLike}
            disabled={isMine}
            aria-pressed={reply.likedByMe}
            title={
              isMine ? 'Vous ne pouvez pas aimer votre propre réponse' : 'Cette réponse m’a aidé'
            }
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[12.5px] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              reply.likedByMe
                ? 'border-ink bg-js text-js-ink'
                : 'border-line-2 text-ink-2 hover:border-ink hover:text-ink'
            )}
          >
            <Heart size={13} fill={reply.likedByMe ? 'currentColor' : 'none'} />
            {reply.likesCount}
          </button>
          {actions}
        </footer>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={destroy}
        processing={deleting}
        title="Supprimer cette réponse ?"
        description="Elle disparaîtra définitivement de la conversation."
      />
    </article>
  )
}

export function ReplyList({
  replies,
  renderBadge,
  renderActions,
  highlightedId,
  opAuthorId,
}: {
  replies: Reply[]
  renderBadge?: (reply: Reply) => ReactNode
  renderActions?: (reply: Reply) => ReactNode
  highlightedId?: number | null
  opAuthorId?: number
}) {
  return (
    <div>
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          badge={renderBadge?.(reply)}
          actions={renderActions?.(reply)}
          highlighted={highlightedId === reply.id}
          opAuthorId={opAuthorId}
        />
      ))}
    </div>
  )
}
