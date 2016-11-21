'use strict'

const Lucid = use('Lucid')

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

  * syncKeywords(names) {
    // empty array causes an error in .sync()
    if (names.length == 0) {
      const Db = use('Database')
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
