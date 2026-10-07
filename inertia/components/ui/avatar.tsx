import { cn } from '~/lib/format'

type AvatarUser = {
  displayName: string
  initials: string
  avatarUrl: string | null
}

const sizes = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-[11.5px]',
  md: 'size-10 text-[13px]',
  lg: 'size-14 text-[17px]',
  xl: 'size-24 text-[28px]',
  '2xl': 'size-32 text-[38px]',
}

/**
 * Square avatar (ID-photo framing, consistent with the near-sharp system).
 * Falls back to initials on paper.
 */
export function Avatar({
  user,
  size = 'md',
  className,
}: {
  user: AvatarUser
  size?: keyof typeof sizes
  className?: string
}) {
  const box = cn(
    'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-paper-2 font-mono font-semibold text-ink-2',
    sizes[size],
    className
  )

  if (user.avatarUrl) {
    return (
      <span className={box}>
        <img
          src={user.avatarUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover grayscale-[15%]"
        />
      </span>
    )
  }

  return (
    <span className={box} aria-hidden="true">
      {user.initials}
    </span>
  )
}
