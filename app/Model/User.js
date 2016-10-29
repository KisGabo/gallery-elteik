'use strict'

const Lucid = use('Lucid')

class User extends Lucid {

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  galleries() {
    return this.hasMany('App/Model/Gallery')
  }

  images() {
    return this.hasManyThrough('App/Model/Image', 'App/Model/Gallery')
  }

}

module.exports = User
