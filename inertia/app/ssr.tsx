import { client } from '~/client'
import ReactDOMServer from 'react-dom/server'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePage, pageTitle } from './resolve_page'

export default function render(rawPage: any) {
  /**
   * The server hands the page object over without a JSON round-trip, so
   * rich values (Luxon DateTime…) would reach React as objects. Serialize it
   * like the client receives it: ISO strings, toJSON() applied everywhere.
   */
  const page = JSON.parse(JSON.stringify(rawPage))

  return createInertiaApp({
    page,
    title: pageTitle,
    render: ReactDOMServer.renderToString,
    resolve: (name) => resolvePage(name, import.meta.glob('../pages/**/*.tsx', { eager: true })),
    setup: ({ App, props }) => {
      return (
        <TuyauProvider client={client}>
          <App {...props} />
        </TuyauProvider>
      )
    },
  })
}
