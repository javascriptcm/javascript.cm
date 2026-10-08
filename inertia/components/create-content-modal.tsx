import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Link } from '@inertiajs/react'
import { X } from 'lucide-react'

const CHOICES = [
  {
    href: '/articles/nouveau',
    code: '01',
    title: 'Un article',
    text: 'Un tutoriel, un retour d’expérience, une découverte. Écrit en Markdown, publié sur votre profil.',
  },
  {
    href: '/forum/nouveau',
    code: '02',
    title: 'Une question',
    text: 'Vous êtes bloqué ? Décrivez le problème, la communauté vous aide. Marquez la bonne réponse comme solution.',
  },
  {
    href: '/discussions/nouvelle',
    code: '03',
    title: 'Une discussion',
    text: 'Un débat, une annonce, un sujet ouvert : carrière, outils, événements, écosystème local.',
  },
]

/**
 * "Écrire" chooser: what do you want to publish?
 */
export default function CreateContentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink/45" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
          <DialogPanel
            transition
            className="w-full max-w-2xl rounded-sm border border-ink bg-card shadow-[8px_8px_0_var(--ink)] transition duration-200 ease-out-expo data-closed:translate-y-3 data-closed:opacity-0"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <DialogTitle className="label text-ink">Publier sur javascript.cm</DialogTitle>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="grid size-9 place-items-center rounded-sm text-muted hover:bg-paper-2 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <ul>
              {CHOICES.map((choice) => (
                <li key={choice.href} className="border-b border-line last:border-b-0">
                  <Link
                    href={choice.href}
                    onClick={onClose}
                    className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 px-6 py-6 transition-colors duration-150 hover:bg-js hover:text-js-ink focus-visible:bg-js focus-visible:text-js-ink focus-visible:outline-none"
                  >
                    <span className="label pt-1.5 group-hover:text-js-ink">{choice.code}</span>
                    <span>
                      <span className="block text-[26px] leading-tight font-bold tracking-[-0.03em]">
                        {choice.title}
                      </span>
                      <span className="mt-1.5 block max-w-md text-[15px] text-ink-2 group-hover:text-js-ink/80">
                        {choice.text}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="pt-1 text-[22px] transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
