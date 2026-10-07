import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default configApp(...react, {
  files: ['inertia/**/*.{ts,tsx}'],
  rules: {
    // Links use plain paths ("/articles/slug"), not Tuyau route names.
    '@adonisjs/prefer-adonisjs-inertia-link': 'off',
    // React components and pages use kebab-case file names.
    '@unicorn/filename-case': 'off',
    // Inertia's <Head> deduplicates tags through the "head-key" attribute.
    'react/no-unknown-property': ['error', { ignore: ['head-key'] }],
  },
})
