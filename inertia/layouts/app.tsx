import type { ReactNode } from 'react'
import Navbar from '~/components/navbar'
import Footer from '~/components/footer'
import FlashToasts from '~/components/flash-toasts'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
      <FlashToasts />
    </div>
  )
}
