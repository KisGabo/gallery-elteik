'use strict'

module.exports = {}

module.exports.cleanValidationMessages = function(messages) {
  messages.forEach(msg => {
    delete msg.field, msg.validation
    msg.type = 'danger'
  })
}