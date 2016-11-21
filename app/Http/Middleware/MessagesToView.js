'use strict'

const View = use('Adonis/Src/View')

class MessagesToView {

  * handle (req, resp, next) {
    if (req.old('messages')) {
      req.messages = req.old('messages')
    }
    else {
      req.messages = []
    }

    View.global('messages', req.messages)

    yield next
  }

}

module.exports = MessagesToView