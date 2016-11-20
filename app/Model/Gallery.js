'use strict'

const Lucid = use('Lucid')

class Gallery extends Lucid {

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

}

module.exports = Gallery
