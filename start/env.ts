/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Database
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_DEBUG: Env.schema.boolean.optional(),

  // Rate limiting
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),

  // Seed fictional demo content (members, articles, threads) when "true"
  SEED_DEMO: Env.schema.boolean.optional(),

  // Social sign-in (all optional). A provider is enabled only when all its
  // variables are set; otherwise its button is hidden and its routes 404.
  // Callback URLs: ${APP_URL}/auth/<github|google|apple>/callback

  // Cloudflare Turnstile (anti-bot on sign-up; disabled when unset)
  TURNSTILE_SITE_KEY: Env.schema.string.optional(),
  TURNSTILE_SECRET_KEY: Env.schema.string.optional(),

  // GitHub OAuth app
  GITHUB_CLIENT_ID: Env.schema.string.optional(),
  GITHUB_CLIENT_SECRET: Env.schema.string.optional(),

  // Google (OpenID Connect, "Web application" OAuth client)
  GOOGLE_CLIENT_ID: Env.schema.string.optional(),
  GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),

  // Sign in with Apple: Services ID, Team ID, Key ID and the .p8 key (PEM,
  // escaped "\n" accepted)
  APPLE_CLIENT_ID: Env.schema.string.optional(),
  APPLE_TEAM_ID: Env.schema.string.optional(),
  APPLE_KEY_ID: Env.schema.string.optional(),
  APPLE_PRIVATE_KEY: Env.schema.string.optional(),
})
