/**
 * Build "/path?a=1&b=2", dropping empty params (and therefore "page"
 * whenever a filter changes, since callers do not pass it).
 */
export function withQuery(
  path: string,
  params: Record<string, string | number | null | undefined>
) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${path}?${qs}` : path
}
