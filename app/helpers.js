'use strict'

/**
 * This file contains various small helper functions
 * to make my life easier.
 */

module.exports = {}

/**
 * Copies properties from source to dest.
 * 
 * @param {object} source To copy from
 * @param {object} dest To copy to
 * 
 * @static
 */
module.exports.copyInto = function(source, dest) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      dest[key] = source[key]
    }
  }
}

/**
 * Splits string by commas removing leading and trailing
 * whitespaces from every piece, and drops empty strings.
 * 
 * @param {string} string
 * @return {array} Pieces
 * 
 * @static
 */
module.exports.splitByComma = function(string) {
  return string.split(',')
    .map(str => str.trim())
    .filter(str => str.length > 0)
}

/**
 * Modifies the messages array returned by Indicative,
 * to satisfy our needs.
 * 
 * @param {array} messages Messages array from Indicative
 * @return {array} Modified array of messages:
 *   {
 *     message: <message text>,
 *     type: 'success' | 'warning' | 'danger'
 *   }
 */
module.exports.cleanValidationMessages = function(messages) {
  messages.forEach(msg => {
    delete msg.field, msg.validation
    msg.type = 'danger'
  })
}


/**
 * Makes unix timestamp from a datetime string.
 * String format: YYYY.MM.DD. HH:mm:ss
 * 
 * @param {string} string Datetime string
 * @return {integer} Unix timestamp
 */
module.exports.toTs = function(string) {
  if (!string) return null
  const moment = require('moment')
  return moment(string, 'YYYY.MM.DD. HH:mm:ss').unix()
}