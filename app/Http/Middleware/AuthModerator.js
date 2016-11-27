'use strict'

/**
 * This middleware denies access if user is not moderator nor admin.
 */

const View = use('Adonis/Src/View')

class AuthModerator {

  * handle (req, resp, next) {
    if (req.currentUser.role < 1) {
      resp.unauthorized('Ehhez nincs jogosultságod.')
    }
    else {
      yield next
    }
  }

}

module.exports = AuthModerator