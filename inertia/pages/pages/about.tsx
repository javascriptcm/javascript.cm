import { Seo } from '~/components/seo'
import { ButtonLink } from '~/components/ui/button'

const PRINCIPLES = [
  {
    title: 'Apprendre en public',
    text: 'Un article, même court, une question bien posée, une réponse détaillée : tout ce qui est écrit ici reste utile au prochain développeur qui cherche.',
  },
  {
    title: 'Le contexte local compte',
    text: 'Connexions instables, paiements mobile money, freelance avec des clients à l’étranger, recrutement à Douala ou Yaoundé : on parle aussi de nos réalités.',
  },
  {
    title: 'Tous les niveaux sont les bienvenus',
    text: 'Une question de débutant n’est jamais bête. Les membres expérimentés répondent avec patience, les nouveaux osent demander.',
  },
  {
    title: 'Ouvert et transparent',
    text: 'Le site est open source et construit par ses membres. Les décisions et les évolutions se discutent publiquement.',
  },
]

export default function About() {
  return (
    <>
      <Seo
        title="À propos"
        description="JavaScript Cameroun rassemble les développeurs JavaScript du Cameroun autour d’articles, d’un forum d’entraide et de discussions."
      />
      <section className="shell border-b border-line pt-14 pb-12 sm:pt-20">
        <p className="label text-ink-2">À propos</p>
        <h1 className="mt-5 max-w-5xl text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
          Une communauté pour celles et ceux qui écrivent du{' '}
          <span className="mark">JavaScript</span> au Cameroun.
        </h1>
      </section>

      <section className="shell grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[19px] leading-relaxed text-ink-2">
            JavaScript Cameroun est née d’un constat simple : les développeurs du pays apprennent
            beaucoup, mais seuls, éparpillés entre groupes WhatsApp et tutoriels en anglais. Ce site
            leur donne un lieu commun, durable et en français, pour partager ce qu’ils savent et
            trouver de l’aide.
          </p>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-2">
            Front-end, back-end, mobile, outillage : React, Vue, Angular, Node.js, TypeScript et
            tout l’écosystème ont leur place. Le site s’inspire de{' '}
            <a
              href="https://laravel.cm"
              className="font-medium text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              Laravel Cameroun
            </a>
            , communauté sœur.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href="/register">Rejoindre la communauté</ButtonLink>
            <ButtonLink href="/code-de-conduite" variant="secondary">
              Lire le code de conduite
            </ButtonLink>
          </div>
        </div>
        <ol className="lg:col-span-6 lg:col-start-7">
          {PRINCIPLES.map((principle, i) => (
            <li
              key={principle.title}
              className="grid grid-cols-[auto_1fr] gap-x-5 border-t border-line py-7 last:border-b"
            >
              <span className="label pt-1.5 text-ink">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-[24px] leading-tight font-bold tracking-[-0.025em]">
                  {principle.title}
                </h2>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{principle.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="shell">
        <div className="flex flex-col gap-6 border-t border-ink pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label text-ink">Contact</p>
            <p className="mt-3 max-w-xl text-[17px] text-ink-2">
              Une proposition de partenariat, un meetup à annoncer, un problème à signaler ? Écrivez
              à{' '}
              <a
                href="mailto:support@javascript.cm"
                className="font-medium text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js"
              >
                support@javascript.cm
              </a>
              .
            </p>
          </div>
          <a
            href="https://github.com/javascriptcm/javascript.cm"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[13px] font-medium tracking-[0.06em] uppercase"
          >
            <span className="link-draw">Contribuer au code du site</span> ↗
          </a>
        </div>
      </section>
    </>
  )
}
