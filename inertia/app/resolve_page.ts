import type { ResolvedComponent } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import SiteLayout from '~/layouts/app'

export const SITE_NAME = 'JavaScript Cameroun'

export function pageTitle(title: string) {
  return title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — la communauté des développeurs JavaScript du 237`
}

/**
 * Resolve a page component and apply the default site layout, unless the
 * page declares its own `layout` (use `Page.layout = (page) => page` for none).
 */
export async function resolvePage(name: string, pages: Record<string, any>) {
  const module = await resolvePageComponent<{ default: ResolvedComponent }>(
    `../pages/${name}.tsx`,
    pages
  )
  const component = module.default as ResolvedComponent & { layout?: unknown }
  if (component.layout === undefined) {
    component.layout = [SiteLayout]
  }
  return component
}
