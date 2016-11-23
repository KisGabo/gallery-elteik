'use strict'

const Lucid = use('Lucid')
const ImgPersist = use('Gallery/ImagePersistence')

class User extends Lucid {

  static boot() {
    super.boot()
    this.addHook('afterCreate', 'create-folder', this._hookAfterCreate)
  }

  static get validationRules() {
    return {
      username: 'required|alpha_numeric|unique:users|min:2|max:80',
      email:    'required|email|unique:users|max:254',
      password: 'required',
      password_confirm: 'required|same:password',
      intro:    'max:1024',
    }
  }
  
  static get settingsRules() {
    return {
      intro:    User.validationRules.intro,
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

  static * _hookAfterCreate(next) {
    yield ImgPersist.createUserFolder(this)
    yield next
  }

}

module.exports = User
