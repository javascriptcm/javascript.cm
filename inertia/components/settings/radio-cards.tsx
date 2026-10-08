import type { ReactNode } from 'react'
import { cn } from '~/lib/format'

export type RadioCardOption<T extends string> = {
  value: T
  label: ReactNode
  description?: ReactNode
  /** Small mono note next to the label ("par défaut"…). */
  note?: ReactNode
}

/**
 * A radio group drawn as cards: native radios (arrow keys move the
 * selection), the whole card is clickable, the checked one is inked.
 */
export function RadioCards<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  disabled = false,
  className,
  describedBy,
  columns = 2,
}: {
  name: string
  legend: ReactNode
  value: T
  options: RadioCardOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
  describedBy?: string
  /** Cards per row from the "sm" breakpoint. */
  columns?: 1 | 2
}) {
  return (
    <fieldset className={cn('min-w-0', className)} aria-describedby={describedBy}>
      <legend className="label mb-2 text-ink-2">{legend}</legend>
      <div className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2')}>
        {options.map((option) => {
          const checked = option.value === value
          const id = `${name}-${option.value}`
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                'relative flex cursor-pointer gap-3 rounded-sm border bg-card p-3.5 transition-[border-color,box-shadow,background-color] duration-150 has-[:focus-visible]:shadow-[0_0_0_3px_var(--js)]',
                checked
                  ? 'border-ink shadow-[inset_0_0_0_1px_var(--ink)]'
                  : 'border-line-2 hover:border-ink hover:bg-paper-2',
                disabled && 'pointer-events-none opacity-60'
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors duration-150',
                  checked ? 'border-ink bg-ink' : 'border-line-2 bg-card'
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full bg-js transition-transform duration-200 ease-out-expo',
                    checked ? 'scale-100' : 'scale-0'
                  )}
                />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-2 text-[15px] leading-snug font-semibold text-ink">
                  {option.label}
                  {option.note && (
                    <span className="label tracking-[0.06em] normal-case">{option.note}</span>
                  )}
                </span>
                {option.description && (
                  <span className="mt-1 block text-[13.5px] leading-snug text-muted">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
