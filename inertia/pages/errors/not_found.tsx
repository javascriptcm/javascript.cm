import { Seo } from '~/components/seo'
import { ButtonLink } from '~/components/ui/button'

export default function NotFound() {
  return (
    <>
      <Seo title="Page introuvable" noindex />
      <section className="shell grid min-h-[70vh] items-center py-20">
        <div>
          <p className="label">Erreur 404 · Page introuvable</p>
          <p className="mt-6 font-mono text-[clamp(1rem,2.4vw,1.4rem)] text-danger">
            TypeError: Cannot read properties of undefined (reading &apos;page&apos;)
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(3rem,9vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.055em]">
            Cette page est <span className="mark">undefined</span>.
          </h1>
          <p className="mt-6 max-w-xl text-[17.5px] text-ink-2">
            Le lien est peut-être cassé, ou le contenu a été supprimé par son auteur.
          </p>
          <div className="mt-9 flex flex-wrap gap-2">
            <ButtonLink href="/" size="lg">
              Retour à l’accueil
            </ButtonLink>
            <ButtonLink href="/forum" variant="secondary" size="lg">
              Chercher sur le forum
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
