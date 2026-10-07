/**
 * Only allow same-site relative paths ("/forum/x"), never "//evil.com"
 * or absolute URLs, to prevent open redirects.
 */
export function safeRedirectPath(value: unknown, fallback = '/dashboard') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
