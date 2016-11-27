'use strict'

/**
 * This file is for the HTTP listener,
 * and HTTP specific app-level stuff.
 */

const Env = use('Env')
const Ouch = use('youch')
const Http = exports = module.exports = {}

/**
 * handle errors occured during a Http request.
 *
 * @param  {Object} error
 * @param  {Object} request
 * @param  {Object} response
 */
Http.handleError = function * (error, request, response) {
  /**
   * DEVELOPMENT REPORTER
   */
  if (Env.get('NODE_ENV') === 'development') {
    const ouch = new Ouch().pushHandler(
      new Ouch.handlers.PrettyPageHandler('blue', null, 'sublime')
    )
    ouch.handleException(error, request.request, response.response, (output) => {
      console.error(error.stack)
    })
    return
  }

  /**
   * PRODUCTION REPORTER
   */
  const status = error.status || 500
  console.error(error.stack)
  yield response.status(status).sendView('errors/index', {error})
}

/**
 * listener for Http.start event, emitted after
 * starting http server.
 */
Http.onStart = function () {

  // custom app-level stuff

  const custom = require('../../bootstrap/custom.js')
  custom.boot()

  // HTTP specific app-level stuff

  const Request = use('Adonis/Src/Request')

  /**
   * Checks if given model belongs to current user.
   * 
   * @param {Model} item The item to check
   * @return {boolean}
   */
  Request.macro('checkOwn', function (item) {
    return this.currentUser && item.user_id == this.currentUser.id
  })
}
