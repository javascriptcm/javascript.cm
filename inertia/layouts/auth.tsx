import type { ReactNode } from 'react'
import Logo from '~/components/logo'
import ThemeToggle from '~/components/theme-toggle'
import FlashToasts from '~/components/flash-toasts'

const PILLARS = [
  ['Articles', 'Écrivez, partagez, apprenez en public.'],
  ['Forum', 'Une question ? Quelqu’un a la réponse.'],
  ['Discussions', 'Carrière, outils, écosystème local.'],
]

/**
 * Split layout: form on the left; on the right a dark "poster" panel.
 * One inner margin (px-10) for every block of the poster so all its
 * lines share the same left edge.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>
          <main
            id="contenu"
            className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12"
          >
            {children}
          </main>
          <p className="label">© {new Date().getFullYear()} JavaScript Cameroun</p>
        </div>

        <aside className="relative hidden overflow-hidden border-l border-ink bg-ink text-paper lg:flex lg:flex-col dark:bg-paper-2 dark:text-ink">
          <div className="flex items-start justify-between px-10 pt-10">
            <p className="label text-paper/60 dark:text-muted">Fiche d’adhésion · N° 237</p>
            <p className="label text-paper/60 dark:text-muted">4.05° N · 9.70° E</p>
          </div>

          <div className="flex flex-1 flex-col justify-center px-10 py-16">
            <p className="text-[clamp(3rem,6vw,6.25rem)] font-extrabold tracking-[-0.055em]">
              <span className="block leading-[0.9]">Le 237</span>
              <span className="mt-[0.35em] block font-mono text-[0.32em] leading-none font-medium tracking-[-0.02em] text-paper/70 dark:text-muted">
                code en
              </span>
              <span className="mt-[0.14em] -ml-[0.1em] inline-block bg-js px-[0.1em] pt-[0.02em] pb-[0.1em] leading-[0.95] text-js-ink">
                JavaScript.
              </span>
            </p>
          </div>

          <dl className="grid grid-cols-1 border-t border-paper/20 xl:grid-cols-3 dark:border-line">
            {PILLARS.map(([title, text], i) => (
              <div
                key={title}
                className="border-t border-paper/20 px-10 py-6 first:border-t-0 xl:border-t-0 xl:border-l xl:py-8 xl:first:border-l-0 dark:border-line"
              >
                <dt className="label text-js dark:text-ink">
                  0{i + 1} — {title}
                </dt>
                <dd className="mt-3 text-[15px] leading-snug text-paper/75 dark:text-ink-2">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
      <FlashToasts />
    </>
  )
}
