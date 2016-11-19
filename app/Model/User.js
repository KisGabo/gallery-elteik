'use strict'

const Lucid = use('Lucid')

class User extends Lucid {

  static get validationRules() {
    return {
      username: 'required|alpha_numeric|unique:users|min:2|max:80',
      email: 'required|email|unique:users|max:254',
      password: 'required',
      password_confirm: 'required|same:password',
      intro: 'max:1024',
    }
  }

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
