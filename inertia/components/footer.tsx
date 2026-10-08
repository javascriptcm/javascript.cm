import { Link } from '@inertiajs/react'
import { LogoMark } from '~/components/logo'

const COLUMNS = [
  {
    title: 'Communauté',
    links: [
      { href: '/articles', label: 'Articles' },
      { href: '/forum', label: 'Forum' },
      { href: '/discussions', label: 'Discussions' },
      { href: '/membres', label: 'Membres' },
      { href: '/a-propos', label: 'À propos' },
      { href: '/code-de-conduite', label: 'Code de conduite' },
    ],
  },
  {
    title: 'Contribuer',
    links: [
      { href: '/articles/nouveau', label: 'Écrire un article' },
      { href: '/forum/nouveau', label: 'Poser une question' },
      { href: '/discussions/nouvelle', label: 'Lancer une discussion' },
      { href: '/feed.xml', label: 'Flux RSS', external: true },
    ],
  },
  {
    title: 'Ailleurs',
    links: [
      { href: 'https://github.com/javascriptcm', label: 'GitHub', external: true },
      { href: 'https://x.com/javascriptcm', label: 'X / Twitter', external: true },
      { href: 'https://www.linkedin.com/company/javascriptcm', label: 'LinkedIn', external: true },
      { href: 'https://www.facebook.com/javascriptcm', label: 'Facebook', external: true },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-ink bg-ink text-paper dark:bg-paper-2 dark:text-ink">
      <div className="shell pt-16 pb-10 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label text-paper/60 dark:text-muted">Le JS du 237, ensemble.</p>
            <p className="mt-5 max-w-md text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] font-semibold tracking-[-0.03em]">
              Partagez ce que vous savez. Demandez ce que vous ignorez.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-sm bg-js px-5 font-medium text-js-ink transition-[translate,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--paper)] dark:hover:shadow-[3px_3px_0_var(--ink)]"
            >
              Rejoindre la communauté →
            </Link>
          </div>
          <nav
            aria-label="Pied de page"
            className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7"
          >
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="label text-paper/60 dark:text-muted">{column.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          className="link-draw text-[15.5px]"
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                        >
                          {link.label}
                          {link.href.startsWith('http') && (
                            <span className="ml-1 opacity-50">↗</span>
                          )}
                        </a>
                      ) : (
                        <Link href={link.href} className="link-draw text-[15.5px]">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 -mb-[0.12em] text-[clamp(3.2rem,14.2vw,12.5rem)] leading-[0.8] font-extrabold tracking-[-0.065em] select-none"
        >
          javascript<span className="text-js dark:text-muted">.cm</span>
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-paper/20 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-line">
          <div className="flex items-center gap-3">
            <LogoMark className="size-7" />
            <p className="label text-paper/60 dark:text-muted">
              © {year} JavaScript Cameroun · Douala — Yaoundé — Buea
            </p>
          </div>
          <p className="label text-paper/60 dark:text-muted">
            <a
              href="https://github.com/javascriptcm/javascript.cm"
              className="link-draw"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code source ouvert ↗
            </a>
            <span className="mx-2">·</span>
            Inspiré par{' '}
            <a
              href="https://laravel.cm"
              className="link-draw"
              target="_blank"
              rel="noopener noreferrer"
            >
              Laravel Cameroun ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
