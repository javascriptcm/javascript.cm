import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '~/lib/format'

const COOKIE = 'app_theme'
const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Toggles light/dark. The effective theme lives on <html data-theme>, set
 * before paint by the Edge layout (cookie or system preference).
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
  }

  const isDark = theme === 'dark'
  const label = isDark ? 'Passer en thème clair' : 'Passer en thème sombre'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-10 place-items-center rounded-sm border border-transparent text-ink-2 transition-colors hover:border-line-2 hover:text-ink',
        className
      )}
    >
      {isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
    </button>
  )
}
