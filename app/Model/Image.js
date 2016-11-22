'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const AdonisHelpers = use('Helpers')

class Image extends Lucid {

  static * setVisibilityByGallery(gallery_id, isPublic) {
    if (isPublic) {
      yield Db.table('images')
        .where({ gallery_id, force_private: false })
        .update('public', true)
    }
    else {
      yield Db.table('images')
        .where({ gallery_id })
        .update('public', false)
    }
  }

  static scopePublic(q) {
    q.where('public', true)
  }

  user() {
    // TODO no hasOneThrough relationship in Lucid
    throw 'Not implemented: please query user through gallery';
  }

  gallery() {
    return this.belongsTo('App/Model/Gallery')
  }

  likes() {
    return this.belongsToMany('App/Model/User', 'p_likes')
  }

  keywords() {
    return this.belongsToMany('App/Model/Keyword', 'p_image_keywords')
  }

  getFile(which) {
    if (!which) which = 'original'
    if (which == 'original')
      return `${this.id}.jpg`
    else if (which == 'medium') {
      return `md${this.id}.jpg`}
    else
      return `th${this.id}.jpg`
  }

}

module.exports = Image