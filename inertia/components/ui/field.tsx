import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '~/lib/format'

const control =
  'w-full rounded-sm border border-line-2 bg-card text-[15px] text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[0_0_0_3px_var(--js)] focus:outline-none aria-[invalid=true]:border-danger disabled:opacity-60'

/**
 * A form field: mono label above, control, then hint or error.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: ReactNode
  htmlFor: string
  hint?: ReactNode
  error?: string | string[]
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  const message = Array.isArray(error) ? error[0] : error
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="label flex items-baseline justify-between text-ink-2">
        <span>{label}</span>
        {optional && <span className="normal-case tracking-normal text-muted">facultatif</span>}
      </label>
      {children}
      {message ? (
        <p id={`${htmlFor}-error`} className="text-[13.5px] font-medium text-danger" role="alert">
          {message}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[13.5px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(control, 'h-11 px-3.5', className)}
        {...props}
      />
    )
  }
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(control, 'min-h-28 px-3.5 py-3 leading-relaxed', className)}
      {...props}
    />
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(control, 'h-11 appearance-none bg-[length:12px] bg-[right_14px_center] bg-no-repeat px-3.5 pr-10', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%2369655a' stroke-width='1.5'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
})

export function Checkbox({
  id,
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: ReactNode }) {
  return (
    <label htmlFor={id} className={cn('inline-flex cursor-pointer items-center gap-2.5 text-[15px] text-ink-2', className)}>
      <input
        id={id}
        type="checkbox"
        className="size-4.5 cursor-pointer appearance-none rounded-xs border border-line-2 bg-card transition checked:border-ink checked:bg-ink checked:bg-[url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5l3 3 6-7' fill='none' stroke='%23F7DF1E' stroke-width='2'/%3E%3C/svg%3E&quot;)] focus-visible:shadow-[0_0_0_3px_var(--js)] focus-visible:outline-none"
        {...props}
      />
      {label}
    </label>
  )
}
