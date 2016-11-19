'use strict'

const View = use('Adonis/Src/View')

let _messages = []

class MessagesToView {

  * handle (req, resp, next) {
    if (req.old('messages')) {
      _messages = req.old('messages')
    }

    View.global('messages', _messages)

    resp.addMessage = this.addMessage;
    yield next
  }

  addMessage(type, message) {
    _messages.push({ type, message })
  }

}

module.exports = MessagesToView