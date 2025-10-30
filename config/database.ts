import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USERNAME'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      pool: {
        min: 2, // Minimum de connexions actives
        max: 10, // Maximum de connexions simultanées
        acquireTimeoutMillis: 30000, // 30 secondes pour acquérir une connexion
        createTimeoutMillis: 30000, // 30 secondes pour créer une connexion
        idleTimeoutMillis: 30000, // 30 secondes avant de fermer une connexion inactive
        createRetryIntervalMillis: 200, // 200ms entre les tentatives de création
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig