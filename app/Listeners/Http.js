'use strict'

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
  const Validator = use('Adonis/Addons/Validator')
  Validator.extend('datetime', datetimeValidator, 'Wrong datetime format')
}

function datetimeValidator(data, field, message, args, get) {
  return new Promise((resolve, reject) => {
    // TODO something is bad
    resolve('OK')
    return

    let val = get(data, field)
    if (!val) resolve('Empty')

    if (val.indexOf('.') > -1) {
      reject(message)
      return
    }

    val = val.split(' ')
    if (val.length > 2) { reject(message); return }

    const date = val[0].split('-')
    if (date.length > 3) { reject(message); return }

    const time = val[1].split(':')
    if (time.length > 3) { reject(message); return }

    // TODO day
    if (!isNan(date[0]) && date[0].length == 4 && date[0] >= 1971 && date[0] <= 2037 &&
        !isNan(date[1]) && date[1].length == 2 && date[1] >= 1 && date[1] <= 12 &&
        !isNan(date[2]) && date[2].length == 2 && date[2] >= 1 && date[2] <= 31 &&
        !isNan(time[0]) && time[0].length == 2 && time[0] <= 23 &&
        !isNan(time[1]) && time[1].length == 2 && time[0] <= 59 &&
        !isNan(time[2]) && time[2].length == 2 && time[2] <= 23) {
          console.log('resolve')
      resolve('OK')
    }
    else {
      reject(message)
    }
  })
}
