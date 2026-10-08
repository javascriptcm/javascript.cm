import { text, type DemoThread } from './types.js'

/**
 * Forum threads. "after" on replies = hours after the thread was opened.
 * 9 of 14 are solved, one is pinned (the forum guide), one is locked.
 */
export const threads: DemoThread[] = [
  /*
  | Pinned guide
  */
  {
    author: 'armelle_ngo',
    channel: 'debutants',
    title: 'Comment bien poser sa question sur le forum',
    daysAgo: 88,
    hour: 9,
    views: 1260,
    pinned: true,
    body: text`
Bienvenue sur le forum ! Ici, personne n’est payé pour répondre : chacun donne un peu de son temps. Une question claire obtient une réponse rapide et précise ; une question floue reste souvent sans réponse. Voici comment mettre toutes les chances de votre côté.

## 1. Un titre qui résume le problème

- À éviter : « Aide svp urgent », « Problème React ».
- Préférez : « Express : erreur CORS quand mon front Vite appelle l’API ».

Un bon titre permet aux bonnes personnes de repérer votre sujet, et aux suivants de le retrouver.

## 2. Le contexte

- Ce que vous essayez de faire, en une ou deux phrases.
- Les versions utilisées : \`node -v\`, version du framework, système d’exploitation.
- Où le problème apparaît : en local, en production, sur un téléphone précis…

## 3. Le message d’erreur exact, en texte

Copiez-collez l’erreur **complète** dans un bloc de code. Pas de capture d’écran floue, et par pitié, pas de photo de l’écran prise au téléphone : on ne peut ni la lire correctement, ni la rechercher.

~~~~md
Quand je lance \`npm run dev\`, j’obtiens :

~~~
Error: Cannot find module 'express'
~~~
~~~~

## 4. Un exemple minimal

Partagez le plus petit morceau de code qui reproduit le problème, pas tout votre projet. Bien souvent, en le préparant, vous trouverez la solution vous-même.

## 5. Ce que vous avez déjà essayé

« J’ai réinstallé les dépendances, vérifié le port, testé dans Postman » : cela évite qu’on vous propose ce qui n’a pas marché.

## Après la réponse

- Marquez comme **solution** la réponse qui vous a débloqué : elle remontera pour les prochains lecteurs.
- Si vous avez trouvé seul, publiez votre solution. Le « c’est bon, résolu » sans explication est la tristesse des forums.

## Sécurité et courtoisie

- Ne publiez **jamais** de fichier \`.env\`, de clé d’API, de mot de passe ou de numéro de téléphone complet.
- Restez courtois, même quand vous êtes frustré. Les débutants sont les bienvenus : il n’y a pas de question bête.

Bon code à toutes et à tous, et merci de faire vivre ce forum.
`,
    replies: [
      {
        author: 'junior-mbarga',
        after: 3,
        body: text`
Merci Armelle. J’ajoute une astuce : avant de poster, cherchez votre message d’erreur dans le forum. Beaucoup de problèmes (CORS, variables d’environnement…) ont déjà une solution détaillée.
`,
      },
      {
        author: 'christelle_k',
        after: 26,
        body: text`
Je vais envoyer ce sujet à toutes mes promotions. Le point 4 est le plus important : préparer un exemple minimal, c’est déjà déboguer.
`,
      },
      {
        author: 'grace-enow',
        after: 816,
        body: text`
Lu avant de publier ma première question. Merci pour l’accueil, ça rassure quand on débute.
`,
      },
    ],
  },

  /*
  | Cannot read properties of undefined
  */
  {
    author: 'grace-enow',
    channel: 'debutants',
    title:
      "TypeError: Cannot read properties of undefined (reading 'map') dans mon composant React",
    daysAgo: 40,
    hour: 21,
    views: 312,
    body: text`
Bonsoir à tous. Je débute avec React (je sors d’un bootcamp) et je bloque depuis deux heures. Ma page plante au chargement avec cette erreur dans la console :

~~~
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at ListeProduits (ListeProduits.jsx:14:22)
~~~

Mon composant :

~~~jsx
import { useEffect, useState } from 'react'

export default function ListeProduits() {
  const [produits, setProduits] = useState()

  useEffect(() => {
    fetch('https://api.example.com/produits')
      .then((res) => res.json())
      .then((data) => setProduits(data))
  }, [])

  return (
    <ul>
      {produits.map((p) => (
        <li key={p.id}>{p.nom}</li>
      ))}
    </ul>
  )
}
~~~

Dans l’onglet Network, la requête fonctionne et la réponse ressemble à ceci :

~~~json
{ "data": [{ "id": 1, "nom": "Sac en raphia" }], "total": 42 }
~~~

Qu’est-ce que je rate ?
`,
    replies: [
      {
        author: 'nfor_ngwa',
        after: 1.5,
        body: text`
Au premier rendu, \`produits\` vaut \`undefined\` : le \`fetch\` n’est pas encore terminé. Essayez \`useState([])\`.
`,
      },
      {
        author: 'armelle_ngo',
        after: 2,
        solution: true,
        body: text`
Bonsoir Grace, votre question est parfaitement posée. Il y a en fait **deux** problèmes.

**1. Le premier rendu a lieu avant la réponse.** \`useEffect\` s’exécute *après* l’affichage. Au premier rendu, \`produits\` vaut donc \`undefined\`, d’où l’erreur. Comme le dit Nfor, initialisez avec un tableau vide.

**2. L’API ne renvoie pas un tableau**, mais un objet \`{ data: [...], total }\`. Une fois le premier problème corrigé, vous auriez eu \`produits.map is not a function\`. Il faut stocker \`data.data\`.

Je vous propose aussi de gérer le chargement et les erreurs, et d’annuler la requête si le composant disparaît :

~~~jsx
import { useEffect, useState } from 'react'

export default function ListeProduits() {
  const [produits, setProduits] = useState([])
  const [etat, setEtat] = useState('chargement')

  useEffect(() => {
    const controleur = new AbortController()

    fetch('https://api.example.com/produits', { signal: controleur.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`Erreur \${res.status}\`)
        return res.json()
      })
      .then((reponse) => {
        setProduits(reponse.data)
        setEtat('pret')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setEtat('erreur')
      })

    return () => controleur.abort()
  }, [])

  if (etat === 'chargement') return <p>Chargement…</p>
  if (etat === 'erreur') return <p>Impossible de charger les produits.</p>

  return (
    <ul>
      {produits.map((p) => (
        <li key={p.id}>{p.nom}</li>
      ))}
    </ul>
  )
}
~~~

Réflexe à prendre : quand une erreur parle de \`undefined\`, faites un \`console.log\` de la valeur juste avant la ligne qui plante. Vous verrez immédiatement sa forme réelle.
`,
      },
      {
        author: 'grace-enow',
        after: 3,
        body: text`
Merci beaucoup à vous deux ! C’était bien les deux problèmes : après \`useState([])\`, j’ai eu exactement l’erreur \`produits.map is not a function\`. Avec \`reponse.data\`, tout s’affiche. Je garde la version avec le chargement.
`,
      },
    ],
  },

  /*
  | setTimeout in a loop
  */
  {
    author: 'aissatou-oumarou',
    channel: 'javascript',
    title: 'setTimeout dans une boucle for : pourquoi j’obtiens 3 3 3 au lieu de 0 1 2 ?',
    daysAgo: 18,
    hour: 22,
    views: 205,
    body: text`
Bonsoir. Je m’entraîne sur les boucles et je ne comprends pas ce résultat :

~~~js
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i)
  }, 1000)
}
~~~

J’attendais \`0 1 2\`, j’obtiens \`3 3 3\`. Je pensais que \`setTimeout\` « gardait » la valeur au moment de l’appel. Quelqu’un peut m’expliquer ?
`,
    replies: [
      {
        author: 'christelle_k',
        after: 1,
        solution: true,
        body: text`
Bonsoir Aïssatou, c’est un grand classique, et une excellente question.

\`setTimeout\` ne garde pas la *valeur* de \`i\`, il garde la *fonction*, qui elle-même se souvient de la *variable* \`i\` (c’est une closure). Or avec \`var\`, il n’existe qu’**une seule** variable \`i\` pour toute la boucle. Les trois fonctions s’exécutent une seconde plus tard, quand la boucle est terminée et que \`i\` vaut 3.

Avec \`let\`, JavaScript crée une **nouvelle** variable \`i\` à chaque tour de boucle. Chaque fonction capture la sienne :

~~~js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000)
}
// 0 1 2
~~~

Règle simple : utilisez \`const\` par défaut, \`let\` quand la valeur doit changer, et oubliez \`var\`. J’ai détaillé ce mécanisme dans l’article [Les closures expliquées avec une tontine](/articles/les-closures-expliquees-avec-une-tontine), la dernière partie traite exactement de ce cas.
`,
      },
      {
        author: 'ebai-tabe',
        after: 2,
        body: text`
Pour compléter : avant l’arrivée de \`let\`, on contournait le problème avec une fonction appelée immédiatement, qui créait une nouvelle portée à chaque tour. Vous la croiserez dans du vieux code :

~~~js
for (var i = 0; i < 3; i++) {
  ;(function (j) {
    setTimeout(() => console.log(j), 1000)
  })(i)
}
~~~

\`j\` est un paramètre, donc une nouvelle variable à chaque appel : même principe que \`let\`, en plus verbeux.
`,
      },
      {
        author: 'aissatou-oumarou',
        after: 12,
        body: text`
Merci à vous deux, c’est beaucoup plus clair. J’ai lu l’article sur la tontine dans la foulée, j’ai enfin compris ce qu’est une closure.
`,
      },
    ],
  },

  /*
  | Hydration mismatch
  */
  {
    author: 'lionel_tchak',
    channel: 'react',
    title: 'Next.js : « Hydration failed » à cause d’une heure affichée',
    daysAgo: 47,
    hour: 10,
    views: 488,
    body: text`
Sur une page produit Next.js (App Router), j’affiche l’heure de la dernière mise à jour du stock. En local, aucun souci. Sur notre serveur de préproduction (hébergé en Europe), la console du navigateur affiche :

~~~
Error: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch \`if (typeof window !== 'undefined')\`.
- Variable input such as \`Date.now()\` or \`Math.random()\` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
~~~

Le composant :

~~~tsx
'use client'

export function DerniereMaj({ date }: { date: string }) {
  return <p>Stock mis à jour à {new Date(date).toLocaleTimeString('fr-FR')}</p>
}
~~~

Je ne vois pas ce qui diffère entre le serveur et le client : la date est la même.
`,
    replies: [
      {
        author: 'armelle_ngo',
        after: 2,
        solution: true,
        body: text`
La date est la même, mais pas le **fuseau horaire**. Votre serveur de préproduction tourne très probablement en UTC, alors que votre navigateur est réglé sur l’heure du Cameroun (UTC+1). Le serveur affiche « 09:30:00 », le navigateur calcule « 10:30:00 » : le HTML diffère, l’hydratation échoue. En local, les deux partagent votre fuseau, d’où l’absence d’erreur.

**Solution 1 : rendre le formatage déterministe.** Fixez la locale *et* le fuseau, le serveur et le client produiront la même chaîne :

~~~tsx
const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  timeStyle: 'short',
  timeZone: 'Africa/Douala',
})

export function DerniereMaj({ date }: { date: string }) {
  return (
    <p>
      Stock mis à jour à <time dateTime={date}>{formatHeure.format(new Date(date))}</time>
    </p>
  )
}
~~~

Ce composant n’a même plus besoin d’être un Client Component.

**Solution 2 : afficher l’heure locale du visiteur**, après le montage seulement :

~~~tsx
'use client'

import { useEffect, useState } from 'react'

export function HeureLocale({ date }: { date: string }) {
  const [texte, setTexte] = useState<string | null>(null)

  useEffect(() => {
    setTexte(new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  }, [date])

  return <time dateTime={date}>{texte ?? '…'}</time>
}
~~~

Le serveur et le premier rendu client affichent « … », puis l’heure locale apparaît.
`,
      },
      {
        author: 'mireille-ondoa',
        after: 5,
        body: text`
On voit souvent conseiller \`suppressHydrationWarning\` pour ce cas. Attention : il ne fonctionne que sur un niveau, et React ne corrige pas le texte. Le visiteur garde donc l’heure calculée par le serveur, en UTC. Acceptable pour un horodatage approximatif, pas pour une heure de livraison.
`,
      },
      {
        author: 'lionel_tchak',
        after: 7,
        body: text`
C’était bien ça : le conteneur de préproduction est en UTC. J’ai pris la solution 1 avec \`timeZone: 'Africa/Douala'\`, plus aucune erreur, et le composant redevient un Server Component. Merci Armelle, et merci Mireille pour la nuance.
`,
      },
    ],
  },

  /*
  | CORS
  */
  {
    author: 'ebai-tabe',
    channel: 'backend',
    title: 'Erreur CORS entre mon front Vite et mon API Express',
    daysAgo: 70,
    hour: 15,
    views: 734,
    body: text`
Mon front (Vite, sur \`http://localhost:5173\`) appelle mon API Express (\`http://localhost:3000\`). Dans Postman tout fonctionne, mais dans le navigateur :

~~~
Access to fetch at 'http://localhost:3000/api/produits' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
~~~

J’ai essayé \`mode: 'no-cors'\` comme le suggère le message : plus d’erreur, mais la réponse est vide. Côté serveur :

~~~js
import express from 'express'

const app = express()
app.use(express.json())

app.get('/api/produits', async (req, res) => {
  res.json(await listerProduits())
})

app.listen(3000)
~~~

Node 22, Express 5.
`,
    replies: [
      {
        author: 'junior-mbarga',
        after: 1,
        solution: true,
        body: text`
CORS est une protection **du navigateur** : une page servie depuis \`localhost:5173\` ne peut lire la réponse d’une autre origine (\`localhost:3000\`, le port compte) que si le serveur l’y autorise explicitement. Postman n’est pas un navigateur, il ignore donc ces règles.

\`mode: 'no-cors'\` n’est jamais la solution : il produit une réponse « opaque », que votre code n’a pas le droit de lire. D’où la réponse vide.

C’est votre API qui doit envoyer les bons en-têtes. Le plus simple est le middleware \`cors\` :

~~~bash
npm install cors
~~~

~~~js
import cors from 'cors'

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://app.example.com'],
    credentials: true, // seulement si vous envoyez des cookies
  })
)
~~~

Déclarez-le **avant** vos routes. Il gère aussi les requêtes de pré-vérification (\`OPTIONS\`), que le navigateur envoie par exemple avant un \`POST\` en JSON.

Évitez \`origin: '*'\` : c’est incompatible avec les cookies, et rarement ce que vous voulez en production.
`,
      },
      {
        author: 'yves_fotso',
        after: 3,
        body: text`
Autre option en développement : le proxy de Vite. Le front appelle \`/api/...\` sur sa propre origine, et Vite relaie vers l’API. Plus de CORS du tout :

~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
~~~

En production, servez front et API sous le même domaine (via un reverse proxy), ou gardez la configuration \`cors\` de Junior.
`,
      },
      {
        author: 'ebai-tabe',
        after: 20,
        body: text`
Ça marche pour la liste des produits, merci ! Mais sur la connexion (avec cookie de session et \`credentials: 'include'\` côté front), nouvelle erreur :

~~~
Access to fetch at 'http://localhost:3000/api/login' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
~~~

J’avoue, j’avais écrit \`app.use(cors())\` sans options.
`,
      },
      {
        author: 'junior-mbarga',
        after: 21,
        body: text`
C’est le cas que je mentionnais : sans options, \`cors()\` répond \`Access-Control-Allow-Origin: *\`. Avec des cookies, le serveur doit renvoyer l’origine **exacte** et \`Access-Control-Allow-Credentials: true\`. La version avec \`origin\` et \`credentials: true\` fait exactement ça.

Pour le cookie lui-même, \`SameSite=Lax\` suffit en local : \`localhost:5173\` et \`localhost:3000\` sont considérés comme le même *site* (le port ne compte pas pour \`SameSite\`, contrairement à CORS).
`,
      },
      {
        author: 'ebai-tabe',
        after: 22,
        body: text`
Tout fonctionne, connexion comprise. Merci Junior et Yves, j’ai enfin compris la différence entre origine et site.
`,
      },
    ],
  },

  /*
  | ERR_REQUIRE_ESM
  */
  {
    author: 'patrice-ekambi',
    channel: 'backend',
    title: 'Error [ERR_REQUIRE_ESM] après la mise à jour de chalk',
    daysAgo: 56,
    hour: 8,
    views: 391,
    body: text`
Sur le VPS d’un client (Node 18, je sais…), j’ai installé la dernière version de \`chalk\` pour un script de déploiement. Depuis, le script plante dès le démarrage :

~~~
Error [ERR_REQUIRE_ESM]: require() of ES Module /srv/app/node_modules/chalk/source/index.js from /srv/app/scripts/deploy.js not supported.
Instead change the require of index.js in /srv/app/scripts/deploy.js to a dynamic import() which is available in all CommonJS modules.
    at Object.<anonymous> (/srv/app/scripts/deploy.js:3:15) {
  code: 'ERR_REQUIRE_ESM'
}
~~~

Ligne 3 de \`deploy.js\` : \`const chalk = require('chalk')\`. Le \`package.json\` n’a pas de champ \`"type"\`. Quelle est la solution la plus propre ?
`,
    replies: [
      {
        author: 'hamadou-bello',
        after: 2,
        solution: true,
        body: text`
Depuis la version 5, \`chalk\` est publié **uniquement en module ES**. Votre script est en CommonJS (pas de \`"type": "module"\`), et Node 18 ne sait pas charger un module ES avec \`require()\`. Quatre options, de la plus rapide à la plus durable :

**1. Revenir à chalk 4**, la dernière version CommonJS :

~~~bash
npm install chalk@4
~~~

**2. Un import dynamique**, qui fonctionne dans tout module CommonJS :

~~~js
async function main() {
  const { default: chalk } = await import('chalk')
  console.log(chalk.green('Déploiement terminé'))
}

main()
~~~

**3. Passer le script en module ES** : renommez-le \`deploy.mjs\` et écrivez \`import chalk from 'chalk'\`.

**4. Mettre Node à jour.** Node 18 n’est plus maintenu. Depuis Node 20.19 et 22.12, \`require()\` sait charger un module ES par défaut (tant qu’il n’utilise pas de \`await\` au niveau supérieur) : votre script fonctionnerait tel quel.

Je recommande la 4, ne serait-ce que pour les correctifs de sécurité.
`,
      },
      {
        author: 'junior-mbarga',
        after: 3,
        body: text`
+1 pour la mise à jour. Et pour un simple script, vous n’avez peut-être plus besoin de \`chalk\` : Node intègre \`util.styleText\` depuis les versions 20.12 et 21.7.

~~~js
const { styleText } = require('node:util')

console.log(styleText('green', 'Déploiement terminé'))
~~~

Une dépendance de moins à surveiller.
`,
      },
      {
        author: 'patrice-ekambi',
        after: 5,
        body: text`
Serveur passé sur la LTS actuelle, et \`chalk\` remplacé par \`styleText\`. Le script tourne. Merci à vous deux, et bon rappel qu’il faut surveiller les fins de support de Node.
`,
      },
    ],
  },

  /*
  | Lucid migration
  */
  {
    author: 'yves_fotso',
    channel: 'backend',
    title: 'AdonisJS : « relation "commandes" already exists » au migration:run',
    daysAgo: 31,
    hour: 19,
    views: 268,
    body: text`
Sur un projet AdonisJS, \`node ace migration:run\` échoue :

~~~
error: relation "commandes" already exists
~~~

Contexte : j’ai renommé un fichier de migration (faute de frappe dans le nom) **après** l’avoir exécuté. Je voudrais repartir proprement sans perdre les données de test de ma base locale, que j’ai mis du temps à saisir.
`,
    replies: [
      {
        author: 'junior-mbarga',
        after: 1,
        solution: true,
        body: text`
Lucid mémorise les migrations exécutées dans la table \`adonis_schema\`, **par nom de fichier**. En renommant le fichier, vous avez créé aux yeux de Lucid une nouvelle migration, qu’il essaie d’exécuter : d’où la tentative de recréer la table.

Vérifiez l’état avec :

~~~bash
node ace migration:status
~~~

Ensuite, deux solutions sans perte de données :

1. **Rendre son ancien nom au fichier.** Le plus simple et le plus sûr.
2. **Mettre à jour le nom enregistré** dans \`adonis_schema\` (en local uniquement) :

~~~sql
UPDATE adonis_schema
   SET name = 'database/migrations/1736000000000_create_commandes_table'
 WHERE name = 'database/migrations/1736000000000_create_comandes_table';
~~~

Si les données ne comptaient pas, \`node ace migration:fresh\` supprime toutes les tables et rejoue toutes les migrations.

Pour la suite, la règle d’or : **on ne modifie ni ne renomme une migration déjà exécutée** ailleurs que sur sa machine. On en crée une nouvelle (avec \`alterTable\`, \`renameTable\`…).
`,
      },
      {
        author: 'yves_fotso',
        after: 2,
        body: text`
J’ai remis l’ancien nom, tout est rentré dans l’ordre, et mes données sont intactes. Leçon retenue, merci Junior.
`,
      },
    ],
  },

  /*
  | Locked debate
  */
  {
    author: 'hamadou-bello',
    channel: 'backend',
    title: 'Bun va-t-il remplacer Node.js ?',
    daysAgo: 66,
    hour: 20,
    views: 905,
    locked: true,
    body: text`
J’ai testé Bun sur un petit projet perso : installation des dépendances très rapide, TypeScript sans configuration, test runner intégré. J’ai été bluffé.

Est-ce que certains d’entre vous l’utilisent en production ? J’ai l’impression que Node est en train de se faire dépasser.
`,
    replies: [
      {
        author: 'lionel_tchak',
        after: 1,
        body: text`
En production sur un petit service interne, oui, depuis quelques mois. Les gains à l’installation et au démarrage sont réels. Mais vérifiez la compatibilité de vos dépendances, surtout celles qui embarquent du code natif : c’est là que j’ai eu des surprises.
`,
      },
      {
        author: 'patrice-ekambi',
        after: 3,
        body: text`
Pour mes clients, je reste sur Node LTS : support long, images Docker éprouvées, outils de supervision qui le connaissent par cœur. Et Node a comblé une partie de l’écart : exécution directe de fichiers TypeScript simples, test runner intégré, \`--watch\`, \`--env-file\`… La concurrence lui a fait du bien.
`,
      },
      {
        author: 'ebai-tabe',
        after: 4,
        body: text`
Franchement, rester sur Node aujourd’hui, c’est de la nostalgie. Bun est plus rapide partout.
`,
      },
      {
        author: 'yves_fotso',
        after: 6,
        body: text`
« Partout », non. Et mes clients paient pour de la stabilité, pas pour suivre la mode. Ce genre de remarque n’aide personne à choisir.
`,
      },
      {
        author: 'junior-mbarga',
        after: 8,
        body: text`
Si on parlait chiffres plutôt qu’étiquettes ? Les écarts de performance dépendent énormément de la charge : sur une API qui passe son temps à attendre PostgreSQL, le runtime pèse peu. Un benchmark sur votre propre application vaut tous les graphiques des pages d’accueil.
`,
      },
      {
        author: 'armelle_ngo',
        after: 10,
        body: text`
Je verrouille le sujet : les arguments principaux sont posés, et la suite prend des airs de match de supporters.

Bun et Node sont deux bons outils ; le choix dépend de vos dépendances, de votre hébergement et de votre équipe. Si vous avez un **retour d’expérience chiffré** (migration, benchmarks sur une vraie application, problèmes rencontrés), ouvrez un nouveau sujet : il sera le bienvenu.
`,
      },
    ],
  },

  /*
  | EAS build APK
  */
  {
    author: 'christelle_k',
    channel: 'mobile',
    title: 'EAS Build me génère un .aab : comment obtenir un .apk à partager ?',
    daysAgo: 24,
    hour: 20,
    views: 176,
    body: text`
Je prépare une petite application pour la tontine de mon association (React Native avec Expo). Je voudrais l’envoyer aux membres par WhatsApp pour qu’ils la testent avant la publication.

Problème : \`eas build -p android\` me donne un fichier \`.aab\`, que les téléphones refusent d’installer. Comment obtenir un \`.apk\` ?
`,
    replies: [
      {
        author: 'nfor_ngwa',
        after: 2,
        solution: true,
        body: text`
Le format \`.aab\` (Android App Bundle) est destiné au Play Store, qui génère ensuite un APK adapté à chaque téléphone. Pour une installation directe, il vous faut un \`.apk\`. Ajoutez un profil dans \`eas.json\` :

~~~json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
~~~

Puis lancez le build avec ce profil :

~~~bash
eas build -p android --profile preview
~~~

À la fin, EAS affiche un lien et un QR code pour télécharger l’APK. Les membres devront autoriser l’installation depuis une source inconnue. Le jour de la publication sur le Play Store, utilisez le profil \`production\`, qui produit à nouveau un \`.aab\`.
`,
      },
      {
        author: 'christelle_k',
        after: 4,
        body: text`
Parfait, l’APK est parti dans le groupe de la tontine et les premiers retours arrivent déjà. Merci Nfor !
`,
      },
    ],
  },

  /*
  | Expo network request failed
  */
  {
    author: 'ebai-tabe',
    channel: 'mobile',
    title: 'Expo : « TypeError: Network request failed » en appelant mon API locale',
    daysAgo: 9,
    hour: 18,
    views: 143,
    body: text`
Mon application Expo, lancée sur mon téléphone avec Expo Go, appelle mon API AdonisJS qui tourne sur mon ordinateur :

~~~ts
const response = await fetch('http://localhost:3333/api/produits')
~~~

Résultat, systématiquement :

~~~
TypeError: Network request failed
~~~

Pourtant l’API répond très bien dans le navigateur de mon ordinateur. Le téléphone et le PC sont sur le même Wi-Fi.
`,
    replies: [
      {
        author: 'nfor_ngwa',
        after: 1,
        solution: true,
        body: text`
Sur le téléphone, \`localhost\` désigne… le téléphone lui-même. Votre API n’y est évidemment pas. Il faut utiliser l’adresse IP de votre ordinateur sur le réseau local :

- macOS : \`ipconfig getifaddr en0\`
- Linux : \`ip addr\`
- Windows : \`ipconfig\`

Ensuite, deux vérifications côté API :

1. Elle doit écouter sur toutes les interfaces, pas seulement sur \`localhost\`. Dans le \`.env\` d’AdonisJS : \`HOST=0.0.0.0\`.
2. Le pare-feu de l’ordinateur doit autoriser le port 3333.

Enfin, ne codez pas l’adresse en dur : Expo expose au code de l’application les variables préfixées par \`EXPO_PUBLIC_\`.

~~~bash
# .env du projet Expo
EXPO_PUBLIC_API_URL=http://192.168.1.20:3333
~~~

~~~ts
const API_URL = process.env.EXPO_PUBLIC_API_URL

const response = await fetch(\`\${API_URL}/api/produits\`)
~~~

Sur l’émulateur Android, l’ordinateur hôte est joignable via \`10.0.2.2\`.
`,
      },
      {
        author: 'patrice-ekambi',
        after: 3,
        body: text`
Un point pour plus tard : Android bloque par défaut le HTTP non chiffré dans les builds de production. Prévoyez une API en HTTPS (un tunnel HTTPS pour tester à distance, un vrai certificat en production) plutôt que de réactiver le trafic en clair.
`,
      },
      {
        author: 'ebai-tabe',
        after: 4,
        body: text`
C’était exactement ça : \`HOST=localhost\` dans mon \`.env\`. Avec \`0.0.0.0\` et l’IP de mon PC, tout passe. Merci !
`,
      },
    ],
  },

  /*
  | Vite env variables
  */
  {
    author: 'mireille-ondoa',
    channel: 'outils',
    title: 'Vite : import.meta.env.API_URL est undefined',
    daysAgo: 36,
    hour: 11,
    views: 352,
    body: text`
Je migre un projet perso de Create React App vers Vite. Mes variables d’environnement sont toutes \`undefined\` :

~~~bash
# .env (à la racine du projet)
API_URL=https://api.example.com
~~~

~~~ts
console.log(import.meta.env.API_URL) // undefined
~~~

J’ai bien redémarré le serveur de développement. Avec CRA, j’utilisais \`process.env.REACT_APP_API_URL\`.
`,
    replies: [
      {
        author: 'lionel_tchak',
        after: 0.7,
        solution: true,
        body: text`
Par sécurité, Vite n’expose au code client **que** les variables préfixées par \`VITE_\` (l’équivalent du \`REACT_APP_\` de CRA). Renommez :

~~~bash
# .env
VITE_API_URL=https://api.example.com
~~~

~~~ts
const API_URL = import.meta.env.VITE_API_URL
~~~

Redémarrez le serveur après chaque modification du \`.env\`. Pour la migration, un rechercher-remplacer de \`process.env.REACT_APP_\` vers \`import.meta.env.VITE_\` fait l’essentiel du travail. Et vous pouvez avoir des fichiers par mode : \`.env.development\`, \`.env.production\`.
`,
      },
      {
        author: 'hamadou-bello',
        after: 2,
        body: text`
Pour l’autocomplétion et le typage, déclarez vos variables dans \`src/vite-env.d.ts\` :

~~~ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
~~~

Et rappel important : ces valeurs sont **écrites en clair dans le bundle**. Jamais de secret (clé d’API de paiement, mot de passe…) dans une variable \`VITE_\`.
`,
      },
    ],
  },

  /*
  | process.env typing
  */
  {
    author: 'nfor_ngwa',
    channel: 'typescript',
    title: "process.env : « Type 'undefined' is not assignable to type… »",
    daysAgo: 14,
    hour: 16,
    views: 189,
    body: text`
Sur le backend de mon application (Node.js et TypeScript en mode \`strict\`), cette fonction ne compile pas :

~~~ts
import { createHmac } from 'node:crypto'

export function signer(donnees: string) {
  return createHmac('sha256', process.env.APP_SECRET).update(donnees).digest('hex')
}
~~~

~~~
error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'BinaryLike | KeyObject'.
  Type 'undefined' is not assignable to type 'BinaryLike | KeyObject'.
~~~

La variable est pourtant bien définie dans mon \`.env\`. Comment faire proprement ?
`,
    replies: [
      {
        author: 'grace-enow',
        after: 1,
        body: text`
Vous pouvez ajouter un \`!\` à la fin : \`process.env.APP_SECRET!\`. C’est ce qu’on nous montrait au bootcamp.
`,
      },
      {
        author: 'junior-mbarga',
        after: 2,
        body: text`
Le \`!\` fait taire le compilateur, mais ne règle rien : si la variable manque un jour en production, l’erreur surgira au premier appel de \`signer\`, loin de sa cause. TypeScript a raison, \`process.env.X\` *peut* être \`undefined\`.

Le plus robuste : valider toutes les variables **au démarrage**, une seule fois, et échouer immédiatement si l’une manque.

~~~ts
// src/env.ts
function requise(nom: string): string {
  const valeur = process.env[nom]
  if (!valeur) throw new Error(\`Variable d’environnement manquante : \${nom}\`)
  return valeur
}

export const env = {
  APP_SECRET: requise('APP_SECRET'),
  DATABASE_URL: requise('DATABASE_URL'),
  PORT: Number(process.env.PORT ?? 3000),
} as const
~~~

~~~ts
import { env } from './env.js'

export function signer(donnees: string) {
  return createHmac('sha256', env.APP_SECRET).update(donnees).digest('hex')
}
~~~

Pour des règles plus riches (URL valide, nombre, énumération), une bibliothèque de validation de schéma fait très bien l’affaire. AdonisJS, par exemple, intègre ce mécanisme avec \`Env.create\`.
`,
      },
      {
        author: 'nfor_ngwa',
        after: 3,
        body: text`
Très clair, je centralise tout dans \`env.ts\`. Merci Junior, et merci Grace : le \`!\` m’a débloqué cinq minutes, mais je préfère la version qui plante au démarrage. Je laisse le sujet ouvert quelques jours, au cas où quelqu’un aurait un retour sur une bibliothèque de validation pour ce cas précis.
`,
      },
    ],
  },

  /*
  | Vue reactivity
  */
  {
    author: 'junior-mbarga',
    channel: 'vue',
    title: 'Vue 3 : ma variable n’est plus réactive après déstructuration',
    daysAgo: 6,
    hour: 13,
    views: 97,
    body: text`
Je dépanne un client sur une application Vue 3 (je suis plutôt backend, soyez indulgents). Ce composant n’affiche jamais le nouveau total :

~~~vue
<script setup>
import { reactive } from 'vue'

const panier = reactive({ total: 0, articles: [] })
const { total } = panier

function ajouter(prix) {
  panier.total += prix
}
</script>

<template>
  <p>Total : {{ total }} FCFA</p>
  <button @click="ajouter(2500)">Ajouter</button>
</template>
~~~

Le total reste à 0, alors que \`panier.total\` change bien dans les Vue DevTools. Qu’est-ce qui m’échappe ?
`,
    replies: [
      {
        author: 'hamadou-bello',
        after: 3,
        body: text`
La déstructuration copie la **valeur** au moment où elle est faite : \`total\` est un simple nombre (0), qui n’a plus aucun lien avec le proxy réactif \`panier\`. Vue ne peut pas suivre une copie.

Trois solutions :

1. Utiliser directement \`panier.total\` dans le template.
2. Garder la déstructuration, mais avec \`toRefs\`, qui transforme chaque propriété en \`ref\` reliée à l’objet d’origine :

~~~js
import { reactive, toRefs } from 'vue'

const panier = reactive({ total: 0, articles: [] })
const { total } = toRefs(panier) // total.value suit panier.total
~~~

Dans le template, \`{{ total }}\` fonctionne sans \`.value\` : les refs y sont déballées automatiquement.

3. Utiliser des \`ref\` dès le départ, ce que beaucoup d’équipes préfèrent pour éviter ce piège.

À noter : depuis Vue 3.5, déstructurer le résultat de \`defineProps()\` dans un \`<script setup>\` **reste** réactif, car le compilateur s’en charge. Mais cela ne vaut que pour les props, pas pour un objet \`reactive()\`.
`,
      },
    ],
  },

  /*
  | Angular NG0100
  */
  {
    author: 'mireille-ondoa',
    channel: 'angular',
    title: 'NG0100 ExpressionChangedAfterItHasBeenCheckedError avec un spinner global',
    daysAgo: 3,
    hour: 9,
    views: 64,
    body: text`
Sur un écran de souscription, j’ai un spinner global piloté par un service. En développement, la console affiche :

~~~
ERROR RuntimeError: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'false'. Current value: 'true'. Expression location: _AppComponent component.
~~~

Le composant de l’écran appelle \`this.chargement.demarrer()\` dans \`ngAfterViewInit\`. Le spinner est dans le template d’\`AppComponent\` :

~~~ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerComponent],
  template: \`
    @if (chargement.actif) {
      <app-spinner />
    }
    <router-outlet />
  \`,
})
export class AppComponent {
  protected readonly chargement = inject(ChargementService)
}
~~~

Le spinner s’affiche quand même. Est-ce grave ? Et comment corriger proprement, sans \`setTimeout\` ?
`,
    replies: [
      {
        author: 'armelle_ngo',
        after: 4,
        body: text`
Ce n’est pas « grave » au sens où l’application fonctionne, mais c’est un vrai signal. En développement, Angular vérifie une seconde fois chaque vue après la détection de changements. Ici, \`AppComponent\` a déjà été vérifié (\`actif\` valait \`false\`) quand le \`ngAfterViewInit\` de l’enfant le passe à \`true\`. En production, ce changement ne serait tout simplement pas affiché avant le cycle suivant.

Deux corrections, sans \`setTimeout\` (qui masque le problème plutôt qu’il ne le règle) :

**1. Démarrer le chargement là où part la requête**, dans le service ou dans un resolver, plutôt que dans un hook de cycle de vie de la vue. Une navigation ou un clic se produisent hors de la détection de changements : plus de conflit.

**2. Passer l’état du service en signal.** Angular sait alors précisément quelle vue dépend de cette valeur et la revérifie quand elle change, au lieu de lever NG0100 :

~~~ts
@Injectable({ providedIn: 'root' })
export class ChargementService {
  private readonly enCours = signal(0)
  readonly actif = computed(() => this.enCours() > 0)

  demarrer() {
    this.enCours.update((n) => n + 1)
  }

  terminer() {
    this.enCours.update((n) => Math.max(0, n - 1))
  }
}
~~~

Dans le template : \`@if (chargement.actif()) { ... }\`. Le compteur évite au passage qu’une requête qui se termine cache le spinner d’une autre encore en cours.
`,
      },
      {
        author: 'mireille-ondoa',
        after: 6,
        body: text`
Merci, l’explication du double contrôle m’aide beaucoup. Le service est partagé avec une quarantaine d’anciens écrans qui lisent \`actif\` comme un booléen… La migration vers le signal va prendre un peu de temps. Je teste demain et je reviens vers vous.
`,
      },
      {
        author: 'armelle_ngo',
        after: 7,
        body: text`
Migrer écran par écran est une bonne approche. Attention à une fausse bonne idée en attendant : déplacer l’appel dans \`ngOnInit\` ne suffit pas toujours. Pour un composant affiché par le routeur, \`ngOnInit\` s’exécute lui aussi *après* l’évaluation du template d’\`AppComponent\`. Appeler \`demarrer()\` dans le service, au moment où la requête part, règle le problème pour tous les écrans d’un coup.
`,
      },
    ],
  },
]
