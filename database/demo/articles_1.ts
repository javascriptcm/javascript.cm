import { text, type DemoArticle } from './types.js'

export const articlesPart1: DemoArticle[] = [
  /*
  |--------------------------------------------------------------------------
  | Closures & tontine
  |--------------------------------------------------------------------------
  */
  {
    author: 'christelle_k',
    title: 'Les closures expliquées avec une tontine',
    excerpt:
      'Une closure, c’est une fonction qui se souvient de l’endroit où elle est née. Pour le comprendre une bonne fois pour toutes, construisons ensemble la caisse d’une tontine en JavaScript.',
    tags: ['javascript', 'apprendre'],
    publishedDaysAgo: 86,
    views: 1840,
    body: text`
Dans beaucoup de familles camerounaises, la tontine (le *njangi* pour nos amis du Nord-Ouest et du Sud-Ouest) repose sur une règle simple : chacun cotise, une personne de confiance tient la caisse, et **personne ne peut y toucher directement**. On passe par la trésorière, qui vérifie, note et redistribue.

C’est exactement le service que rendent les closures en JavaScript. Si le mot vous fait peur, cet article est pour vous.

## Le problème : une caisse que tout le monde peut modifier

Commençons naïvement, avec un simple objet :

~~~js
const tontine = { caisse: 0, membres: ['Ngo', 'Kamdem', 'Ebai'] }

tontine.caisse += 10000 // une cotisation
tontine.caisse = 0 // ... ou un « accident »
~~~

Rien n’empêche n’importe quelle partie du code de vider la caisse. Il nous faut un état **privé**, accessible uniquement à travers quelques opérations autorisées.

## Une fonction qui se souvient

Quand une fonction est créée, elle garde un lien vers l’*environnement lexical* dans lequel elle a été déclarée, c’est-à-dire les variables visibles à cet endroit du code. Tant que la fonction existe, ces variables restent accessibles, même lorsque la fonction qui les a déclarées a terminé son exécution. Cette association « fonction + environnement » s’appelle une **closure** (fermeture, en français).

~~~js
function creerCompteur() {
  let total = 0

  return function () {
    total += 1
    return total
  }
}

const compter = creerCompteur()
compter() // 1
compter() // 2
~~~

\`creerCompteur\` a fini de s’exécuter après la première ligne, et pourtant \`total\` existe toujours : la fonction retournée l’a « capturé ». Mieux : chaque appel de \`creerCompteur\` crée un **nouvel** environnement.

~~~js
const a = creerCompteur()
const b = creerCompteur()

a()
a()
b() // 1 : b a sa propre variable total
~~~

## Construisons la tontine

Appliquons l’idée à notre caisse. Les variables \`caisse\`, \`tour\` et \`cotisations\` vivent dans la fonction \`creerTontine\` ; seules les fonctions qu’elle retourne peuvent les lire ou les modifier.

~~~js
function creerTontine(membres, montant) {
  const liste = [...membres] // copie : l’appelant ne pourra plus modifier la liste
  const cotisations = new Map()
  let caisse = 0
  let tour = 0

  function cotiser(membre) {
    if (!liste.includes(membre)) {
      throw new Error(\`\${membre} ne fait pas partie de la tontine\`)
    }
    if (cotisations.has(membre)) {
      throw new Error(\`\${membre} a déjà cotisé pour ce tour\`)
    }
    cotisations.set(membre, montant)
    caisse += montant
  }

  function remettre() {
    if (cotisations.size < liste.length) {
      throw new Error('Tout le monde n’a pas encore cotisé')
    }
    const beneficiaire = liste[tour % liste.length]
    const somme = caisse
    caisse = 0
    cotisations.clear()
    tour += 1
    return { beneficiaire, somme }
  }

  return {
    cotiser,
    remettre,
    solde: () => caisse,
  }
}
~~~

À l’usage :

~~~js
const njangi = creerTontine(['Ngo', 'Kamdem', 'Ebai'], 10000)

njangi.cotiser('Ngo')
njangi.cotiser('Kamdem')
njangi.cotiser('Ebai')
njangi.solde() // 30000

njangi.remettre() // { beneficiaire: 'Ngo', somme: 30000 }
njangi.caisse // undefined : la caisse n’est pas exposée
~~~

Personne ne peut plus écrire \`caisse = 0\` depuis l’extérieur. Les règles (pas de double cotisation, pas de remise tant qu’il manque quelqu’un) sont appliquées à un seul endroit. Et si vous créez une deuxième tontine, elle aura sa propre caisse, exactement comme nos deux compteurs.

Ce modèle porte un nom : le *module pattern*. On l’utilisait beaucoup avant les classes et les modules ES ; il reste très pratique pour fabriquer de petits objets avec un état privé.

> Depuis ES2022, les classes ont aussi des champs privés (\`#caisse\`). Les deux approches se valent ; les closures restent omniprésentes dès qu’on manipule des fonctions.

## Le piège classique : la boucle avec \`var\`

~~~js
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(\`Tour \${i}\`), 1000)
}
// Tour 4, Tour 4, Tour 4
~~~

Les trois fonctions passées à \`setTimeout\` capturent la **même** variable \`i\`, car \`var\` est limitée à la fonction, pas au bloc. Quand elles s’exécutent, une seconde plus tard, la boucle est terminée et \`i\` vaut 4.

Avec \`let\`, chaque tour de boucle crée une nouvelle liaison, et chaque fonction capture la sienne :

~~~js
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(\`Tour \${i}\`), 1000)
}
// Tour 1, Tour 2, Tour 3
~~~

## Vous utilisez déjà des closures

- **Les gestionnaires d’événements** qui lisent une variable déclarée plus haut.
- **Les hooks React** : à chaque rendu, vos fonctions capturent les props et l’état *de ce rendu-là*. C’est l’origine des fameuses « stale closures » quand un tableau de dépendances est incomplet.
- **\`debounce\`, \`once\`, la mémoïsation** : toutes reposent sur une variable cachée dans une closure.
- **Les fabriques de fonctions** configurées une fois, utilisées partout :

~~~js
const appliquerTaxe = (taux) => (montant) => Math.round(montant * (1 + taux))

const avecTVA = appliquerTaxe(0.1925)
avecTVA(10000) // 11925
~~~

## Et la mémoire ?

Tant qu’une fonction qui y fait référence reste accessible, les variables capturées ne peuvent pas être libérées par le ramasse-miettes. En pratique, c’est rarement un problème. Méfiez-vous simplement des fonctions qui vivent très longtemps : un écouteur d’événement jamais retiré, un \`setInterval\` jamais arrêté, un cache global qui grossit sans limite.

## À retenir

1. Une closure, c’est une fonction **et** l’environnement lexical où elle a été déclarée.
2. Elle permet de créer un état privé sans classe ni variable globale.
3. Chaque appel de la fonction externe crée un nouvel environnement.
4. \`let\` et \`const\` créent une nouvelle liaison à chaque tour de boucle, \`var\` non.

**Exercice** : ajoutez à la tontine une méthode \`penalite(membre, montant)\` qui ajoute une amende à la caisse, en refusant les montants négatifs. Postez votre solution en commentaire, je relirai avec plaisir.
`,
    comments: [
      {
        author: 'ebai-tabe',
        after: 30,
        body: text`
Très clair, merci. Question : pour la caisse, vous recommanderiez plutôt une classe avec \`#caisse\` ou cette version avec closure ? En stage on m’a dit que les closures « consomment plus de mémoire ».
`,
      },
      {
        author: 'christelle_k',
        after: 33,
        body: text`
Les deux sont valables. La version closure crée de nouvelles fonctions pour chaque tontine, la classe partage ses méthodes via le prototype : avec des milliers d’instances, la classe est un peu plus économe. Pour quelques dizaines d’objets, choisissez ce qui est le plus lisible pour votre équipe.
`,
      },
      {
        author: 'aissatou-oumarou',
        after: 1650,
        body: text`
Je suis tombée sur cet article après mon sujet sur \`setTimeout\` dans une boucle. Ma proposition pour l’exercice :

~~~js
function penalite(membre, montant) {
  if (!liste.includes(membre)) throw new Error(\`\${membre} est inconnu\`)
  if (montant <= 0) throw new Error('Montant invalide')
  caisse += montant
}
~~~

Il faut bien la déclarer dans \`creerTontine\` et l’ajouter à l’objet retourné, c’est ça ?
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | TypeScript utility types
  |--------------------------------------------------------------------------
  */
  {
    author: 'christelle_k',
    title: 'TypeScript : les types utilitaires du quotidien',
    excerpt:
      'Partial, Pick, Omit, Record, ReturnType, Awaited… Ces types fournis par TypeScript évitent de dupliquer vos interfaces. Tour d’horizon avec un exemple concret : les commandes d’une boutique en ligne.',
    tags: ['typescript'],
    publishedDaysAgo: 41,
    views: 960,
    body: text`
Le scénario est classique : une interface \`Commande\`, puis une \`CommandeFormulaire\` presque identique, puis une \`CommandeResume\`… Trois mois plus tard, quelqu’un ajoute un champ à la première et oublie les deux autres. Les **types utilitaires** de TypeScript règlent ce problème : on garde une seule source de vérité et on *dérive* le reste.

Voici notre type de départ, celui d’une boutique en ligne qui livre à Douala et Yaoundé :

~~~ts
interface Commande {
  id: string
  client: string
  telephone: string
  articles: { produitId: string; quantite: number; prixUnitaire: number }[]
  montantTotal: number // en FCFA, toujours un entier
  statut: 'en_attente' | 'payee' | 'livree' | 'annulee'
  creeLe: Date
  noteLivraison?: string
}
~~~

## \`Partial<T>\` : tout devient optionnel

Idéal pour une mise à jour partielle :

~~~ts
async function mettreAJour(id: string, modifications: Partial<Commande>) {
  // ...
}

mettreAJour('c_42', { statut: 'livree' }) // ok
~~~

Attention, \`Partial\` est **superficiel** : les objets imbriqués ne deviennent pas optionnels pour autant.

## \`Required<T>\` et \`Readonly<T>\`

\`Required\` fait l’inverse de \`Partial\` : il retire tous les \`?\`. \`Readonly\` interdit la réaffectation des propriétés :

~~~ts
const archivee: Readonly<Commande> = chargerArchive()

archivee.statut = 'annulee'
// Cannot assign to 'statut' because it is a read-only property.
~~~

Lui aussi est superficiel : \`archivee.articles.push(...)\` reste autorisé. Pour un tableau en lecture seule, utilisez \`readonly Article[]\` ou \`ReadonlyArray<Article>\`.

## \`Pick<T, K>\` et \`Omit<T, K>\`

\`Pick\` garde certaines clés, \`Omit\` en retire :

~~~ts
type ResumeCommande = Pick<Commande, 'id' | 'client' | 'montantTotal' | 'statut'>

// Ce que le formulaire envoie : le serveur génère id, date et statut
type NouvelleCommande = Omit<Commande, 'id' | 'creeLe' | 'statut'>
~~~

Un piège méconnu : \`Omit\` ne vérifie pas que les clés existent. \`Omit<Commande, 'cree_le'>\` (faute de frappe) compile sans broncher et ne retire rien. Si cela vous inquiète, une version stricte tient en une ligne :

~~~ts
type OmitStrict<T, K extends keyof T> = Omit<T, K>

type Test = OmitStrict<Commande, 'cree_le'>
// Type '"cree_le"' does not satisfy the constraint 'keyof Commande'.
~~~

## \`Record<K, V>\` : un dictionnaire exhaustif

~~~ts
type Statut = Commande['statut']

const libelles: Record<Statut, string> = {
  en_attente: 'En attente de paiement',
  payee: 'Payée',
  livree: 'Livrée',
  annulee: 'Annulée',
}
~~~

Le jour où vous ajoutez un statut \`'remboursee'\`, TypeScript signale immédiatement que \`libelles\` est incomplet. C’est l’un des meilleurs filets de sécurité du langage.

## \`Exclude\`, \`Extract\` et \`NonNullable\`

Ces trois-là travaillent sur les unions :

~~~ts
type StatutActif = Exclude<Statut, 'annulee'> // 'en_attente' | 'payee' | 'livree'
type StatutFinal = Extract<Statut, 'livree' | 'annulee'> // 'livree' | 'annulee'
type Note = NonNullable<Commande['noteLivraison']> // string
~~~

## \`ReturnType\`, \`Parameters\` et \`Awaited\`

Quand le type existe déjà dans une fonction, inutile de le réécrire :

~~~ts
async function chargerCommande(id: string) {
  const response = await fetch(\`/api/commandes/\${id}\`)
  return (await response.json()) as Commande
}

type Resultat = ReturnType<typeof chargerCommande> // Promise<Commande>
type CommandeChargee = Awaited<Resultat> // Commande
type Arguments = Parameters<typeof chargerCommande> // [id: string]
~~~

\`Awaited\` « déballe » une promesse, y compris les promesses imbriquées. Très utile pour typer le résultat d’une fonction d’une bibliothèque qui n’exporte pas ses types.

## Bonus : \`satisfies\`

\`satisfies\` vérifie qu’une valeur respecte un type **sans élargir** son type inféré :

~~~ts
const fraisLivraison = {
  Douala: 1500,
  Yaounde: 2000,
  Bafoussam: 2500,
} satisfies Record<string, number>

fraisLivraison.Douala // number, avec l’autocomplétion des villes
fraisLivraison.Kribi // erreur : la propriété n’existe pas
~~~

Avec une annotation classique (\`const fraisLivraison: Record<string, number>\`), on aurait perdu la liste des villes et \`fraisLivraison.Kribi\` serait accepté.

## Les combiner

Les types utilitaires se composent :

~~~ts
// Le client peut seulement corriger son téléphone et sa note de livraison
type CorrectionClient = Partial<Pick<Commande, 'telephone' | 'noteLivraison'>>
~~~

## Ma règle de poche

1. Un type « source » par concept métier.
2. Tous les autres en sont dérivés avec les types utilitaires.
3. Si une expression de type devient illisible, donnez-lui un nom, comme vous le feriez pour une variable.

Votre code y gagne en cohérence, et les revues de code en sérénité.
`,
    comments: [
      {
        author: 'junior-mbarga',
        after: 20,
        body: text`
Le coup de \`OmitStrict\` m’aurait évité une après-midi de débogage le mois dernier. J’ajoute que \`Record<Statut, string>\` marche aussi très bien pour les couleurs de badges côté front.
`,
      },
      {
        author: 'grace-enow',
        after: 52,
        body: text`
Merci Christelle ! Je ne savais pas que \`satisfies\` gardait le type précis, j’utilisais des annotations partout. Je vais revoir mon fichier de constantes.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Offline-first
  |--------------------------------------------------------------------------
  */
  {
    author: 'nfor_ngwa',
    title: 'Offline-first : une application web qui tient le coup quand la connexion coupe',
    excerpt:
      'Zones blanches, 3G qui plafonne, forfait épuisé en fin de mois : vos utilisateurs perdent souvent le réseau. Service Worker, cache et retries avec backoff exponentiel, la recette d’une app qui ne lâche pas.',
    tags: ['javascript', 'performance'],
    publishedDaysAgo: 62,
    featured: true,
    views: 2350,
    body: text`
Un livreur remplit un bon de livraison sur son téléphone, entre deux quartiers. Le réseau tombe au moment d’envoyer : formulaire perdu, client mécontent, ressaisie à la main le soir. Chez nous, ce scénario n’est pas un cas limite, c’est le quotidien.

L’approche **offline-first** consiste à traiter le réseau comme une amélioration, pas comme un prérequis. Elle repose sur trois promesses faites à l’utilisateur :

1. L’interface s’affiche, même sans réseau.
2. Les données déjà consultées restent disponibles.
3. Ses actions ne sont **jamais perdues** : elles partent dès que le réseau revient.

## 1. Mettre l’application en cache avec un Service Worker

Un Service Worker est un script qui s’intercale entre votre page et le réseau. Il ne fonctionne qu’en HTTPS (ou sur \`localhost\` pendant le développement).

~~~js
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
~~~

Dans \`sw.js\`, on met en cache la « coquille » de l’application à l’installation, on supprime les anciens caches à l’activation, puis on choisit une stratégie selon le type de requête :

~~~js
// sw.js
const CACHE = 'app-v3'
const COQUILLE = ['/', '/offline.html', '/app.css', '/app.js', '/logo.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(COQUILLE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((cle) => cle !== CACHE).map((cle) => caches.delete(cle))))
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  event.respondWith(url.pathname.startsWith('/api/') ? reseauDabord(request) : cacheDabord(request))
})

async function cacheDabord(request) {
  const enCache = await caches.match(request)
  if (enCache) return enCache

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    if (request.mode === 'navigate') return caches.match('/offline.html')
    throw error
  }
}

async function reseauDabord(request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const enCache = await cache.match(request)
    return (
      enCache ??
      new Response(JSON.stringify({ erreur: 'hors_ligne' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  }
}
~~~

- **Cache d’abord** pour les fichiers statiques versionnés : instantané, et ça marche hors ligne.
- **Réseau d’abord** pour les données : on montre l’information la plus fraîche possible, et la dernière version connue en cas de coupure.

Pour un vrai projet, une bibliothèque comme Workbox génère ce code et gère les cas délicats (quotas, mises à jour). Mais comprendre ces vingt lignes vous évitera bien des surprises.

## 2. Ne pas croire \`navigator.onLine\` sur parole

\`navigator.onLine === true\` signifie seulement que l’appareil est connecté à *un* réseau. Un Wi-Fi sans crédit ou un portail captif répondent « en ligne » alors qu’aucune requête ne passe. Utilisez-le comme un indice pour l’interface, jamais comme une vérité :

~~~js
window.addEventListener('offline', () => afficherBandeau('Vous êtes hors ligne. Vos actions partiront au retour du réseau.'))
window.addEventListener('online', () => {
  masquerBandeau()
  envoyerFileDAttente()
})
~~~

La seule vraie réponse, c’est le succès ou l’échec de la requête.

## 3. Réessayer intelligemment : backoff exponentiel et jitter

Réessayer en boucle toutes les secondes vide la batterie et martèle le serveur. On espace donc les tentatives de façon exponentielle (0,5 s, 1 s, 2 s, 4 s…) et on ajoute du **hasard** (*jitter*) : quand le courant revient dans un quartier, des centaines de téléphones retrouvent le réseau en même temps, et on ne veut pas qu’ils frappent tous à la même milliseconde.

~~~ts
const attendre = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const A_REESSAYER = new Set([408, 429, 500, 502, 503, 504])

export async function fetchAvecRetry(
  url: string,
  init: RequestInit = {},
  { tentatives = 5, delaiBase = 500, delaiMax = 15_000, timeout = 10_000 } = {}
): Promise<Response> {
  for (let essai = 0; ; essai++) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) })
      if (!A_REESSAYER.has(response.status) || essai >= tentatives) return response
    } catch (error) {
      if (essai >= tentatives) throw error
    }

    const plafond = Math.min(delaiMax, delaiBase * 2 ** essai)
    await attendre(Math.random() * plafond) // « full jitter »
  }
}
~~~

Quelques règles :

- On ne réessaie **que** les erreurs réseau, les timeouts, les 429 et les 5xx. Une 400 ou une 422 ne se corrigera pas toute seule.
- Si le serveur envoie un en-tête \`Retry-After\`, respectez-le.
- \`AbortSignal.timeout()\` remplace ici un éventuel \`init.signal\` ; si vous devez combiner les deux, regardez du côté d’\`AbortSignal.any()\`.

## 4. Une file d’attente pour les actions

Réessayer ne suffit pas si l’utilisateur ferme l’application. On enregistre donc chaque action sur l’appareil, avec un identifiant unique, avant même de tenter l’envoi :

~~~ts
type Action = { id: string; url: string; corps: unknown; creeLe: number }

const CLE = 'file-actions'

const lireFile = (): Action[] => JSON.parse(localStorage.getItem(CLE) ?? '[]')
const ecrireFile = (file: Action[]) => localStorage.setItem(CLE, JSON.stringify(file))

export function enregistrerAction(url: string, corps: unknown) {
  ecrireFile([...lireFile(), { id: crypto.randomUUID(), url, corps, creeLe: Date.now() }])
  void envoyerFileDAttente()
}

let envoiEnCours = false

export async function envoyerFileDAttente() {
  if (envoiEnCours) return
  envoiEnCours = true
  try {
    for (const action of lireFile()) {
      const response = await fetchAvecRetry(action.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': action.id },
        body: JSON.stringify(action.corps),
      })
      if (response.status >= 500) break // le serveur souffre : on réessaiera plus tard
      if (!response.ok) notifierEchec(action, response.status) // à vous : toast, badge…
      ecrireFile(lireFile().filter((a) => a.id !== action.id))
    }
  } catch {
    // toujours hors ligne : la file reste intacte
  } finally {
    envoiEnCours = false
  }
}
~~~

Le point essentiel est l’en-tête \`Idempotency-Key\`. Si la requête est arrivée au serveur mais que la réponse s’est perdue en route, l’application va la renvoyer. Le serveur doit reconnaître cette clé et ne **pas** créer deux livraisons.

\`localStorage\` suffit pour quelques dizaines d’actions ; au-delà, ou si vous stockez des photos, passez à IndexedDB. L’API *Background Sync* permet aussi de déclencher l’envoi en arrière-plan, mais elle n’est disponible que dans les navigateurs basés sur Chromium : gardez toujours le déclenchement manuel décrit plus haut.

## 5. Dire la vérité à l’utilisateur

Une app offline-first honnête affiche clairement l’état de chaque élément : *enregistré sur l’appareil*, *envoyé*, *échec*. Un petit bandeau « hors ligne » et un compteur d’actions en attente rassurent bien plus qu’un spinner infini.

## Tester sans quitter son bureau

Dans les DevTools de Chrome, onglet **Network**, choisissez *Offline* ou un profil lent, puis rechargez. L’onglet **Application** permet d’inspecter le Service Worker, le cache et le \`localStorage\`. Testez aussi sur un vrai téléphone, en mode avion, en plein milieu d’un envoi : c’est là qu’on découvre les vrais bugs.

Vos utilisateurs ne remarqueront jamais que votre application fonctionne hors ligne. Ils remarqueront seulement qu’elle ne les lâche pas.
`,
    comments: [
      {
        author: 'patrice-ekambi',
        after: 9,
        body: text`
Excellent. Côté serveur, pour l’\`Idempotency-Key\`, je stocke la clé avec une contrainte \`UNIQUE\` et la réponse renvoyée la première fois, pendant 24 h. Si la même clé revient, je renvoie la réponse enregistrée sans rien refaire.
`,
      },
      {
        author: 'lionel_tchak',
        after: 27,
        body: text`
Le passage sur \`navigator.onLine\` devrait être affiché en grand dans toutes les équipes. Le portail captif de l’hôtel où je travaillais la semaine dernière m’a rappelé la leçon.
`,
      },
      {
        author: 'yves_fotso',
        after: 1010,
        body: text`
La même logique d’idempotence s’applique aux paiements, j’en parle dans mon article sur le mobile money. Merci Nfor pour la file d’attente, je l’ai adaptée pour l’app de mes livreurs.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Page weight
  |--------------------------------------------------------------------------
  */
  {
    author: 'lionel_tchak',
    title: 'Alléger ses pages pour les réseaux mobiles : images, code splitting et mesures',
    excerpt:
      'La majorité de vos visiteurs arrivent sur mobile, en 3G ou en 4G capricieuse, avec un forfait qui fond à chaque mégaoctet. Méthode pas à pas pour mesurer, puis alléger vos pages.',
    tags: ['performance', 'react'],
    publishedDaysAgo: 75,
    views: 1420,
    body: text`
Chaque mégaoctet de votre page est payé par vos visiteurs, au sens propre : il est décompté de leur forfait. Une page de 5 Mo n’est pas seulement lente, elle coûte de l’argent à ceux qui la consultent. Bonne nouvelle : quelques réglages suffisent souvent à diviser son poids par trois.

## Mesurer avant de toucher quoi que ce soit

Lighthouse est intégré aux DevTools de Chrome (onglet **Lighthouse**). Par défaut, il simule un téléphone de milieu de gamme sur une connexion lente : exactement ce qu’il nous faut. On peut aussi le lancer en ligne de commande :

~~~bash
npx lighthouse https://www.example.com --only-categories=performance --view
~~~

Concentrez-vous sur les trois *Core Web Vitals* :

- **LCP** (affichage du plus gros élément) : 2,5 s maximum ;
- **INP** (réactivité aux interactions) : 200 ms maximum ;
- **CLS** (stabilité visuelle) : 0,1 maximum.

Lighthouse mesure en laboratoire. Pour connaître l’expérience réelle de vos visiteurs, collectez les mêmes métriques sur le terrain avec la bibliothèque \`web-vitals\` :

~~~js
import { onCLS, onINP, onLCP } from 'web-vitals'

function envoyer(metrique) {
  navigator.sendBeacon('/api/vitals', JSON.stringify(metrique))
}

onCLS(envoyer)
onINP(envoyer)
onLCP(envoyer)
~~~

Regardez aussi l’onglet **Network** : la colonne *Transferred* indique ce que l’utilisateur télécharge réellement.

## 1. Les images : le plus gros gisement

Sur la plupart des sites que j’audite, les images représentent plus de la moitié du poids. Quatre réflexes :

1. **Le bon format** : AVIF ou WebP, avec JPEG en secours.
2. **La bonne taille** : inutile d’envoyer une photo de 3000 px à un écran de 400 px.
3. **Des dimensions explicites** (\`width\` et \`height\`) pour éviter que la page saute pendant le chargement.
4. **Du lazy loading** sous la ligne de flottaison, mais **jamais** sur l’image principale, qui mérite au contraire \`fetchpriority="high"\`.

~~~html
<picture>
  <source
    type="image/avif"
    srcset="/img/pagne-480.avif 480w, /img/pagne-960.avif 960w"
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  <img
    src="/img/pagne-960.jpg"
    srcset="/img/pagne-480.jpg 480w, /img/pagne-960.jpg 960w"
    sizes="(max-width: 600px) 100vw, 50vw"
    width="960"
    height="640"
    alt="Pagne wax plié sur un étal"
    loading="lazy"
    decoding="async"
  />
</picture>
~~~

Pour produire les variantes, un petit script avec \`sharp\` fait l’affaire :

~~~js
import sharp from 'sharp'

for (const largeur of [480, 960]) {
  const image = sharp('pagne.jpg').resize({ width: largeur })
  await image.clone().avif({ quality: 50 }).toFile(\`pagne-\${largeur}.avif\`)
  await image.clone().jpeg({ quality: 75, mozjpeg: true }).toFile(\`pagne-\${largeur}.jpg\`)
}
~~~

## 2. Le JavaScript : n’envoyer que ce qui sert

Le JavaScript coûte deux fois : au téléchargement, puis à l’exécution sur des processeurs modestes. Le *code splitting* permet de ne charger un module que lorsqu’on en a besoin :

~~~tsx
import { lazy, Suspense, useState } from 'react'

// Le module doit exporter le composant par défaut
const CarteLivraison = lazy(() => import('./carte-livraison'))

export function Checkout() {
  const [voirCarte, setVoirCarte] = useState(false)

  return (
    <>
      <button onClick={() => setVoirCarte(true)}>Choisir sur la carte</button>
      {voirCarte && (
        <Suspense fallback={<p>Chargement de la carte…</p>}>
          <CarteLivraison />
        </Suspense>
      )}
    </>
  )
}
~~~

La carte et sa bibliothèque ne sont téléchargées que par ceux qui cliquent. Pour savoir quoi découper, visualisez votre bundle :

~~~ts
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [visualizer({ filename: 'stats.html', gzipSize: true })],
})
~~~

Les coupables habituels : une bibliothèque de dates avec toutes ses langues, une bibliothèque utilitaire importée en entier, un paquet d’icônes complet. Souvent, l’API standard suffit :

~~~js
new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(15000)
// « 15 000 FCFA »
~~~

## 3. Polices, compression et cache

- **Polices** : deux graisses au maximum, au format WOFF2, avec \`font-display: swap\`. Les polices système sont gratuites.
- **Compression** : vérifiez que le serveur envoie du Brotli ou du gzip.
- **Cache** : les fichiers dont le nom contient un hash peuvent être mis en cache un an ; le HTML, lui, doit être revalidé.

~~~bash
curl -sI -H 'Accept-Encoding: br, gzip' https://www.example.com/assets/index-3f2a1c.js \
  | grep -iE 'content-encoding|cache-control'
# content-encoding: br
# cache-control: public, max-age=31536000, immutable
~~~

Un visiteur qui revient ne retélécharge alors que ce qui a changé.

## 4. Se fixer un budget

Sans objectif chiffré, le poids remonte toujours. Pour une page produit, je vise par exemple :

- moins de 1 Mo transféré au total ;
- moins de 170 Ko de JavaScript compressé ;
- un LCP sous 2,5 s sur un Android d’entrée de gamme.

Relancez Lighthouse à chaque fonctionnalité importante, idéalement dans votre CI. Sur une boutique de pagnes que j’ai accompagnée, ces quatre étapes ont fait passer la page produit de 4,2 Mo à 780 Ko, et le LCP de 6,1 s à 2,3 s en 4G simulée. Les clients ne l’ont pas dit. Ils ont simplement commandé davantage.
`,
    comments: [
      {
        author: 'armelle_ngo',
        after: 14,
        body: text`
Merci Lionel. Petit rappel au passage : un bon \`alt\` décrit l’image pour quelqu’un qui ne la voit pas (« Pagne wax plié sur un étal »), pas son nom de fichier. Et pour une image purement décorative : \`alt=""\`.
`,
      },
      {
        author: 'grace-enow',
        after: 470,
        body: text`
J’ai appliqué la partie images sur mon portfolio : 3,1 Mo à 640 Ko. Je ne savais pas qu’il ne fallait pas mettre \`loading="lazy"\` sur l’image du haut, mon LCP a gagné presque une seconde.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Mobile money (backend)
  |--------------------------------------------------------------------------
  */
  {
    author: 'yves_fotso',
    title: 'Intégrer un paiement mobile money côté backend : webhooks, idempotence et signatures',
    excerpt:
      'Que vous passiez par l’API d’un opérateur ou par un agrégateur, les mêmes règles évitent les paiements perdus ou encaissés deux fois : machine à états, clé d’idempotence, vérification HMAC des webhooks et réconciliation.',
    tags: ['mobile-money', 'nodejs', 'securite'],
    publishedDaysAgo: 20,
    featured: true,
    views: 2980,
    body: text`
J’ai intégré le mobile money dans une dizaine de projets, via des opérateurs et via des agrégateurs. Les API changent d’un fournisseur à l’autre (noms des champs, authentification, URL), et leur documentation reste votre référence. Mais l’architecture d’une intégration fiable, elle, est toujours la même. C’est elle que décrit cet article ; les noms de champs utilisés ici sont volontairement génériques.

## Le parcours d’un paiement

1. Le client choisit le mobile money et saisit son numéro.
2. Votre backend enregistre un paiement \`PENDING\` avec une référence unique, puis appelle l’API du fournisseur.
3. Le client reçoit une demande de confirmation sur son téléphone et valide avec son code secret.
4. Le fournisseur notifie votre backend par un **webhook** : succès ou échec.
5. Vous livrez la commande. Seulement maintenant.

Règle d’or : **le navigateur ne dit jamais la vérité sur un paiement.** Une redirection vers \`/merci?status=success\` se falsifie en deux secondes. Seul votre backend, informé par le fournisseur, décide qu’une commande est payée.

## 1. Un paiement est une machine à états

~~~sql
CREATE TABLE payments (
  id             BIGSERIAL PRIMARY KEY,
  reference      UUID NOT NULL UNIQUE,              -- générée par nous
  order_id       BIGINT NOT NULL REFERENCES orders (id),
  amount         INTEGER NOT NULL CHECK (amount > 0), -- en FCFA
  phone          VARCHAR(12) NOT NULL,
  status         VARCHAR(12) NOT NULL DEFAULT 'PENDING',
  provider_tx_id VARCHAR(64) UNIQUE,                -- identifiant côté fournisseur
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
~~~

Les transitions autorisées sont simples : \`PENDING\` vers \`SUCCESSFUL\`, \`FAILED\` ou \`EXPIRED\`, et jamais de retour en arrière. Le franc CFA n’a pas de subdivision en usage : stockez des **entiers**, jamais des flottants.

## 2. Valider et normaliser le numéro

Les clients saisissent leur numéro de toutes les façons possibles. Normalisez-le avant tout appel :

~~~ts
export function normaliserNumero(saisie: string): string | null {
  const chiffres = saisie.replace(/[\s.-]/g, '')
  const resultat = /^(?:\+?237|00237)?(6\d{8})$/.exec(chiffres)
  return resultat ? \`237\${resultat[1]}\` : null
}

normaliserNumero('6 00 11 22 33') // '237600112233'
normaliserNumero('+237 600-11-22-33') // '237600112233'
normaliserNumero('12345') // null
~~~

## 3. Initier le paiement avec une référence unique

~~~ts
import { randomUUID } from 'node:crypto'

export async function initierPaiement(commande: Commande, telephone: string) {
  const reference = randomUUID()

  await db.query('INSERT INTO payments (reference, order_id, amount, phone) VALUES ($1, $2, $3, $4)', [
    reference,
    commande.id,
    commande.montant,
    telephone,
  ])

  const response = await fetch(\`\${process.env.PAYMENT_API_URL}/payments\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${await obtenirJeton()}\`,
      'Content-Type': 'application/json',
      'Idempotency-Key': reference,
    },
    body: JSON.stringify({
      amount: commande.montant,
      currency: 'XAF',
      phone: telephone,
      reference,
      callbackUrl: \`\${process.env.APP_URL}/webhooks/paiements\`,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(\`Initiation refusée par le fournisseur (\${response.status})\`)
  }
  return reference
}
~~~

Ici, \`db\` est un pool \`pg\` classique. Deux détails comptent :

- **La référence est à vous**, générée *avant* l’appel. Si le fournisseur accepte une clé d’idempotence, un nouvel essai avec la même référence ne déclenchera pas un second débit.
- **Un timeout ne veut pas dire échec.** La demande a peut-être été reçue et le client est peut-être en train de valider. Laissez le paiement en \`PENDING\` : la réconciliation tranchera (voir plus bas).

## 4. Recevoir le webhook, et le vérifier

N’importe qui peut envoyer une requête POST sur votre URL de webhook. La plupart des fournisseurs signent donc leurs notifications : ils calculent un **HMAC-SHA256** du corps de la requête avec un secret partagé et l’envoient dans un en-tête. Vous recalculez la signature et comparez.

Deux pièges : il faut signer le **corps brut**, tel qu’il est arrivé (un \`JSON.stringify(req.body)\` peut différer d’un octet), et comparer en **temps constant** pour ne rien laisser deviner.

~~~ts
import express from 'express'
import { createHmac, timingSafeEqual } from 'node:crypto'

const SECRET = process.env.WEBHOOK_SECRET ?? ''
if (SECRET.length < 32) throw new Error('WEBHOOK_SECRET manquant ou trop court')

function signatureValide(corpsBrut: Buffer, signature: string | undefined) {
  if (!signature) return false
  const attendue = createHmac('sha256', SECRET).update(corpsBrut).digest()
  const recue = Buffer.from(signature, 'hex')
  return attendue.length === recue.length && timingSafeEqual(attendue, recue)
}

const app = express()

app.post('/webhooks/paiements', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!signatureValide(req.body, req.get('X-Signature'))) {
    res.sendStatus(401)
    return
  }

  const evenement = JSON.parse(req.body.toString('utf8'))
  await traiterEvenement(evenement)
  res.sendStatus(200)
})
~~~

Le nom de l’en-tête et le format (hexadécimal, base64, horodatage inclus ou non) dépendent du fournisseur : vérifiez sa documentation. Si la signature inclut un horodatage, refusez les notifications trop anciennes pour bloquer les rejeux. Et si votre fournisseur ne signe pas ses webhooks, ne faites jamais confiance à leur contenu : utilisez-les comme un simple signal, puis interrogez son API de statut avec vos identifiants.

## 5. Idempotence : traiter chaque événement une seule fois

Les webhooks sont livrés « au moins une fois » : vous recevrez des doublons, parfois dans le désordre. La parade tient en une requête SQL, grâce à une **mise à jour conditionnelle** :

~~~ts
type Evenement = { reference: string; status: string; transactionId: string; amount: number }

async function traiterEvenement(evt: Evenement) {
  if (evt.status !== 'SUCCESSFUL' && evt.status !== 'FAILED') return // statut intermédiaire

  const { rows } = await db.query(
    \`UPDATE payments
        SET status = $1, provider_tx_id = $2, updated_at = now()
      WHERE reference = $3 AND status = 'PENDING' AND amount = $4
      RETURNING order_id\`,
    [evt.status, evt.transactionId, evt.reference, evt.amount]
  )

  // Aucune ligne : déjà traité, référence inconnue ou montant incohérent. On journalise et on s’arrête.
  if (rows.length === 0) return

  if (evt.status === 'SUCCESSFUL') {
    await marquerCommandePayee(rows[0].order_id)
  }
}
~~~

La condition \`status = 'PENDING'\` garantit qu’un seul traitement aboutit, même si deux notifications arrivent à la même seconde. Idéalement, la mise à jour du paiement et celle de la commande se font dans la même transaction.

Répondez **vite** au webhook (en quelques secondes) : les envois de SMS, d’e-mails ou de factures partent dans une file de tâches. Sinon, le fournisseur considère l’envoi comme échoué et réessaie.

## 6. La réconciliation, votre filet de sécurité

Un webhook peut se perdre : serveur redémarré pendant une coupure de courant, incident chez le fournisseur, certificat expiré. Une tâche planifiée rattrape les paiements restés en suspens :

~~~ts
// Toutes les cinq minutes (cron, file de tâches…)
const { rows } = await db.query(
  \`SELECT reference FROM payments
    WHERE status = 'PENDING' AND created_at < now() - interval '3 minutes'
    ORDER BY created_at
    LIMIT 100\`
)

for (const { reference } of rows) {
  const statut = await consulterStatutChezLeFournisseur(reference)
  await traiterEvenement(statut)
}
~~~

Au-delà d’un certain délai sans réponse définitive, passez le paiement en \`EXPIRED\` et prévenez le client. Une fois par jour, comparez vos paiements réussis avec le relevé du fournisseur.

## Check-list avant la mise en production

- Secrets (clés d’API, secret des webhooks) dans les variables d’environnement, jamais dans le code front.
- Montants en entiers, devise explicite.
- Référence unique générée par vous et contrainte \`UNIQUE\` en base.
- Signature vérifiée sur le corps brut, comparaison en temps constant.
- Mise à jour conditionnelle \`WHERE status = 'PENDING'\`.
- Webhook qui répond vite, traitements lourds en file.
- Tâche de réconciliation et expiration des paiements.
- Référence du paiement dans chaque ligne de log, numéros de téléphone partiellement masqués.
- Tests en environnement de test du fournisseur, y compris un même webhook rejoué deux fois.

Avec ces règles, vous ne livrerez jamais une commande impayée, et vous n’encaisserez jamais deux fois le même client. C’est tout ce qu’on demande à un paiement.
`,
    comments: [
      {
        author: 'junior-mbarga',
        after: 6,
        body: text`
Pour ceux qui sont sur AdonisJS : \`request.raw()\` renvoie le corps brut de la requête, pas besoin de bricoler le bodyparser pour vérifier la signature.
`,
      },
      {
        author: 'hamadou-bello',
        after: 21,
        body: text`
Question : pourquoi comparer les longueurs avant \`timingSafeEqual\` ? Ça ne fait pas fuiter une information ?
`,
      },
      {
        author: 'yves_fotso',
        after: 24,
        body: text`
\`timingSafeEqual\` lève une exception si les deux buffers n’ont pas la même longueur, d’où le test. La longueur d’un HMAC-SHA256 est publique (32 octets), donc on ne révèle rien d’utile à un attaquant.
`,
      },
      {
        author: 'patrice-ekambi',
        after: 75,
        body: text`
La tâche de réconciliation m’a sauvé le mois dernier : le serveur d’un client est resté éteint deux heures pendant un délestage. Quarante paiements validés côté fournisseur, zéro webhook reçu. Tout a été rattrapé automatiquement au redémarrage.
`,
      },
    ],
  },
]
