'use strict'

/**
 * This controller handles ajax requests, prefixed with /ajax.
 */

class AjaxController {

  /**
   * Checks if user with given name or e-mail exists.
   * 
   * As required by Bootstrap validator:
   * GET param: username or email
   * Status 400 if exists, else 200
   */
  * checkUserExists(req, resp) {
    const User = use('App/Model/User')

    let user;
    if (req.input('username')) {
      user = yield User.findBy('username', req.input('username'))
    }
    else {
      user = yield User.findBy('email', req.input('email'))
    }

    if (user) {
      resp.status(400).send('exists')
    }
    else {
      resp.send('ok')
    }
  }

}

module.exports = AjaxController