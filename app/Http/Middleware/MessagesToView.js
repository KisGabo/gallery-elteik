'use strict'

/**
 * This global middleware adds a 'messages' array
 * to the response object. This is passed to the
 * View as a global. Messages which are intended to
 * be displayed to the user should go here.
 * 
 * It automatically adds flashed messages too.
 * 
 * Structure of a message object:
 * {
 *   type: 'success | warning | danger',
 *   message: <message text>
 * }
 */

const View = use('Adonis/Src/View')

class MessagesToView {

  * handle (req, resp, next) {
    if (req.old('messages')) {
      resp.messages = req.old('messages')
    }
    else {
      resp.messages = []
    }

    View.global('messages', resp.messages)

    yield next
  }

}

module.exports = MessagesToView