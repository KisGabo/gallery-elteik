'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const AdonisHelpers = use('Helpers')

class Gallery extends Lucid {

  static get traits () {
    return [ 'Gallery/Traits/WithKeywords' ]
  }

  static get validationRules() {
    return {
      name:      'required|max:254',
      date_from: 'datetime',
      date_to:   'datetime',
      about:     'max:1024',
    }
  }

  static scopePublic(q) {
    q.where('public', true)
  }

  user() {
    return this.belongsTo('App/Model/User')
  }

  images() {
    return this.hasMany('App/Model/Image')
  }

  keywords() {
    return this.belongsToMany('App/Model/Keyword', 'p_gallery_keywords')
  }

  getFolder() {
    return AdonisHelpers.storagePath(`gallery/${this.user_id}/${this.id}`)
  }

}

module.exports = Gallery
