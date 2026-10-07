import { text, type DemoArticle } from './types.js'

export const articlesPart2: DemoArticle[] = [
  /*
  |--------------------------------------------------------------------------
  | async/await error handling
  |--------------------------------------------------------------------------
  */
  {
    author: 'patrice-ekambi',
    title: 'Gérer proprement les erreurs avec async/await',
    excerpt:
      'Promesses oubliées, fetch qui ne rejette pas sur une erreur 500, Promise.all qui échoue en bloc, try/catch partout… Les pièges courants de la gestion d’erreurs asynchrone et les réflexes qui rendent votre code fiable.',
    tags: ['javascript', 'nodejs'],
    publishedDaysAgo: 54,
    views: 1130,
    body: text`
\`async\`/\`await\` a rendu le code asynchrone lisible. Il a aussi rendu les erreurs plus faciles à… perdre. Voici les pièges que je retrouve le plus souvent en revue de code, et les réflexes qui les évitent.

## 1. Une promesse non attendue est une erreur perdue

~~~js
async function enregistrer(commande) {
  try {
    sauvegarder(commande) // oubli du await
    return 'ok'
  } catch (error) {
    journaliser(error) // ne sera jamais appelé
  }
}
~~~

Sans \`await\`, la fonction retourne \`'ok'\` avant que la sauvegarde ne soit terminée, et une éventuelle erreur échappe au \`try/catch\`. Elle devient une *unhandled rejection* : depuis Node.js 15, cela **arrête le processus** par défaut.

Laissez un outil vous surveiller : la règle \`@typescript-eslint/no-floating-promises\` signale chaque promesse ni attendue, ni retournée, ni explicitement ignorée avec \`void\`.

## 2. \`fetch\` ne rejette pas sur une erreur HTTP

\`fetch\` ne rejette que si la requête n’a pas pu aboutir (réseau coupé, DNS, CORS). Une réponse 404 ou 500 est une réponse comme une autre, avec \`response.ok === false\`. Centralisez donc la vérification :

~~~ts
export async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) {
    throw new HttpError(response.status, \`\${response.status} sur \${url}\`)
  }
  return (await response.json()) as T
}
~~~

Au passage, \`AbortSignal.timeout()\` évite d’attendre indéfiniment une réponse qui ne viendra pas, ce qui arrive vite sur un réseau mobile.

## 3. Des erreurs qui portent du sens

Une classe d’erreur dédiée permet de réagir différemment selon le cas :

~~~ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = 'HttpError'
  }
}
~~~

Et quand vous attrapez une erreur pour la relancer avec plus de contexte, gardez l’originale grâce à l’option \`cause\` (ES2022) :

~~~ts
try {
  await envoyerSMS(client.telephone, message)
} catch (error) {
  throw new Error(\`Échec de la notification de la commande \${commande.id}\`, { cause: error })
}
~~~

Node.js affiche toute la chaîne des causes dans la trace : on sait *quoi* a échoué et *pourquoi*.

## 4. Attraper au bon niveau

Entourer chaque \`await\` d’un \`try/catch\` rend le code illisible et masque souvent les erreurs. Attrapez une erreur là où vous pouvez **faire quelque chose** : réessayer, utiliser une valeur de repli, afficher un message utile. Laissez remonter le reste jusqu’à un gestionnaire central (le gestionnaire d’exceptions de votre framework, un middleware d’erreur, une *error boundary* côté React).

Attention à Express 4 : il n’attrape pas les promesses rejetées dans les routes \`async\`, il faut un petit wrapper ou passer à Express 5, qui transmet ces erreurs au middleware d’erreur.

Et un détail qui piège même les seniors :

~~~js
async function chargerProduits() {
  try {
    return await getJSON('/api/produits') // sans await, le catch ne verrait jamais l’erreur
  } catch (error) {
    journaliser(error)
    return []
  }
}
~~~

Dans un bloc \`try\`, écrivez \`return await\`, sinon la promesse est retournée telle quelle et son rejet se produit *après* la sortie du \`try\`.

## 5. \`Promise.all\`, \`allSettled\` et \`any\`

\`Promise.all\` rejette dès la première erreur, ce qui convient quand tout est nécessaire :

~~~js
const [produits, categories] = await Promise.all([getJSON('/api/produits'), getJSON('/api/categories')])
~~~

Les autres promesses continuent cependant de s’exécuter : \`Promise.all\` n’annule rien. Quand chaque opération est indépendante, préférez \`Promise.allSettled\` :

~~~js
const resultats = await Promise.allSettled(numeros.map((numero) => envoyerSMS(numero, message)))
const echecs = resultats.filter((resultat) => resultat.status === 'rejected')

console.log(\`\${echecs.length} SMS non envoyés sur \${numeros.length}\`)
~~~

\`Promise.any\`, enfin, renvoie le premier succès : pratique pour interroger plusieurs serveurs miroirs.

## 6. Le motif « Result » pour les erreurs attendues

Pour les erreurs qui font partie du fonctionnement normal (produit introuvable, solde insuffisant), un objet résultat est souvent plus clair qu’une exception :

~~~ts
type Result<T> = { ok: true; value: T } | { ok: false; error: Error }

export async function essayer<T>(promesse: Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await promesse }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

const resultat = await essayer(getJSON<Produit[]>('/api/produits'))
if (resultat.ok) {
  afficherProduits(resultat.value)
} else {
  afficherErreur('Impossible de charger les produits pour le moment.')
}
~~~

TypeScript vous oblige alors à traiter les deux cas.

## 7. Dans un \`catch\`, l’erreur est \`unknown\`

En mode \`strict\`, TypeScript type la variable du \`catch\` en \`unknown\`, et il a raison : on peut lancer n’importe quoi en JavaScript, y compris une chaîne. Vérifiez avant d’utiliser :

~~~ts
async function trouverProduit(id: string) {
  try {
    return await getJSON<Produit>(\`/api/produits/\${id}\`)
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null // cas prévu
    throw error // tout le reste remonte
  }
}
~~~

## 8. Le dernier filet

Pour ce qui passe malgré tout, journalisez avant de laisser le processus s’arrêter, puis comptez sur votre superviseur (systemd, la politique de redémarrage de Docker…) pour le relancer dans un état propre :

~~~js
process.on('unhandledRejection', (raison) => {
  logger.fatal({ raison }, 'Promesse rejetée non gérée')
  process.exit(1)
})
~~~

Côté navigateur, l’équivalent est l’événement \`unhandledrejection\` sur \`window\`, idéal pour remonter les erreurs vers votre outil de suivi.

## En résumé

- Toujours \`await\` ou retourner une promesse (et laisser ESLint vérifier).
- Vérifier \`response.ok\` après chaque \`fetch\`.
- Des erreurs typées, avec une \`cause\`.
- Attraper là où l’on peut agir, centraliser le reste.
- \`return await\` dans un \`try\`.
- \`allSettled\` pour les opérations indépendantes.

Une erreur bien gérée, c’est un incident de cinq minutes au lieu d’une nuit blanche.
`,
    comments: [
      {
        author: 'ebai-tabe',
        after: 18,
        body: text`
J’ai activé \`no-floating-promises\` sur le projet de mon stage après avoir lu ça : quatorze avertissements, dont deux vrais bugs en production. Merci !
`,
      },
      {
        author: 'hamadou-bello',
        after: 40,
        body: text`
Le \`return await\` dans un \`try\` est une question que je pose souvent en entretien. Presque personne ne connaît la réponse, alors que c’est la source de bugs bien sournois.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | AdonisJS REST API
  |--------------------------------------------------------------------------
  */
  {
    author: 'junior-mbarga',
    title: 'Démarrer une API REST avec AdonisJS',
    excerpt:
      'Routes, contrôleurs, validation, base de données : AdonisJS fournit tout ce qu’il faut pour une API Node.js solide sans assembler vingt paquets. Pas à pas, construisons l’API du catalogue d’une petite boutique.',
    tags: ['adonisjs', 'nodejs', 'typescript'],
    publishedDaysAgo: 33,
    views: 1290,
    body: text`
Quand on démarre une API Node.js avec un micro-framework, on passe la première semaine à choisir un validateur, un ORM, un système de migrations, une bibliothèque d’authentification… puis à les faire cohabiter. AdonisJS prend le parti inverse : un framework complet, écrit en TypeScript, avec des conventions claires. Pour une équipe, c’est un gain énorme : tout le monde sait où se trouve quoi.

Construisons ensemble l’API du catalogue d’une boutique : lister, créer, modifier et supprimer des produits.

## Créer le projet

~~~bash
npm init adonisjs@latest catalogue-api
~~~

L’assistant vous demande quel kit de démarrage utiliser : choisissez **API**. Ensuite :

~~~bash
cd catalogue-api
node ace serve --hmr
~~~

L’API répond sur \`http://localhost:3333\`. Les dossiers à connaître :

- \`start/routes.ts\` : les routes ;
- \`app/controllers\`, \`app/models\`, \`app/validators\` : le code métier ;
- \`database/migrations\` : l’évolution du schéma ;
- \`.env\` : la configuration, notamment l’accès à la base de données (\`DB_HOST\`, \`DB_USER\`, \`DB_DATABASE\`…).

Si Lucid, l’ORM d’AdonisJS, n’est pas encore installé dans votre projet : \`node ace add @adonisjs/lucid\`.

## La migration et le modèle

~~~bash
node ace make:model Product -m
~~~

L’option \`-m\` crée aussi une migration. Complétons-la :

~~~ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 120).notNullable()
      table.integer('price').notNullable() // en FCFA
      table.integer('stock').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
~~~

~~~bash
node ace migration:run
~~~

Depuis AdonisJS 7, Lucid génère un fichier \`database/schema.ts\` à partir de vos migrations : chaque table y devient une classe dont les colonnes sont déjà typées. Votre modèle se contente d’en hériter, et c’est là que vous ajouterez relations et méthodes :

~~~ts
// app/models/product.ts
import { ProductSchema } from '#database/schema'

export default class Product extends ProductSchema {}
~~~

Sur AdonisJS 6, on déclare les colonnes soi-même dans le modèle, avec \`@column()\` et \`@column.dateTime({ autoCreate: true })\`. Le reste de l’article s’applique aux deux versions.

## Valider les entrées avec VineJS

Ne faites jamais confiance aux données reçues. AdonisJS embarque VineJS, un validateur rapide qui infère les types TypeScript :

~~~bash
node ace make:validator product --resource
~~~

~~~ts
// app/validators/product.ts
import vine from '@vinejs/vine'

export const createProductValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  price: vine.number().withoutDecimals().positive(),
  stock: vine.number().withoutDecimals().min(0).optional(),
})

export const updateProductValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120).optional(),
  price: vine.number().withoutDecimals().positive().optional(),
  stock: vine.number().withoutDecimals().min(0).optional(),
})
~~~

Avec les versions plus anciennes de VineJS, l’équivalent s’écrit \`vine.compile(vine.object({ ... }))\`.

## Le contrôleur

~~~bash
node ace make:controller products --api
~~~

L’option \`--api\` génère les cinq méthodes d’une ressource d’API : \`index\`, \`store\`, \`show\`, \`update\` et \`destroy\`.

~~~ts
// app/controllers/products_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'

export default class ProductsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    return Product.query().orderBy('name').paginate(page, 20)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await Product.create(payload)
    return response.created(product)
  }

  async show({ params }: HttpContext) {
    return Product.findOrFail(params.id)
  }

  async update({ params, request }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const payload = await request.validateUsing(updateProductValidator)
    return product.merge(payload).save()
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.delete()
    return response.noContent()
  }
}
~~~

Remarquez ce qui **n’est pas** écrit : aucune gestion manuelle des erreurs. \`findOrFail\` renvoie automatiquement une 404 si le produit n’existe pas, et \`validateUsing\` une 422 qui liste les champs invalides.

## Les routes

~~~ts
// start/routes.ts
import router from '@adonisjs/core/services/router'

const ProductsController = () => import('#controllers/products_controller')

router
  .group(() => {
    router.resource('products', ProductsController).apiOnly()
  })
  .prefix('/api/v1')
~~~

Le contrôleur est importé paresseusement : il n’est chargé qu’à la première requête, ce qui accélère le démarrage. Vérifiez le résultat :

~~~bash
node ace list:routes
~~~

## Essayer

~~~bash
curl -X POST http://localhost:3333/api/v1/products \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"name": "Pagne wax 6 yards", "price": 15000, "stock": 12}'
~~~

Envoyez ensuite un prix négatif : la réponse 422 indique précisément quel champ pose problème et pourquoi.

## Et ensuite ?

En une heure, vous avez une API paginée, validée et typée de bout en bout. Pour aller plus loin, tout est déjà prévu dans l’écosystème :

- l’authentification par jetons d’accès avec \`@adonisjs/auth\` ;
- la limitation de débit avec \`@adonisjs/limiter\` ;
- la configuration CORS dans \`config/cors.ts\` ;
- les tests avec Japa : \`node ace test\`.

Si vous démarrez un projet backend en TypeScript, donnez-lui sa chance. Et posez vos questions dans le canal Node.js & Backend du forum, on se fera un plaisir de vous aider.
`,
    comments: [
      {
        author: 'hamadou-bello',
        after: 26,
        body: text`
Très bon tutoriel. Pour les lecteurs qui viennent d’Express : le gain le plus visible au quotidien, c’est \`validateUsing\` qui renvoie un objet déjà typé. Plus de \`req.body as any\`.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | useMemo / useCallback
  |--------------------------------------------------------------------------
  */
  {
    author: 'armelle_ngo',
    title: 'React : quand utiliser useMemo et useCallback (et quand s’en passer)',
    excerpt:
      'Mettre useMemo et useCallback partout ne rend pas une application plus rapide. Les trois situations où ils servent vraiment, comment le vérifier avec le Profiler, et ce que change le React Compiler.',
    tags: ['react', 'performance'],
    publishedDaysAgo: 12,
    views: 870,
    body: text`
En revue de code, je vois régulièrement des composants où chaque valeur est enveloppée dans un \`useMemo\` et chaque fonction dans un \`useCallback\`, « pour la performance ». Le résultat est presque toujours le même : un code plus difficile à lire, et aucun gain mesurable. Remettons ces deux hooks à leur place.

## Ce qu’ils font vraiment

- \`useMemo(calcul, deps)\` mémorise le **résultat** d’un calcul entre deux rendus, tant que les dépendances ne changent pas.
- \`useCallback(fn, deps)\` mémorise la **fonction** elle-même. C’est exactement \`useMemo(() => fn, deps)\`.

Les dépendances sont comparées avec \`Object.is\`. Ces hooks n’accélèrent pas le premier rendu ; ils ajoutent même un léger coût (comparaison des dépendances, mémoire). Ils ne sont utiles que si ce qu’ils évitent coûte plus cher que ce qu’ils coûtent.

## Cas n° 1 : un calcul réellement coûteux

~~~tsx
type Transaction = { id: string; libelle: string; montant: number; date: number }

function Releve({ transactions, filtre }: { transactions: Transaction[]; filtre: string }) {
  const visibles = useMemo(() => {
    const recherche = filtre.toLowerCase()
    return transactions
      .filter((t) => t.libelle.toLowerCase().includes(recherche))
      .sort((a, b) => b.date - a.date)
  }, [transactions, filtre])

  return <TableTransactions transactions={visibles} />
}
~~~

Filtrer et trier quelques milliers de transactions à chaque frappe peut se sentir sur un téléphone d’entrée de gamme. Comment savoir ? On mesure :

~~~ts
console.time('filtrage')
const visibles = filtrerEtTrier(transactions, filtre)
console.timeEnd('filtrage')
~~~

Activez le ralentissement du processeur (×4 ou ×6) dans l’onglet **Performance** des DevTools : la plupart de vos utilisateurs n’ont pas votre ordinateur. Si le temps mesuré dépasse régulièrement la milliseconde, \`useMemo\` est justifié.

## Cas n° 2 : une référence stable pour un composant mémoïsé

~~~tsx
const LigneTransaction = memo(function LigneTransaction({
  transaction,
  onAnnuler,
}: {
  transaction: Transaction
  onAnnuler: (id: string) => void
}) {
  return (
    <li>
      {transaction.libelle}
      <button onClick={() => onAnnuler(transaction.id)}>Annuler</button>
    </li>
  )
})

function Historique({ transactions }: { transactions: Transaction[] }) {
  const [recherche, setRecherche] = useState('')

  const annuler = useCallback((id: string) => {
    void annulerTransaction(id)
  }, [])

  return (
    <>
      <input value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      <ul>
        {transactions.map((t) => (
          <LigneTransaction key={t.id} transaction={t} onAnnuler={annuler} />
        ))}
      </ul>
    </>
  )
}
~~~

À chaque frappe, \`Historique\` se rend à nouveau. \`memo\` permet aux lignes de ne pas suivre, **à condition** que leurs props ne changent pas. Sans \`useCallback\`, \`annuler\` serait une nouvelle fonction à chaque rendu, et \`memo\` ne servirait à rien. Retenez le couple : \`memo\` sur l’enfant, \`useCallback\` dans le parent. L’un sans l’autre est inutile.

## Cas n° 3 : une dépendance d’effet

~~~tsx
function SuiviPaiement({ reference }: { reference: string }) {
  const options = useMemo(() => ({ reference, intervalle: 5000 }), [reference])

  useEffect(() => {
    const abonnement = suivrePaiement(options)
    return () => abonnement.arreter()
  }, [options])

  // ...
}
~~~

Sans \`useMemo\`, l’objet \`options\` serait recréé à chaque rendu et l’effet se relancerait sans cesse. Mais il existe souvent mieux : créer l’objet **dans** l’effet et ne dépendre que de \`reference\`, une chaîne, stable par nature. Et si l’objet ne dépend de rien, déclarez-le hors du composant : une référence stable, gratuitement.

## Quand s’en passer

- **Les calculs triviaux** : \`prix * quantite\`, un \`.map\` sur vingt éléments.
- **Les fonctions passées à un élément natif** (\`<button onClick>\`) : il n’y a rien à mémoïser de l’autre côté.
- **Les enfants qui ne sont pas enveloppés dans \`memo\`** : ils se rendront de toute façon.
- **Les dépendances qui changent à chaque rendu** : la mémoïsation ne sert alors jamais.

Avant de mémoïser, demandez-vous si la structure peut éviter le problème : descendre l’état au plus près de l’endroit où il sert, ou passer les parties lourdes en \`children\` pour qu’elles ne dépendent pas de l’état du parent.

## Vérifier avec le Profiler

Dans les React DevTools, l’onglet **Profiler** enregistre une interaction et montre quels composants se sont rendus, et combien de temps cela a pris. Cochez l’option *Record why each component rendered while profiling* dans ses réglages : vous saurez quelle prop a changé. C’est l’outil qui tranche les débats de revue de code.

## Et le React Compiler ?

Le React Compiler, désormais stable, ajoute automatiquement cette mémoïsation au moment du build. Si votre projet l’utilise, la plupart des \`useMemo\` et \`useCallback\` écrits à la main deviennent superflus ; gardez-les pour les rares cas où vous avez besoin d’un contrôle précis, comme une dépendance d’effet. S’il n’est pas activé, les règles ci-dessus restent valables.

## Ma règle de poche

1. Écrire le composant sans mémoïsation.
2. Mesurer si quelque chose est lent, sur un appareil modeste.
3. Corriger d’abord la structure.
4. Mémoïser seulement là où le Profiler montre un gain réel.

Un code simple et mesuré bat toujours un code « optimisé » à l’aveugle.
`,
    comments: [
      {
        author: 'mireille-ondoa',
        after: 5,
        body: text`
L’option *Record why each component rendered* a mis fin à un débat de deux jours dans mon équipe. Merci pour le rappel sur le couple \`memo\` + \`useCallback\`, c’est l’erreur que je vois le plus.
`,
      },
      {
        author: 'grace-enow',
        after: 31,
        body: text`
Question de débutante : pour le \`onChange\` de l’input dans votre exemple, il faudrait aussi un \`useCallback\` ?
`,
      },
      {
        author: 'armelle_ngo',
        after: 34,
        body: text`
Non, et c’est une très bonne question. L’\`input\` est un élément natif : React ne compare pas ses props pour éviter un rendu. Un \`useCallback\` coûterait un peu sans rien éviter.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Vitest
  |--------------------------------------------------------------------------
  */
  {
    author: 'ebai-tabe',
    title: 'Écrire ses premiers tests avec Vitest',
    excerpt:
      'Installer Vitest, écrire des tests lisibles, simuler le temps et les appels réseau, mesurer la couverture : un guide concret, avec les erreurs que j’ai faites pendant mon stage pour que vous ne les fassiez pas.',
    tags: ['tests', 'typescript'],
    publishedDaysAgo: 27,
    views: 740,
    body: text`
Au début de mon stage, ma définition d’un test, c’était « j’ouvre la page et je clique partout ». Puis une correction de dernière minute a cassé le calcul des frais de livraison en production, et j’ai compris. Voici ce que j’aurais aimé lire ce jour-là.

## Pourquoi Vitest ?

Vitest est un framework de test rapide, qui comprend TypeScript et les modules ES sans configuration, et réutilise la configuration de Vite si vous en avez une. Son API est compatible avec celle de Jest : ce que vous apprenez ici vous servira ailleurs. Et il fonctionne très bien dans un projet qui n’utilise pas Vite.

## Installation

~~~bash
npm install -D vitest
~~~

Dans \`package.json\` :

~~~json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
~~~

\`npm test\` lance le mode surveillance : les tests concernés sont relancés à chaque sauvegarde. \`vitest run\` exécute tout une seule fois, ce qu’on veut en intégration continue.

## Un premier test

La fonction à tester :

~~~ts
// src/livraison.ts
const TARIFS: Record<string, number> = { Douala: 1000, Yaounde: 1500 }

export function fraisDeLivraison(ville: string, montantPanier: number): number {
  if (montantPanier < 0) throw new RangeError('Montant invalide')
  if (montantPanier >= 50_000) return 0
  return TARIFS[ville] ?? 2500
}
~~~

Et ses tests, dans un fichier voisin qui se termine par \`.test.ts\` :

~~~ts
// src/livraison.test.ts
import { describe, expect, it } from 'vitest'
import { fraisDeLivraison } from './livraison'

describe('fraisDeLivraison', () => {
  it('applique le tarif de la ville', () => {
    expect(fraisDeLivraison('Douala', 10_000)).toBe(1000)
  })

  it('offre la livraison à partir de 50 000 FCFA', () => {
    expect(fraisDeLivraison('Yaounde', 50_000)).toBe(0)
  })

  it('applique un tarif par défaut aux autres villes', () => {
    expect(fraisDeLivraison('Kribi', 10_000)).toBe(2500)
  })

  it('refuse un montant négatif', () => {
    expect(() => fraisDeLivraison('Douala', -1)).toThrow(RangeError)
  })
})
~~~

Chaque titre décrit un **comportement**, en français, pas un détail d’implémentation. Quand un test échoue, son nom doit suffire à comprendre ce qui est cassé.

## \`it.each\` pour les tableaux de cas

~~~ts
it.each([
  ['Douala', 1000],
  ['Yaounde', 1500],
  ['Garoua', 2500],
])('livraison à %s : %i FCFA', (ville, frais) => {
  expect(fraisDeLivraison(ville, 10_000)).toBe(frais)
})
~~~

## \`toBe\` ou \`toEqual\` ?

\`toBe\` compare avec \`Object.is\` : parfait pour les nombres et les chaînes. Pour des objets ou des tableaux, utilisez \`toEqual\`, qui compare le contenu. \`expect({ total: 0 }).toBe({ total: 0 })\` échoue : ce sont deux objets différents.

## Tester du code asynchrone

~~~ts
// src/api.ts
export async function chargerProduit(id: string) {
  const response = await fetch(\`/api/produits/\${id}\`)
  if (response.status === 404) throw new Error(\`Produit \${id} introuvable\`)
  if (!response.ok) throw new Error(\`Erreur \${response.status}\`)
  return (await response.json()) as { id: string; nom: string }
}
~~~

Pour ne pas dépendre du réseau, on remplace \`fetch\` par un espion :

~~~ts
// src/api.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chargerProduit } from './api'

describe('chargerProduit', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renvoie le produit', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ id: 'p1', nom: 'Pagne wax' })))

    const produit = await chargerProduit('p1')

    expect(fetchMock).toHaveBeenCalledWith('/api/produits/p1')
    expect(produit).toEqual({ id: 'p1', nom: 'Pagne wax' })
  })

  it('signale un produit introuvable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }))

    await expect(chargerProduit('inconnu')).rejects.toThrow('introuvable')
  })
})
~~~

Le \`await\` devant \`expect(...).rejects\` est indispensable. Sans lui, selon la version, vous obtenez au mieux un avertissement, au pire un test vert qui ne vérifie rien.

## Simuler le temps

Un code de confirmation qui expire au bout de cinq minutes ? Inutile d’attendre cinq minutes :

~~~ts
// src/otp.ts
import { randomInt } from 'node:crypto'

const DUREE = 5 * 60 * 1000

export function genererOTP() {
  return { code: String(randomInt(100_000, 1_000_000)), expireA: Date.now() + DUREE }
}

export function estValide(otp: { expireA: number }) {
  return Date.now() <= otp.expireA
}
~~~

~~~ts
// src/otp.test.ts
import { afterEach, expect, it, vi } from 'vitest'
import { estValide, genererOTP } from './otp'

afterEach(() => {
  vi.useRealTimers()
})

it('expire le code après cinq minutes', () => {
  vi.useFakeTimers()
  const otp = genererOTP()

  vi.advanceTimersByTime(5 * 60 * 1000)
  expect(estValide(otp)).toBe(true)

  vi.advanceTimersByTime(1)
  expect(estValide(otp)).toBe(false)
})
~~~

Avec les faux minuteurs, \`Date.now()\` avance en même temps que les timers : le test s’exécute en quelques millisecondes.

## La couverture

~~~bash
npm install -D @vitest/coverage-v8
npx vitest run --coverage
~~~

Le rapport montre les lignes jamais exécutées par vos tests. C’est une boussole, pas un objectif : 100 % de couverture avec des assertions faibles ne protège de rien.

## La configuration minimale

~~~ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node', // 'jsdom' ou 'happy-dom' pour tester des composants
    coverage: { reporter: ['text', 'html'] },
  },
})
~~~

## Mes erreurs de stagiaire

- **Tester l’implémentation** (« la fonction interne a été appelée trois fois ») au lieu du comportement (« le total est correct »). Au premier refactoring, tout casse.
- **Des tests qui dépendent les uns des autres** à cause d’un état partagé. Chaque test doit pouvoir s’exécuter seul.
- **Oublier \`await\`** devant une assertion asynchrone.
- **Tout simuler** : à force de remplacer chaque dépendance, le test finit par ne plus rien tester.

Commencez petit : la prochaine fois que vous corrigez un bug, écrivez d’abord le test qui le reproduit. C’est le meilleur moyen de ne jamais le revoir.
`,
    comments: [
      {
        author: 'christelle_k',
        after: 11,
        body: text`
Bravo Ebai, c’est exactement le niveau de détail qu’il faut pour débuter. Je le recommande à mes apprenants dès cette semaine.
`,
      },
      {
        author: 'junior-mbarga',
        after: 46,
        body: text`
Pour ceux qui sont sur AdonisJS, le framework de test intégré s’appelle Japa : la logique est la même (\`test()\`, \`assert\`), et il sait démarrer l’application pour les tests d’API.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Job interview
  |--------------------------------------------------------------------------
  */
  {
    author: 'hamadou-bello',
    title: 'Préparer un entretien de développeur JavaScript',
    excerpt:
      'Questions de fond, exercice de code en direct, test technique à la maison, entretien à distance avec une connexion capricieuse : ce que j’ai appris en faisant passer et en passant des dizaines d’entretiens.',
    tags: ['carriere', 'javascript'],
    publishedDaysAgo: 5,
    views: 410,
    body: text`
En huit ans, j’ai passé une trentaine d’entretiens techniques et j’en ai fait passer bien davantage, pour des entreprises locales comme pour des équipes à l’étranger. Les candidats qui échouent ne manquent presque jamais de talent : ils manquent de préparation. Voici la mienne.

## 1. Les fondamentaux reviennent toujours

Frameworks et outils changent, les questions de fond restent :

- portée des variables et closures ;
- \`this\`, prototypes et classes ;
- \`==\` contre \`===\`, valeurs et références ;
- l’asynchrone : boucle d’événements, promesses, \`async\`/\`await\` ;
- les méthodes de tableaux (\`map\`, \`filter\`, \`reduce\`) ;
- la gestion des erreurs.

Un classique absolu, que je pose encore : dans quel ordre s’affichent les lettres ?

~~~js
console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
queueMicrotask(() => console.log('D'))
console.log('E')
~~~

Réponse : **A, E, C, D, B**. Le code synchrone s’exécute d’abord (A, E). Viennent ensuite les *microtâches* (callbacks de promesses, \`queueMicrotask\`), dans l’ordre où elles ont été planifiées (C, D). Les *tâches* comme les timers passent en dernier (B), même avec un délai de 0. Expliquer le **pourquoi** compte plus que la réponse.

Autre favori, les références :

~~~js
const panier = { total: 0 }
const copie = panier
copie.total = 5000

console.log(panier.total) // 5000 : les deux variables désignent le même objet

const vraieCopie = structuredClone(panier) // copie profonde
~~~

## 2. L’exercice de code en direct

On ne vous juge pas seulement sur le résultat, mais sur votre façon de raisonner. Ma méthode :

1. **Reformuler** le problème avec vos mots.
2. **Poser des questions** : quelles entrées ? quels cas limites ? quelle taille de données ?
3. **Commencer simple**, même naïf, puis améliorer.
4. **Penser à voix haute** : un silence de dix minutes ne laisse rien à évaluer.
5. **Tester** avec deux ou trois exemples, dont un cas limite.

Exercice fréquent : écrire une fonction \`debounce\`.

~~~js
function debounce(fn, delai) {
  let minuteur

  return function (...args) {
    clearTimeout(minuteur)
    minuteur = setTimeout(() => fn.apply(this, args), delai)
  }
}

const rechercher = debounce((texte) => console.log('Recherche :', texte), 300)
~~~

Les points que l’examinateur attend : la closure qui garde le minuteur, la transmission des arguments, et la préservation de \`this\` (d’où la \`function\` classique plutôt qu’une fonction fléchée pour l’enveloppe).

Autre grand classique, regrouper des données :

~~~js
const ventes = [
  { ville: 'Douala', montant: 15000 },
  { ville: 'Yaoundé', montant: 8000 },
  { ville: 'Douala', montant: 4500 },
]

const totalParVille = ventes.reduce((acc, vente) => {
  acc[vente.ville] = (acc[vente.ville] ?? 0) + vente.montant
  return acc
}, {})
// { Douala: 19500, Yaoundé: 8000 }
~~~

Mentionner qu’\`Object.groupBy\` existe désormais (il regroupe les éléments, sans les additionner) montre que vous suivez l’évolution du langage.

## 3. Le test technique à la maison

- **Un README** : comment lancer le projet, vos choix, ce que vous feriez avec plus de temps.
- **Des commits petits et clairs** : on lira votre historique.
- **Quelques tests** sur la logique importante.
- **Pas de sur-ingénierie** : une architecture hexagonale pour trois écrans dessert plus qu’elle ne sert.
- **Respectez le temps annoncé.** Rendre en douze heures un test prévu pour trois n’impressionne personne.

Si vous utilisez un assistant d’IA, assumez-le si l’on vous pose la question, et surtout comprenez chaque ligne : on vous demandera de modifier votre code en direct.

## 4. L’entretien à distance depuis le Cameroun

C’est là que beaucoup de bons profils perdent des points pour de mauvaises raisons :

- **Testez votre connexion trente minutes avant**, et prévoyez une solution de secours : partage de connexion 4G, forfait chargé.
- **Anticipez le délestage** : ordinateur chargé à 100 %, onduleur si vous en avez un.
- **Dites-le dès le début** : « Si la connexion coupe, je reviens immédiatement par le même lien. » Personne ne vous en voudra d’une coupure ; on vous en voudra de disparaître sans prévenir.
- **Coupez la vidéo** si elle fige : l’audio passe beaucoup mieux sur une connexion faible.
- **Vérifiez le fuseau horaire.** Le Cameroun est à UTC+1 toute l’année. En été, Paris est à UTC+2 : un entretien « à 10 h, heure de Paris » commence à 9 h chez nous.
- Un endroit calme et un casque : les bruits de la rue passent très bien dans un micro.

## 5. Les questions que vous posez

Un entretien se passe dans les deux sens. Préparez vos questions :

- Comment se passent les revues de code ? Qui déploie, et comment ?
- Comment un nouveau développeur est-il accompagné les premières semaines ?
- Pour un poste à distance : quelles heures de chevauchement ? Comment et dans quelle devise êtes-vous payé ?
- Le matériel, l’électricité et la connexion sont-ils pris en charge ?

## 6. Parler salaire

Renseignez-vous avant : la discussion sur les salaires du forum est un bon point de départ. Donnez une **fourchette** plutôt qu’un chiffre unique, et raisonnez en rémunération totale : prise en charge de la connexion, assurance santé, congés, formation.

## La check-list de la veille

- Relire l’offre et ce que fait l’entreprise.
- Préparer deux ou trois projets à raconter : le problème, vos choix, le résultat.
- Écrire vos questions.
- Charger ordinateur et téléphone, tester la connexion.
- Dormir. Sérieusement.

Bonne chance. Et quand vous aurez décroché le poste, revenez raconter comment ça s’est passé : c’est comme ça qu’une communauté grandit.
`,
    comments: [
      {
        author: 'aissatou-oumarou',
        after: 7,
        body: text`
Merci beaucoup, je prépare mon premier entretien de stage et je ne savais pas qu’on pouvait annoncer les coupures dès le début. J’ai répondu A, E, C, B, D… je vais relire la partie sur les microtâches.
`,
      },
      {
        author: 'yves_fotso',
        after: 22,
        body: text`
J’ajoute pour les freelances : en entretien avec un client, posez aussi la question du mode de paiement et des délais. Un client qui hésite à répondre sur ce point, c’est un signal.
`,
      },
      {
        author: 'grace-enow',
        after: 49,
        body: text`
La partie sur le fuseau horaire m’a fait sourire : j’ai raté un entretien l’an dernier exactement pour cette raison. Une heure d’avance sur moi, l’examinateur m’attendait déjà.
`,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Draft (not published)
  |--------------------------------------------------------------------------
  */
  {
    author: 'patrice-ekambi',
    title: 'Déployer une application Node.js sur un VPS avec Docker Compose',
    excerpt:
      'Un Dockerfile multi-étapes, un fichier Compose, un reverse proxy avec HTTPS automatique : la configuration minimale et robuste que j’utilise pour mes clients.',
    tags: ['devops', 'nodejs'],
    publishedDaysAgo: null,
    createdDaysAgo: 3,
    views: 0,
    body: text`
*Brouillon : il manque encore les sauvegardes automatiques et la partie CI.*

Un VPS avec 2 Go de mémoire suffit largement pour une application Node.js et sa base PostgreSQL. Voici la configuration que je déploie chez mes clients, avec une application AdonisJS dont le build sort dans \`build/\`.

## Le Dockerfile

~~~dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/build ./
RUN npm ci --omit=dev
USER node
EXPOSE 3333
CMD ["node", "bin/server.js"]
~~~

Deux étapes : la première installe tout et compile, la seconde ne garde que le résultat et les dépendances de production. L’image finale est bien plus légère, et elle ne tourne pas en root.

## Le fichier Compose

~~~yaml
services:
  app:
    build: .
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U app']
      interval: 5s
      retries: 10

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data

volumes:
  pgdata:
  caddy_data:
~~~

Dans \`.env.production\`, pensez à \`HOST=0.0.0.0\` : à l’intérieur d’un conteneur, une application qui écoute sur \`localhost\` n’est joignable par personne.

## Le Caddyfile

~~~
api.example.com {
  reverse_proxy app:3333
}
~~~

Caddy obtient et renouvelle seul le certificat HTTPS, à condition que le nom de domaine pointe déjà vers le serveur.

## Mise en route

~~~bash
docker compose up -d --build
docker compose exec app node ace migration:run --force
docker compose logs -f app
~~~

## À compléter

- Sauvegarde quotidienne avec \`pg_dump\`, copiée hors du serveur.
- Déploiement automatique depuis la CI.
- Surveillance de l’espace disque.
`,
  },
]
