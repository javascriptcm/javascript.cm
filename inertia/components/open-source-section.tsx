import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

const CLONE = 'git clone https://github.com/javascriptcm/javascript.cm.git'

/**
 * Full-bleed JS-yellow band: the rhythm break of the home page.
 */
export default function OpenSourceSection() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(CLONE)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard unavailable (insecure context): the command stays selectable.
    }
  }

  return (
    <section aria-labelledby="open-source" className="mt-24 border-y border-ink bg-js text-js-ink sm:mt-32">
      <div className="shell grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label text-js-ink/70">[04] — Open source</p>
          <h2 id="open-source" className="mt-5 text-[clamp(2.6rem,7vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
            Ce site est écrit par la communauté.
          </h2>
        </div>
        <div className="lg:col-span-5">
          <p className="text-[17.5px] leading-relaxed">
            AdonisJS, React, Inertia, TypeScript. Corrigez un bug, proposez une fonctionnalité, faites votre première
            contribution open source sur un projet que vous utilisez.
          </p>
          <div className="mt-6 flex items-stretch rounded-sm border border-js-ink bg-js-ink text-js">
            <code className="min-w-0 flex-1 overflow-x-auto px-4 py-3.5 font-mono text-[13px] whitespace-nowrap">
              <span className="select-none opacity-50">$ </span>
              {CLONE}
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label="Copier la commande"
              className="grid w-12 shrink-0 place-items-center border-l border-js/30 transition-colors hover:bg-js hover:text-js-ink"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <a
            href="https://github.com/javascriptcm/javascript.cm"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-mono text-[13px] font-semibold tracking-[0.06em] uppercase"
          >
            <span className="link-draw">Voir le dépôt sur GitHub</span> ↗
          </a>
        </div>
      </div>
    </section>
  )
}
