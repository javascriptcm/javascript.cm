import { Link } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { cn } from '~/lib/format'

/**
 * Overlapping avatars, like voices around a table.
 */
export function AvatarStack({
  users,
  size = 'xs',
  linked = false,
  className,
}: {
  users: Data.User[]
  size?: 'xs' | 'sm' | 'md'
  linked?: boolean
  className?: string
}) {
  if (!users.length) return null
  return (
    <ul
      className={cn('flex items-center', size === 'md' ? '-space-x-2' : '-space-x-1.5', className)}
    >
      {users.map((user) => (
        <li key={user.id} className="rounded-sm ring-2 ring-paper">
          {linked ? (
            <Link
              href={`/@${user.username}`}
              title={user.displayName}
              aria-label={user.displayName}
              className="relative block rounded-sm transition-transform duration-300 ease-out-expo hover:z-10 hover:-translate-y-0.5 focus-visible:z-10"
            >
              <Avatar user={user} size={size} />
            </Link>
          ) : (
            <span title={user.displayName}>
              <Avatar user={user} size={size} />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * "Avec Awa, Junior et 3 autres" — the people in the conversation.
 */
export function participantsSentence(users: Data.User[], total: number) {
  const names = users.slice(0, 2).map((u) => u.displayName)
  const rest = total - names.length
  if (names.length === 0) return ''
  if (rest <= 0) return names.length === 2 ? `${names[0]} et ${names[1]}` : names[0]
  return `${names.join(', ')} et ${rest} autre${rest > 1 ? 's' : ''}`
}
