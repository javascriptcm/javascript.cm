import { cn } from '~/lib/format'

/**
 * Renders server-rendered, sanitized markdown HTML (see app/services/markdown.ts).
 */
export function Prose({ html, size = 'base', className }: { html: string; size?: 'sm' | 'base'; className?: string }) {
  return (
    <div
      className={cn('prose prose-jscm', size === 'sm' && 'prose-sm', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
