'use strict'

module.exports = {}

module.exports.checkOwn = function(item, req) {
  return req.currentUser && item.user_id == req.currentUser.id
}

module.exports.cleanValidationMessages = function(messages) {
  messages.forEach(msg => {
    delete msg.field, msg.validation
    msg.type = 'danger'
  })
}