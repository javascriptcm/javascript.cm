import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more.
   */
  csp: {
    /**
     * Enabled in production only: Vite's dev server relies on inline scripts.
     */
    enabled: app.inProduction,
    directives: {
      defaultSrc: [`'self'`],
      scriptSrc: [`'self'`, '@nonce'],
      // Shiki (code highlighting) and a few components use inline styles.
      styleSrc: [`'self'`, `'unsafe-inline'`],
      // Avatars and article covers may be hosted anywhere over HTTPS.
      imgSrc: [`'self'`, 'data:', 'https:'],
      fontSrc: [`'self'`, 'data:'],
      connectSrc: [`'self'`],
      objectSrc: [`'none'`],
      baseUri: [`'self'`],
      formAction: [`'self'`],
      frameAncestors: [`'none'`],
    },
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more.
   */
  csrf: {
    /**
     * Enable CSRF token verification for state-changing requests.
     */
    enabled: true,

    /**
     * Route patterns to exclude from CSRF checks.
     * Useful for external webhooks or API endpoints.
     *
     * "Sign in with Apple" posts its result cross-site from appleid.apple.com
     * (response_mode=form_post): no CSRF token can be present. The callback
     * is protected by the OAuth state stored in an encrypted cookie.
     */
    exceptRoutes: ['/auth/apple/callback'],

    /**
     * Expose an encrypted XSRF-TOKEN cookie for frontend HTTP clients.
     */
    enableXsrfCookie: true,

    /**
     * HTTP methods protected by CSRF validation.
     */
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iframes.
   */
  xFrame: {
    /**
     * Enable the X-Frame-Options header.
     */
    enabled: true,

    /**
     * Block all framing attempts. Default value is DENY.
     */
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS.
   */
  hsts: {
    /**
     * Enable the Strict-Transport-Security header.
     */
    enabled: true,

    /**
     * HSTS policy duration remembered by browsers.
     */
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing content types and rely only
   * on the response content-type header.
   */
  contentTypeSniffing: {
    /**
     * Enable X-Content-Type-Options: nosniff.
     */
    enabled: true,
  },
})

export default shieldConfig
