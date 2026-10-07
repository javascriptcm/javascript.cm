import type { ReactNode } from 'react'
import Logo from '~/components/logo'
import ThemeToggle from '~/components/theme-toggle'
import FlashToasts from '~/components/flash-toasts'

/**
 * Split layout: form on the left; on the right a dark "poster" panel.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <main id="contenu" className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          {children}
        </main>
        <p className="label">© {new Date().getFullYear()} JavaScript Cameroun</p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-ink bg-ink text-paper lg:flex lg:flex-col lg:justify-between dark:bg-paper-2 dark:text-ink">
        <div className="flex items-start justify-between p-10">
          <p className="label text-paper/60 dark:text-muted">Fiche d’adhésion · N° 237</p>
          <p className="label text-paper/60 dark:text-muted">4.05° N · 9.70° E</p>
        </div>
        <div className="px-10">
          <p className="text-[clamp(3rem,6.4vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.055em]">
            Le 237
            <br />
            <span className="font-mono text-[0.42em] font-medium tracking-[-0.02em] text-paper/70 dark:text-muted">code en</span>
            <br />
            <span className="mark-full">JavaScript.</span>
          </p>
        </div>
        <dl className="grid grid-cols-3 border-t border-paper/20 dark:border-line">
          {[
            ['Articles', 'Écrivez, partagez, apprenez en public.'],
            ['Forum', 'Une question ? Quelqu’un a la réponse.'],
            ['Discussions', 'Carrière, outils, écosystème local.'],
          ].map(([title, text], i) => (
            <div key={title} className="border-r border-paper/20 p-8 last:border-r-0 dark:border-line">
              <dt className="label text-js dark:text-ink">
                0{i + 1} — {title}
              </dt>
              <dd className="mt-3 text-[15px] leading-snug text-paper/75 dark:text-ink-2">{text}</dd>
            </div>
          ))}
        </dl>
      </aside>
      <FlashToasts />
    </div>
  )
}
