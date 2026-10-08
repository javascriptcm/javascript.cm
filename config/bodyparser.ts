import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  /**
   * Parse request bodies for these HTTP methods.
   * Keep this aligned with methods that receive payloads in your routes.
   */
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Config for the "application/x-www-form-urlencoded"
   * content-type parser.
   */
  form: {
    /**
     * Normalize empty string values to null.
     */
    convertEmptyStringsToNull: true,

    /**
     * Content types handled by the form parser.
     */
    types: ['application/x-www-form-urlencoded'],
  },

  /**
   * Config for the JSON parser.
   */
  json: {
    /**
     * Normalize empty string values to null.
     */
    convertEmptyStringsToNull: true,

    /**
     * Content types handled by the JSON parser.
     */
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  /**
   * Config for the "multipart/form-data" content-type parser.
   * File uploads are handled by the multipart parser.
   */
  multipart: {
    /**
     * Never write multipart bodies to disk automatically: the bodyparser
     * runs before the session, CSRF and auth middleware, so anonymous
     * requests could fill the temporary directory (files never cleaned up).
     *
     * The only upload of the site, the CV ("POST /settings/cv"), streams its
     * body itself inside CvController.store, i.e. after auth, CSRF and
     * throttling, and deletes its temporary files when done. Every other
     * route ignores multipart bodies (no fields, no files).
     */
    autoProcess: false,

    /**
     * Normalize empty string values to null.
     */
    convertEmptyStringsToNull: true,

    /**
     * Routes where multipart processing is handled manually (kept in sync
     * so that the CV route stays manual even if autoProcess is enabled).
     */
    processManually: ['/settings/cv'],

    /**
     * Maximum accepted payload size for multipart requests: a 5 MB PDF plus
     * the multipart envelope (Caddy allows 6 MB on /settings/cv only).
     */
    limit: '6mb',

    /**
     * Content types handled by the multipart parser.
     */
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
