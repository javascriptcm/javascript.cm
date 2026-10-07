# javascript.cm

Le site de **JavaScript Cameroun**, la communauté des développeurs JavaScript du 237 : articles, forum d’entraide (questions / solutions acceptées), discussions, profils et annuaire des membres.

Staging : <https://staging.javascript.cm>

## Stack

| Couche          | Outils                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Backend         | [AdonisJS 7](https://adonisjs.com) (TypeScript), Lucid ORM, VineJS, sessions + remember-me, rate limiting      |
| Frontend        | [Inertia 3](https://inertiajs.com) + React 19 (rendu serveur / SSR), [Tailwind CSS 4](https://tailwindcss.com) |
| Base de données | PostgreSQL 18                                                                                                  |
| Contenu         | Markdown (GFM) rendu côté serveur, nettoyé (`rehype-sanitize`) et coloré par [Shiki](https://shiki.style)      |
| Déploiement     | Docker Compose derrière [Caddy](https://caddyserver.com) (HTTPS automatique)                                   |

## Démarrer en local

Prérequis : **Node.js ≥ 24**, Docker (ou un PostgreSQL local).

```bash
git clone https://github.com/javascriptcm/javascript.cm.git
cd javascript.cm
npm install

# PostgreSQL de développement
docker run -d --name jscm-pg -p 5455:5432 \
  -e POSTGRES_USER=jscm -e POSTGRES_PASSWORD=jscm -e POSTGRES_DB=jscm postgres:18-alpine

cp .env.example .env          # puis DB_PORT=5455
node ace generate:key         # remplit APP_KEY
node ace migration:run
node ace db:seed              # canaux, tags + contenu de démonstration en développement
npm run dev                   # http://localhost:3333
```

Donner un rôle à un membre : `node ace user:promote <pseudo|email> --role=admin|moderator|member`.

### Connexion GitHub (optionnelle)

Créez une OAuth App sur <https://github.com/settings/developers> avec comme callback `${APP_URL}/auth/github/callback`, puis renseignez `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET`. Sans ces variables, le bouton « Continuer avec GitHub » est simplement masqué.

## Commandes utiles

| Commande                 | Rôle                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| `npm run dev`            | Serveur de développement (HMR)                                                   |
| `npm run typecheck`      | Vérification TypeScript (backend + frontend)                                     |
| `node ace test`          | Tests (Japa)                                                                     |
| `node ace build`         | Build de production dans `build/`                                                |
| `node ace codegen`       | Régénère les types partagés (`.adonisjs/`)                                       |
| `node ace migration:run` | Applique les migrations (le schéma TypeScript `database/schema.ts` est régénéré) |

## Organisation du code

```
app/
  controllers/      contrôleurs HTTP (auth, articles, forum, discussions, membres, admin…)
  models/           modèles Lucid (étendent les classes générées dans database/schema.ts)
  transformers/     sérialisation typée vers Inertia (types Data.* côté React)
  services/         markdown, slugs, réponses, OAuth GitHub…
  validators/       schémas VineJS (messages en français : start/validator.ts)
inertia/
  pages/            une page React par écran
  components/ui/    design system (boutons, champs, menus, éditeur Markdown…)
  css/app.css       tokens de design (clair / sombre) et utilitaires
start/routes/       routes par domaine (articles, forum, discussions, membres, admin)
deploy/             Caddyfile et script de déploiement
```

### Design

Direction artistique : _un journal technique imprimé de la scène JavaScript camerounaise_. Papier chaud et encre carbone, le jaune JavaScript comme unique signal (surligneur, survols, focus), filets fins, Bricolage Grotesque + JetBrains Mono, thèmes clair et sombre. Toutes les couleurs passent par les tokens de `inertia/css/app.css`.

## Déploiement

Le serveur exécute `docker-compose.yml` (application + PostgreSQL) ; Caddy, installé sur l’hôte, termine le TLS et relaie vers `127.0.0.1:3333` (`deploy/Caddyfile`).

- Chaque push sur la branche `staging` lance le workflow GitHub Actions _Staging_ : typecheck + build, puis déploiement par SSH. La clé utilisée est restreinte côté serveur à une seule commande (`deploy/deploy.sh`).
- Au démarrage, le conteneur applique les migrations et les seeders idempotents. Le contenu de démonstration (membres et publications fictifs) n’est inséré en production que si `SEED_DEMO=true`.
- Déploiement manuel sur le serveur : `./deploy/deploy.sh staging`.

## Contribuer

Les issues et pull requests sont les bienvenues. Ouvrez une issue pour discuter d’une fonctionnalité avant de vous lancer, gardez les PR ciblées, et vérifiez `npm run typecheck` et `node ace test` avant de pousser.

## Sécurité

Pour signaler une vulnérabilité, écrivez à [support@javascript.cm](mailto:support@javascript.cm) plutôt que d’ouvrir une issue publique.

## Licence

MIT. Inspiré par [Laravel Cameroun](https://laravel.cm).
