'use strict'

/**
 * This middleware denies access if user is not admin.
 */

const View = use('Adonis/Src/View')

class AuthAdmin {

  * handle (req, resp, next) {
    if (req.currentUser.role < 1) {
      resp.unauthorized('Ehhez nincs jogosultságod.')
    }
    else {
      yield next
    }
  }

}

module.exports = AuthAdmin