'use strict'

module.exports = {}

module.exports.copyInto = function(source, dest) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      dest[key] = source[key]
    }
  }
}

module.exports.checkOwn = function(item, req) {
  return req.currentUser && item.user_id == req.currentUser.id
}

module.exports.cleanValidationMessages = function(messages) {
  messages.forEach(msg => {
    delete msg.field, msg.validation
    msg.type = 'danger'
  })
}

module.exports.toTs = function(string) {
  if (!string) return null
  const moment = require('moment')
  return moment(string, 'YYYY.MM.DD. HH:mm:ss').unix()
}