import { Seo } from '~/components/seo'

const SECTIONS: { title: string; body: string[]; list?: string[] }[] = [
  {
    title: 'Notre engagement',
    body: [
      'En tant que membres, contributeurs et responsables de JavaScript Cameroun, nous nous engageons à faire de la participation à notre communauté une expérience respectueuse et sans harcèlement pour tout le monde, quels que soient l’âge, l’apparence, le handicap, l’origine ethnique, la région, la langue, le genre, l’orientation sexuelle, la religion, le niveau d’expérience, la formation ou la situation professionnelle.',
    ],
  },
  {
    title: 'Ce que nous attendons',
    body: ['Exemples de comportements qui contribuent à une communauté saine :'],
    list: [
      'faire preuve de bienveillance et de patience, en particulier avec les débutants ;',
      'respecter les opinions, les points de vue et les expériences différents ;',
      'donner et recevoir des critiques constructives, sur le code et jamais sur la personne ;',
      'reconnaître ses erreurs et en tirer des leçons ;',
      'citer ses sources et respecter le travail des autres.',
    ],
  },
  {
    title: 'Ce que nous n’acceptons pas',
    body: ['Exemples de comportements inacceptables :'],
    list: [
      'les propos ou images à caractère sexuel, les avances non sollicitées ;',
      'le trolling, les insultes, les attaques personnelles, politiques ou tribales ;',
      'le harcèlement public ou privé ;',
      'la publication d’informations privées d’autrui sans son accord explicite ;',
      'le spam, l’autopromotion abusive, les arnaques et les offres d’emploi frauduleuses ;',
      'tout autre comportement qui serait raisonnablement jugé inapproprié dans un cadre professionnel.',
    ],
  },
  {
    title: 'Modération',
    body: [
      'Les modérateurs peuvent modifier, verrouiller ou supprimer tout contenu qui ne respecte pas ce code, et suspendre temporairement ou définitivement un compte. Ils expliquent leurs décisions lorsque c’est approprié.',
    ],
  },
  {
    title: 'Signaler un problème',
    body: [
      'Si vous êtes victime ou témoin d’un comportement inacceptable, écrivez à support@javascript.cm. Chaque signalement est examiné rapidement et en toute confidentialité.',
    ],
  },
  {
    title: 'Attribution',
    body: [
      'Ce code de conduite est adapté du Contributor Covenant, version 2.1, disponible sur contributor-covenant.org.',
    ],
  },
]

export default function CodeOfConduct() {
  return (
    <>
      <Seo
        title="Code de conduite"
        description="Les règles qui font de JavaScript Cameroun un espace respectueux et accueillant."
      />
      <section className="shell border-b border-line pt-14 pb-12 sm:pt-20">
        <p className="label text-ink-2">Règles communes · v1.0</p>
        <h1 className="mt-5 text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
          Code de <span className="mark">conduite</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-ink-2">
          Une règle d’or : traitez les autres membres comme vous aimeriez être traité le jour où
          vous posez votre première question.
        </p>
      </section>
      <div className="shell py-14">
        <div className="max-w-3xl">
          {SECTIONS.map((section, i) => (
            <section
              key={section.title}
              className="grid gap-x-8 border-t border-line py-8 sm:grid-cols-[4rem_1fr]"
            >
              <span className="label pt-1.5 text-ink">§ {i + 1}</span>
              <div>
                <h2 className="text-[24px] leading-tight font-bold tracking-[-0.025em]">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[16.5px] leading-relaxed text-ink-2">
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item) => (
                      <li
                        key={item}
                        className="grid grid-cols-[1rem_1fr] text-[16.5px] leading-relaxed text-ink-2"
                      >
                        <span aria-hidden="true" className="text-muted">
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
