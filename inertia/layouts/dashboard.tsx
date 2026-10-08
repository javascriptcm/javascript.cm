import type { ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import Navbar from '~/components/navbar'
import FlashToasts from '~/components/flash-toasts'
import { WorkspaceNav, type WorkspaceVariant } from '~/components/dashboard/workspace-nav'

/**
 * The signed-in workspace: site header, a section index on the left
 * (dashboard + settings, or the back office), the page on the right.
 */
function WorkspaceShell({ variant, children }: { variant: WorkspaceVariant; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="shell flex-1">
        <div className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[14.5rem_minmax(0,1fr)] xl:gap-12">
          <aside className="min-w-0 border-b border-line lg:border-r lg:border-b-0 lg:pr-6">
            <WorkspaceNav variant={variant} />
          </aside>
          <main id="contenu" className="min-w-0 pt-8 pb-20 lg:pt-12 lg:pb-28">
            {children}
          </main>
        </div>
      </div>
      <footer className="border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-6">
          <p className="label">© {new Date().getFullYear()} JavaScript Cameroun</p>
          <p className="label">
            <Link href="/" className="link-draw hover:text-ink">
              Retour au site
            </Link>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <Link href="/membres" className="link-draw hover:text-ink">
              Les membres
            </Link>
          </p>
        </div>
      </footer>
      <FlashToasts />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell variant="member">{children}</WorkspaceShell>
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell variant="admin">{children}</WorkspaceShell>
}
