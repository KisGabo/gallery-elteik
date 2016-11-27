'use strict'

const Lucid = use('Lucid')
const Hash = use('Hash')
const ImgPersist = use('Gallery/ImagePersistence')

class User extends Lucid {

  /**
   * Adds database hooks.
   * This gets called by Adonis when starting the app.
   * 
   * @static
   */
  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'hash-password', this._hookBeforeWrite)
    this.addHook('beforeUpdate', 'hash-password', this._hookBeforeWrite)
    this.addHook('afterCreate', 'create-folder', this._hookAfterCreate)
  }

  /**
   * Tells Adonis to store auto-managed dates as unix timestamps.
   * 
   * @return {string}
   * 
   * @property
   * @static
   */
  static get dateFormat () {
    return 'X'
  }

  /**
   * Registration form validation rules for Indicative.
   * 
   * @return {object}
   * 
   * @property
   * @static
   */
  static get validationRules() {
    return {
      username: 'required|alpha_numeric|unique:users|min:2|max:80',
      email:    'required|email|unique:users|max:254',
      password: 'required',
      password_confirm: 'required|same:password',
      intro:    'max:1024',
    }
  }

  /**
   * Settings form validation rules for Indicative.
   * 
   * @return {object}
   * 
   * @property
   * @static
   */
  static get settingsRules() {
    return {
      intro:    User.validationRules.intro,
      password: 'required_if:password_confirm',
      password_confirm: 'required_if:password|same:password',
    }
  }

  /**
   * Relation of galleries this user has created.
   * 
   * @return {Relation}
   */
  galleries() {
    return this.hasMany('App/Model/Gallery')
  }

  /**
   * Relation of images this user has uploaded.
   * 
   * @return {Relation}
   */
  images() {
    return this.hasManyThrough('App/Model/Image', 'App/Model/Gallery')
  }

  /**
   * Relation of images this user has liked.
   * 
   * @return {Relation}
   */
  likes() {
    return this.belongsToMany('App/Model/Image', 'p_likes')
  }

  /**
   * Adonis hook to hash password (if new or changed).
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookBeforeWrite(next) {
    if (this.isNew() || this.$dirty.password) {
      this.password = yield Hash.make(this.password)
    }
    yield next
  }

  /**
   * Adonis hook to create user's directory
   * after registration.
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookAfterCreate(next) {
    yield ImgPersist.createUserFolder(this)
    yield next
  }

}

module.exports = User
