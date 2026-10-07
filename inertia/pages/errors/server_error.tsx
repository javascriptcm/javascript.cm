import { Seo } from '~/components/seo'
import { ButtonLink } from '~/components/ui/button'

export default function ServerError() {
  return (
    <>
      <Seo title="Erreur serveur" noindex />
      <section className="shell grid min-h-[70vh] items-center py-20">
        <div>
          <p className="label">Erreur 500 · Problème de notre côté</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,9vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.055em]">
            Promise <span className="mark">rejected</span>.
          </h1>
          <p className="mt-6 max-w-xl text-[17.5px] text-ink-2">
            Une erreur inattendue s’est produite. L’équipe a été prévenue ; réessayez dans un
            instant.
          </p>
          <div className="mt-9">
            <ButtonLink href="/" size="lg">
              Retour à l’accueil
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
