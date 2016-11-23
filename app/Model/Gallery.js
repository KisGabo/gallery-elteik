'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const ImgPersist = use('Gallery/ImagePersistence')

class Gallery extends Lucid {

  static boot() {
    super.boot()
    this.addHook('afterCreate', 'create-folder', this._hookAfterCreate)
    this.addHook('beforeDelete', 'delete-related', this._hookBeforeDelete)
  }

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

  static * _hookAfterCreate(next) {
    yield ImgPersist.createGalleryFolder(this)
    yield next
  }

  static * _hookBeforeDelete(next) {
    yield this.relatedNotLoaded('images').load()
    const imgIds = []
    this.relations['images'].forEach(img => imgIds.push(img.id))

    yield Db.table('images')
      .where('gallery_id', this.id)
      .delete()
    yield Db.table('p_image_keywords')
      .whereIn('image_id', imgIds)
      .delete()
    yield Db.table('p_likes')
      .whereIn('image_id', imgIds)
      .delete()

    yield ImgPersist.deleteGallery(this)

    yield next
  }

}

module.exports = Gallery
