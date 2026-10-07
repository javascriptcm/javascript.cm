import { text, type DemoDiscussion } from './types.js'

/**
 * Community discussions. "after" on replies = hours after the discussion
 * was opened.
 */
export const discussions: DemoDiscussion[] = [
  /*
  | Meetup
  */
  {
    author: 'armelle_ngo',
    title: 'Meetup JS à Douala : on relance les rencontres mensuelles ?',
    tags: ['evenements'],
    daysAgo: 8,
    hour: 18,
    views: 412,
    pinned: true,
    body: text`
Bonsoir à toutes et à tous !

Plusieurs membres m’ont demandé si l’on pouvait reprendre les rencontres en présentiel. Voici une proposition, à discuter ici avant de fixer quoi que ce soit.

## Le format

- **Quand** : le dernier samedi du mois, de 15 h à 18 h.
- **Où** : un espace de coworking à Akwa qui accepte de nous prêter sa grande salle. Accessible en taxi et en moto-taxi, avec un groupe électrogène (oui, j’ai vérifié).
- **Programme** :
  - deux présentations de 20 minutes, suivies de questions ;
  - des *lightning talks* de 5 minutes, ouverts à tous, même aux grands débutants ;
  - le reste du temps pour échanger, recruter, trouver un binôme ou un stage.

## Ce qu’il nous faut

1. **Des orateurs et oratrices.** Un retour d’expérience sur un projet réel vaut mieux qu’un cours théorique. Les sujets déjà proposés : intégration du mobile money, React Native hors ligne, premiers pas avec AdonisJS.
2. **Un ou deux volontaires** pour l’accueil et la diffusion en direct.
3. **Vos avis** sur le jour et l’horaire.

Pour les membres de Yaoundé, Buea, Bamenda ou Garoua : si nous arrivons à filmer correctement, les présentations seront diffusées en direct puis publiées. Et si un groupe veut lancer la même chose dans sa ville, je partage volontiers tout ce que nous préparons.

Répondez ici avec vos propositions de sujets et vos disponibilités.
`,
    replies: [
      {
        author: 'lionel_tchak',
        after: 2,
        body: text`
Excellente idée. Je peux présenter « Diviser par trois le poids d’une page produit », avec les mesures avant et après d’un vrai projet. Samedi après-midi me convient.
`,
      },
      {
        author: 'yves_fotso',
        after: 3,
        body: text`
Partant pour un talk sur l’intégration du mobile money côté backend, la suite de mon article avec une démo en direct sur un environnement de test. Je peux aussi aider à l’accueil.
`,
      },
      {
        author: 'grace-enow',
        after: 5,
        body: text`
Je viendrai de Limbé ! Les *lightning talks* ouverts aux débutants, c’est une très bonne idée : je pourrais raconter ma reconversion de la comptabilité au développement, en cinq minutes chrono.
`,
      },
      {
        author: 'nfor_ngwa',
        after: 26,
        body: text`
Pour la diffusion : un téléphone sur trépied et un micro-cravate suffisent largement, inutile de viser la qualité télé. À Bamenda, nous sommes quelques-uns à pouvoir nous réunir pour suivre ensemble. Je propose aussi un talk sur React Native hors ligne.
`,
      },
      {
        author: 'armelle_ngo',
        after: 30,
        body: text`
Merci pour cet enthousiasme ! Récapitulatif :

- Première édition : le dernier samedi du mois prochain, 15 h - 18 h.
- Présentations : Yves (mobile money) et Lionel (performance web).
- *Lightning talks* : Grace et Nfor, d’autres places restent ouvertes.
- Diffusion : téléphone, trépied et micro, comme le suggère Nfor.

Je publierai l’annonce définitive, avec l’adresse exacte, dans une nouvelle discussion.
`,
      },
    ],
  },

  /*
  | Salaries survey
  */
  {
    author: 'hamadou-bello',
    title: 'Salaires des développeurs JS au Cameroun : résultats de notre sondage anonyme',
    tags: ['carriere'],
    daysAgo: 21,
    hour: 12,
    views: 688,
    body: text`
Comme promis, voici les résultats du sondage anonyme lancé sur le forum et dans nos groupes il y a trois semaines. **74 réponses**, merci à toutes celles et ceux qui ont participé.

Avant tout, les limites : l’échantillon est petit, les réponses sont déclaratives et viennent surtout de Douala et Yaoundé. Ces fourchettes sont **indicatives** ; elles servent à se situer, pas à fixer une règle.

## Salaires mensuels nets, employeurs locaux

| Expérience | Fourchette (FCFA) | Médiane (FCFA) |
| --- | --- | --- |
| Moins de 2 ans | 150 000 – 350 000 | 250 000 |
| 2 à 5 ans | 350 000 – 700 000 | 500 000 |
| Plus de 5 ans | 700 000 – 1 500 000 | 950 000 |

## Télétravail pour des entreprises étrangères

Les écarts sont énormes : de 600 000 à plus de 3 000 000 FCFA par mois. Le pays de l’entreprise, le type de contrat (salarié via un intermédiaire ou freelance) et le niveau d’anglais pèsent plus lourd que l’ancienneté.

## Freelances, missions locales

Le tarif journalier déclaré va de 25 000 à 80 000 FCFA, avec une médiane autour de 45 000 FCFA.

## Ce qui fait varier la rémunération

- **Le secteur** : banques, assurances, télécoms et fintechs paient sensiblement mieux que les agences.
- **La ville** : Douala et Yaoundé devant les autres villes, à expérience égale.
- **Les avantages** : assurance santé, prise en charge de la connexion ou du transport, treizième mois. Ils représentent parfois 20 % de la rémunération totale : comparez des offres complètes, pas seulement des salaires.
- **La négociation** : près d’un répondant sur deux n’a jamais négocié son salaire d’embauche.

Si l’exercice vous semble utile, je propose de le refaire chaque année, avec une méthode publiée à l’avance. Vos remarques sont les bienvenues.
`,
    replies: [
      {
        author: 'christelle_k',
        after: 3,
        body: text`
Merci Hamadou, ce travail manquait vraiment. Le chiffre qui me frappe : un répondant sur deux n’a jamais négocié. Je vais en parler à mes apprenants dès la semaine prochaine.
`,
      },
      {
        author: 'grace-enow',
        after: 5,
        body: text`
Très utile pour les juniors. J’ai accepté 180 000 FCFA pour mon premier poste sans rien demander… Je saurai quoi répondre à mon prochain entretien annuel.
`,
      },
      {
        author: 'yves_fotso',
        after: 8,
        body: text`
Pour les freelances qui lisent : un tarif journalier se compare à un salaire en tenant compte des jours non facturés (prospection, administratif, creux entre deux missions). En pratique, on facture rarement plus de 12 à 15 jours par mois.
`,
      },
      {
        author: 'junior-mbarga',
        after: 24,
        body: text`
+1 pour une édition annuelle. Suggestion pour la prochaine : distinguer front, back et mobile, et demander la taille de l’entreprise. Je peux aider à préparer le questionnaire et à anonymiser les réponses.
`,
      },
    ],
  },

  /*
  | Freelance invoicing
  */
  {
    author: 'yves_fotso',
    title: 'Facturer des clients étrangers en freelance : comment vous organisez-vous ?',
    tags: ['freelance', 'carriere'],
    daysAgo: 44,
    hour: 9,
    views: 540,
    body: text`
Je travaille depuis trois ans avec des clients en France et en Belgique. Je partage mon organisation, et j’aimerais connaître la vôtre : on apprend surtout des erreurs des autres.

## Avant de commencer

- **Un devis détaillé** : périmètre, livrables, nombre d’allers-retours inclus, délais.
- **Un contrat**, même court : conditions de paiement, propriété du code (transférée au paiement complet), clause de résiliation.
- **Un acompte** de 30 à 50 % avant la première ligne de code. Je n’y déroge plus.

## La facture

Numéro unique, date, vos coordonnées et celles du client, description des prestations, montant, devise, échéance et moyens de paiement. Je facture **en euros** : grâce à la parité fixe entre l’euro et le franc CFA (1 € = 655,957 FCFA), il n’y a pas de risque de change, seulement des frais de transfert. Avec un client payant en dollars, le cours varie et il faut en tenir compte dans le tarif.

## Le paiement

- Virement international vers mon compte bancaire : fiable, mais comptez quelques jours et des frais à chaque bout.
- Plateformes de paiement internationales : plus rapides, mais comparez les frais, le taux de change appliqué et les possibilités de retrait au Cameroun avant de les proposer à un client.

## L’administratif

Je garde toutes les factures et les relevés, et je déclare mes revenus. Un comptable m’a coûté moins cher que les erreurs qu’il m’a évitées.

Et vous : quels délais de paiement, quels outils de facturation, quelles mauvaises surprises ?
`,
    replies: [
      {
        author: 'hamadou-bello',
        after: 4,
        body: text`
Très complet. J’ajoute un point sur le contrat : précisez le fuseau horaire et les heures de disponibilité. Un client qui attend une réponse à 18 h, heure de Montréal, alors qu’il est minuit chez nous, c’est un conflit garanti si rien n’est écrit.
`,
      },
      {
        author: 'patrice-ekambi',
        after: 6,
        body: text`
Ma pire expérience : un client payé avec quatre mois de retard, faute de clause sur les pénalités. Depuis, mes conditions prévoient un paiement à 15 jours, et la livraison finale (accès, code source) intervient après le paiement du solde.
`,
      },
      {
        author: 'lionel_tchak',
        after: 28,
        body: text`
Pour les relances, j’utilise un simple tableur avec la date d’échéance de chaque facture et un rappel automatique la veille. Une relance polie le jour J règle 90 % des retards. Et je découpe les gros projets en jalons facturés séparément : le risque est plus petit à chaque étape.
`,
      },
      {
        author: 'yves_fotso',
        after: 30,
        body: text`
Merci à vous trois, je retiens :

- le fuseau horaire et les heures de disponibilité dans le contrat ;
- des pénalités de retard et la livraison finale après le solde ;
- des jalons facturés séparément et des relances systématiques.

Je compile tout ça dans un modèle de conditions générales que je partagerai ici.
`,
      },
    ],
  },

  /*
  | Fintech stack
  */
  {
    author: 'junior-mbarga',
    title: 'Quelle stack pour une startup fintech locale ?',
    tags: ['nodejs', 'mobile-money', 'react'],
    daysAgo: 28,
    hour: 14,
    views: 463,
    body: text`
Un ami lance une application d’épargne collective (une tontine numérique, en somme) avec cotisations et versements par mobile money. L’équipe technique : deux développeurs, dont moi à mi-temps. Les besoins :

- une application Android en priorité : la majorité des futurs utilisateurs ont des téléphones d’entrée de gamme, avec peu de stockage ;
- un back-office web pour l’équipe ;
- une API, et les paiements via un agrégateur.

Ma proposition :

- **API** : AdonisJS et PostgreSQL ;
- **Mobile** : React Native avec Expo ;
- **Back-office** : React ;
- **Hébergement** : un VPS, Docker, sauvegardes quotidiennes.

Mes questions : PWA ou application native ? Faut-il prévoir l’USSD dès le départ ? Héberger au Cameroun ou à l’étranger ? Qu’est-ce que vous changeriez ?
`,
    replies: [
      {
        author: 'yves_fotso',
        after: 2,
        body: text`
Pour les paiements : commencez avec un agrégateur qui couvre les principaux opérateurs, vous n’aurez qu’une intégration à maintenir. Et surtout, tenez un **grand livre** : chaque mouvement d’argent est une ligne immuable (cotisation, versement, frais), et les soldes se calculent à partir de ces lignes. Ne stockez jamais un solde que l’on modifie à la main. Le jour d’un litige, vous me remercierez.
`,
      },
      {
        author: 'nfor_ngwa',
        after: 4,
        body: text`
React Native avec Expo me semble le bon choix : notifications fiables, stockage hors ligne, accès aux contacts pour inviter les membres d’un groupe. Surveillez la taille de l’APK dès le début, beaucoup de téléphones n’ont plus que quelques centaines de Mo de libre. Une PWA peut compléter pour ceux qui ne veulent rien installer.
`,
      },
      {
        author: 'patrice-ekambi',
        after: 5,
        body: text`
Pour l’hébergement, un VPS en Europe donne une latence d’une centaine de millisecondes depuis Douala : largement acceptable pour ce type d’application. Ce qui compte davantage : des sauvegardes testées (une sauvegarde jamais restaurée n’est pas une sauvegarde), une supervision avec alertes, et des déploiements reproductibles. Et pas de Kubernetes pour deux développeurs.
`,
      },
      {
        author: 'armelle_ngo',
        after: 20,
        body: text`
Côté produit : prévoyez des SMS de confirmation pour chaque mouvement, une interface en français et en anglais dès le premier jour, et des écrans très simples, testés avec de vrais membres de tontine. L’USSD peut attendre une deuxième version, mais gardez l’API indépendante de l’interface pour pouvoir l’ajouter.

Dernier point : les services de paiement sont encadrés au niveau de la zone CEMAC. Faites-vous accompagner sur la réglementation avant le lancement, pas après.
`,
      },
      {
        author: 'junior-mbarga',
        after: 26,
        body: text`
Merci, c’est précieux. On garde la stack, on ajoute le grand livre dès le premier sprint, les SMS de confirmation, et on reporte l’USSD. Je vous ferai un retour dans quelques mois.
`,
      },
    ],
  },

  /*
  | Power cuts
  */
  {
    author: 'lionel_tchak',
    title: 'Coupures d’électricité : comment organisez-vous votre setup ?',
    tags: ['carriere', 'freelance'],
    daysAgo: 13,
    hour: 20,
    views: 377,
    body: text`
Troisième délestage de la semaine dans mon quartier, en pleine démo client cette fois. Je partage mon installation actuelle et je suis preneur de vos idées.

- **Un onduleur** de 1 500 VA pour la box internet et l’écran : environ quarante minutes d’autonomie.
- **Un ordinateur portable** plutôt qu’une tour : sa batterie est mon premier onduleur.
- **Un routeur 4G de secours**, qui prend le relais automatiquement quand la box tombe.
- **Une batterie externe** chargée en permanence pour le téléphone.
- **Un travail qui supporte les coupures** : commits fréquents, documentation téléchargée, dépendances déjà installées.

Ce qui me manque : de l’autonomie pour les longues coupures. Panneaux solaires ? Groupe électrogène ? Coworking ? Comment faites-vous ?
`,
    replies: [
      {
        author: 'patrice-ekambi',
        after: 1,
        body: text`
À Kribi, j’ai fini par installer un petit système solaire : deux panneaux de 400 W, une batterie lithium (LiFePO4) et un onduleur hybride. Ça alimente le bureau toute la journée. Conseil important : choisissez un onduleur à **onde sinusoïdale pure**, les modèles bas de gamme à onde modifiée fatiguent les alimentations des ordinateurs.
`,
      },
      {
        author: 'hamadou-bello',
        after: 2,
        body: text`
À Garoua, l’ennemi, c’est autant la chaleur que les coupures. Je travaille sur portable avec un support ventilé, et j’ai deux puces de deux opérateurs différents : quand l’un sature, l’autre passe souvent. Et j’annonce clairement à mes clients que je peux être injoignable une heure : ça désamorce beaucoup de tensions.
`,
      },
      {
        author: 'aissatou-oumarou',
        after: 3,
        body: text`
Version étudiante, petit budget : partage de connexion depuis le téléphone, batterie externe toujours chargée, et je télécharge cours et vidéos la nuit, quand les forfaits sont moins chers. Ce n’est pas confortable, mais ça permet de continuer à apprendre.
`,
      },
      {
        author: 'nfor_ngwa',
        after: 5,
        body: text`
Côté outils, je prépare mon environnement pour fonctionner hors ligne : \`npm ci --prefer-offline\` réutilise le cache local, la documentation est disponible hors connexion dans un outil comme DevDocs, et j’ai toujours un émulateur prêt à démarrer. Quand le réseau revient, je n’ai plus qu’à pousser mes commits.
`,
      },
      {
        author: 'ebai-tabe',
        after: 18,
        body: text`
Petit conseil batterie : si votre portable le permet, limitez la charge à 80 % quand il reste branché toute la journée. La batterie vieillit beaucoup moins vite, et c’est elle qui vous sauve pendant les coupures.
`,
      },
      {
        author: 'lionel_tchak',
        after: 20,
        body: text`
Merci à tous. Je vais étudier la solution solaire de Patrice (onde sinusoïdale pure, noté), ajouter une seconde puce comme Hamadou, et limiter la charge de mon portable. Je ferai un retour sur le budget final.
`,
      },
    ],
  },

  /*
  | Learning resources in French
  */
  {
    author: 'aissatou-oumarou',
    title: 'Ressources pour apprendre JavaScript en français',
    tags: ['apprendre', 'javascript', 'open-source'],
    daysAgo: 25,
    hour: 21,
    views: 524,
    body: text`
Bonsoir à tous. Je suis étudiante et j’apprends JavaScript le soir, en autodidacte. Mon anglais progresse, mais je comprends beaucoup mieux en français.

Quelles ressources gratuites me conseillez-vous ? Je préfère les textes aux vidéos : mon forfait ne suit pas toujours. Et si quelque chose fonctionne hors ligne, c’est encore mieux.
`,
    replies: [
      {
        author: 'christelle_k',
        after: 1,
        body: text`
Bienvenue Aïssatou ! Ma sélection, toute en français :

- **MDN Web Docs** (developer.mozilla.org/fr) : la référence, avec un guide JavaScript complet pour débuter.
- **javascript.info** (fr.javascript.info) : un tutoriel progressif, du plus simple au plus avancé, avec des exercices corrigés.
- **La documentation officielle de React** (fr.react.dev), le jour où vous attaquerez React : elle est traduite et excellente.

Surtout : construisez de petits projets dès la deuxième semaine. Une calculatrice de tontine, une liste de courses, un convertisseur FCFA-euro. On apprend en bloquant, puis en débloquant.
`,
      },
      {
        author: 'hamadou-bello',
        after: 3,
        body: text`
Pour le hors ligne : DevDocs (devdocs.io) permet de télécharger la documentation de JavaScript, du DOM ou de Node.js dans le navigateur, puis de la consulter sans connexion. Très pratique avec un petit forfait.
`,
      },
      {
        author: 'grace-enow',
        after: 4,
        body: text`
Retour d’une ancienne débutante : alternez lecture et pratique, et postez vos questions ici sans hésiter. Quand vous regardez des vidéos, baissez la qualité en 480p : pour du code à l’écran, c’est largement suffisant.
`,
      },
      {
        author: 'junior-mbarga',
        after: 22,
        body: text`
Une idée pour plus tard : contribuer à la traduction d’une documentation open source. Les traductions françaises de plusieurs documentations sont maintenues par des bénévoles sur GitHub. On apprend énormément en traduisant, et c’est une première contribution open source très appréciée des recruteurs.
`,
      },
      {
        author: 'aissatou-oumarou',
        after: 30,
        body: text`
Merci à tous ! Mon plan : fr.javascript.info chaque soir, DevDocs téléchargé pour les jours sans forfait, et un petit projet par semaine, que je partagerai ici. Le premier sera la calculatrice de tontine.
`,
      },
    ],
  },
]
