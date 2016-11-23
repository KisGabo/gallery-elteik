'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const AdonisHelpers = use('Helpers')
const ImgPersist = use('Gallery/ImagePersistence')

class Image extends Lucid {

  static boot() {
    super.boot()
    this.addHook('beforeDelete', 'delete-related', this._hookBeforeDelete)
  }

  static get traits () {
    return [ 'Gallery/Traits/WithKeywords' ]
  }

  static get validationRules() {
    return {
      title:     'max:254',
      date_taken:'datetime',
      about:     'max:1024',
    }
  }

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

  * getNextIdInGallery() {
    const next = yield Image.query()
      .select('id')
      .where('id', '>', this.id)
      .where('gallery_id', this.gallery_id)
      .orderBy('id', 'asc')
      .first()
    return (next ? next.id : null)
  }

  static * _hookBeforeDelete(next) {
    yield Db.table('p_likes')
      .where('image_id', this.id)
      .delete()

    yield this.relatedNotLoaded('gallery').load()
    yield ImgPersist.deleteImageFiles(this)

    yield next
  }

}

module.exports = Image