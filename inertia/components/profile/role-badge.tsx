import { cn } from '~/lib/format'

/**
 * Staff badge: "Admin" (JS-yellow block) or "Modérateur" (ink outline).
 * Renders nothing for regular members.
 */
export function RoleBadge({ role, className }: { role: string; className?: string }) {
  if (role !== 'admin' && role !== 'moderator') return null
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center rounded-xs border border-ink px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] uppercase',
        role === 'admin' ? 'bg-js text-js-ink' : 'text-ink',
        className
      )}
    >
      {role === 'admin' ? 'Admin' : 'Modérateur'}
    </span>
  )
}
