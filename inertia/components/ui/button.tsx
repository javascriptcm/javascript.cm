import { Link, type InertiaLinkProps } from '@inertiajs/react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '~/lib/format'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm border font-medium tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,translate] duration-200 ease-out-expo disabled:pointer-events-none disabled:opacity-45 active:translate-y-px'

const variants: Record<ButtonVariant, string> = {
  // Signature: ink block that turns JS-yellow and lifts on a hard shadow.
  primary:
    'border-ink bg-ink text-paper hover:-translate-y-0.5 hover:bg-js hover:text-js-ink hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-none',
  secondary: 'border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
  ghost: 'border-transparent bg-transparent text-ink-2 hover:bg-paper-2 hover:text-ink',
  danger: 'border-danger bg-transparent text-danger hover:bg-danger hover:text-paper',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[14px]',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-14 px-7 text-[17px]',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  className?: string
} = {}) {
  return cn(base, variants[variant], sizes[size], block && 'w-full', className)
}

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonComponent(
  { variant, size, block, loading, className, children, disabled, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  )
})

type ButtonLinkProps = Omit<InertiaLinkProps, 'size'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  children: ReactNode
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, block, className })} {...props}>
      {children}
    </Link>
  )
}
