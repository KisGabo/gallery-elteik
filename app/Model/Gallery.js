'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const ImgPersist = use('Gallery/ImagePersistence')

class Gallery extends Lucid {

  static boot() {
    super.boot()
    this.addHook('afterCreate', 'create-folder', this._hookAfterCreate)
    this.addHook('beforeUpdate', 'set-image-visibility', this._hookBeforeUpdate)
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

  static scopeByKeywords(q, names) {
    q.where(Image._filterByKeywords(names, 'p_gallery_keywords', 'gallery_id'))
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

  getPublic(val) {
    return (val ? true : false)
  }

  setPublic(val) {
    return (val ? 1 : 0)
  }

  static * _hookAfterCreate(next) {
    yield ImgPersist.createGalleryFolder(this)
    yield next
  }

  static * _hookBeforeUpdate(next) {
    if ((typeof this.$dirty.public) !== 'undefined') {
      if (this.public) {console.log('public')
        yield Db.table('images')
          .where({ gallery_id: this.id, force_private: false })
          .update('public', true)
      }
      else {
        yield Db.table('images')
          .where({ gallery_id: this.id })
          .update('public', false)
      }
    }
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
