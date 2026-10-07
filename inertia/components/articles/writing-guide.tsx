const CHECKLIST = [
  {
    title: 'Un titre explicite',
    text: 'On doit savoir ce qu’on va apprendre avant de cliquer. Évitez les titres-mystère.',
  },
  {
    title: 'Une idée par article',
    text: 'Deux articles courts valent mieux qu’un long fourre-tout. Allez droit au but.',
  },
  {
    title: 'Du code commenté',
    text: 'Des blocs ```js testés, avec le contexte nécessaire pour les reproduire chez soi.',
  },
  {
    title: 'Citez vos sources',
    text: 'Documentation, articles, dépôts : donnez les liens qui vous ont aidé.',
  },
]

/**
 * Editorial checklist shown next to the article form.
 */
export function WritingGuide() {
  return (
    <section aria-labelledby="writing-guide-title" className="border-t border-ink pt-5">
      <h2 id="writing-guide-title" className="label text-ink">
        <span className="mr-2 text-muted">[✓]</span>Avant de publier
      </h2>
      <ol className="mt-5">
        {CHECKLIST.map((item, i) => (
          <li
            key={item.title}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-line py-4 first:border-t-0 first:pt-0"
          >
            <span className="label pt-1 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <p className="text-[16px] leading-snug font-semibold tracking-[-0.01em]">
                {item.title}
              </p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-line pt-4 text-[14px] text-muted">
        Un brouillon n’est visible que par vous : enregistrez, relisez à tête reposée, publiez quand
        c’est prêt.
      </p>
    </section>
  )
}
