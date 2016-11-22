'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const AdonisHelpers = use('Helpers')

class Gallery extends Lucid {

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

  * deleteWithPivots() {
    yield Db.table('p_gallery_keywords')
      .where('gallery_id', this.id)
      .delete()
    yield this.delete()
  }

  * syncKeywords(names) {
    // empty array causes an error in .sync()
    if (names.length == 0) {
      yield Db.table('p_gallery_keywords')
        .where('gallery_id', this.id)
        .delete()
    }
    else {
      const Keyword = use('App/Model/Keyword')
      const ids = yield Keyword.getIds(names)
      yield this.keywords().sync(ids)
    }
  }

}

module.exports = Gallery
