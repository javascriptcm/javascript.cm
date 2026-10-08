import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Channel from '#models/channel'
import Tag from '#models/tag'

/**
 * Structural data required in every environment: forum channels and tags.
 * Idempotent (safe to run on every deploy).
 */
export default class BaseDataSeeder extends BaseSeeder {
  static environment = ['development', 'production', 'test']

  async run() {
    await Channel.updateOrCreateMany('slug', [
      {
        position: 1,
        slug: 'javascript',
        name: 'JavaScript',
        description: 'Le langage lui-même : syntaxe, asynchrone, DOM, ES2025 et au-delà.',
      },
      {
        position: 2,
        slug: 'typescript',
        name: 'TypeScript',
        description: 'Typage, génériques, configuration du compilateur, migration depuis JS.',
      },
      {
        position: 3,
        slug: 'react',
        name: 'React & Next.js',
        description: 'Composants, hooks, état, rendu serveur, Next.js et Remix.',
      },
      {
        position: 4,
        slug: 'vue',
        name: 'Vue & Nuxt',
        description: 'Vue 3, Composition API, Pinia, Nuxt.',
      },
      {
        position: 5,
        slug: 'angular',
        name: 'Angular',
        description: 'Composants, signals, RxJS, architecture des applications Angular.',
      },
      {
        position: 6,
        slug: 'backend',
        name: 'Node.js & Backend',
        description: 'Node, Bun, Deno, AdonisJS, NestJS, Express, bases de données et API.',
      },
      {
        position: 7,
        slug: 'mobile',
        name: 'Mobile',
        description: 'React Native, Expo, Ionic, PWA et intégrations mobile money.',
      },
      {
        position: 8,
        slug: 'outils',
        name: 'Outils & DevOps',
        description: 'Vite, tests, CI/CD, Docker, déploiement, hébergement.',
      },
      {
        position: 9,
        slug: 'debutants',
        name: 'Débutants',
        description: 'Premiers pas, ressources pour apprendre, questions sans honte.',
      },
    ])

    const tags: [string, string][] = [
      ['javascript', 'JavaScript'],
      ['typescript', 'TypeScript'],
      ['react', 'React'],
      ['nextjs', 'Next.js'],
      ['vue', 'Vue'],
      ['angular', 'Angular'],
      ['svelte', 'Svelte'],
      ['nodejs', 'Node.js'],
      ['adonisjs', 'AdonisJS'],
      ['nestjs', 'NestJS'],
      ['bun', 'Bun'],
      ['react-native', 'React Native'],
      ['tailwindcss', 'Tailwind CSS'],
      ['tests', 'Tests'],
      ['performance', 'Performance'],
      ['securite', 'Sécurité'],
      ['devops', 'DevOps'],
      ['mobile-money', 'Mobile Money'],
      ['ia', 'IA'],
      ['carriere', 'Carrière'],
      ['freelance', 'Freelance'],
      ['evenements', 'Événements'],
      ['open-source', 'Open source'],
      ['apprendre', 'Apprendre'],
    ]
    await Tag.updateOrCreateMany(
      'slug',
      tags.map(([slug, name]) => ({ slug, name }))
    )
  }
}
