import '../css/app.css'
import { client } from '../client'
import { hydrateRoot } from 'react-dom/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePage, pageTitle } from './resolve_page'

createInertiaApp({
  title: pageTitle,
  resolve: (name) => resolvePage(name, import.meta.glob('../pages/**/*.tsx')),
  setup({ el, App, props }) {
    hydrateRoot(
      el,
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
  },
  progress: {
    color: '#F7DF1E',
    showSpinner: false,
  },
})
