import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export type Tip = { title: string; text: ReactNode }

const QUESTION_TIPS: Tip[] = [
  {
    title: 'Le contexte',
    text: 'Ce que vous essayez de faire, et pourquoi. Le projet, le framework, l’étape où ça coince.',
  },
  {
    title: 'Un code minimal reproductible',
    text: (
      <>
        Le plus petit extrait qui reproduit le problème, dans un bloc{' '}
        <code className="font-mono text-[0.9em]">```js</code>. Pas tout le projet.
      </>
    ),
  },
  {
    title: 'Le message d’erreur exact',
    text: 'Copiez-collez-le en entier, pile d’appels comprise. Une capture d’écran ne se recherche pas.',
  },
  {
    title: 'Ce que vous avez déjà essayé',
    text: 'Les pistes écartées, les liens consultés. Cela évite qu’on vous propose ce qui n’a pas marché.',
  },
  {
    title: 'Les versions',
    text: 'Node, npm/pnpm, le framework, le navigateur et le système. Un « ça marchait hier » se cache souvent là.',
  },
]

function TipList({ tips }: { tips: Tip[] }) {
  return (
    <ol className="border-t border-ink">
      {tips.map((tip, i) => (
        <li
          key={tip.title}
          className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-b border-line py-4"
        >
          <span className="label pt-1 text-ink tabular-nums">
            [{String(i + 1).padStart(2, '0')}]
          </span>
          <div>
            <p className="text-[16px] leading-snug font-semibold tracking-[-0.01em]">{tip.title}</p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{tip.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Writing guidance next to a form: always open on desktop, a disclosure
 * above the form on mobile.
 */
export function WritingTips({
  title,
  tips,
  footer,
  variant,
}: {
  title: string
  tips: Tip[]
  footer?: ReactNode
  variant: 'aside' | 'disclosure'
}) {
  if (variant === 'disclosure') {
    return (
      <details className="group rounded-sm border border-line-2 bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="label mr-2">Conseils</span>
            <span className="font-semibold">{title}</span>
          </span>
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="px-4 pb-4">
          <TipList tips={tips} />
          {footer && <div className="mt-4 text-[14px] text-muted">{footer}</div>}
        </div>
      </details>
    )
  }

  return (
    <section aria-labelledby="writing-tips">
      <h2 id="writing-tips" className="label mb-3 text-ink">
        <span className="mr-2 text-muted">[—]</span>
        {title}
      </h2>
      <TipList tips={tips} />
      {footer && <div className="mt-5 text-[14px] leading-relaxed text-muted">{footer}</div>}
    </section>
  )
}

export function AskingTips({ variant }: { variant: 'aside' | 'disclosure' }) {
  return (
    <WritingTips
      title="Bien poser sa question"
      tips={QUESTION_TIPS}
      variant={variant}
      footer="Une question claire reçoit des réponses plus vite — et sert à tous ceux qui chercheront la même chose demain."
    />
  )
}
