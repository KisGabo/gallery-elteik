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

  likes() {
    return this.belongsToMany('App/Model/Image', 'p_likes')
  }

}

module.exports = User
