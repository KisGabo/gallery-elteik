'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const AdonisHelpers = use('Helpers')
const ImgPersist = use('Gallery/ImagePersistence')

class Image extends Lucid {

  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'set-public', this._hookBeforeCreate)
    this.addHook('beforeUpdate', 'update-public', this._hookBeforeUpdate)
    this.addHook('beforeDelete', 'delete-related', this._hookBeforeDelete)
  }

  static get dateFormat () {
    return 'X'
  }

  static get traits () {
    return [ 'Gallery/Traits/WithKeywords' ]
  }

  static get validationRules() {
    return {
      title:     'max:254',
      date_taken:'datetime',
      about:     'max:1024',
      keywords:  'max:1024',
    }
  }

  static scopePublic(q) {
    q.where('public', true)
  }

  static scopeByKeywords(q, names) {
    q.where(Image._filterByKeywords(names, 'p_image_keywords', 'image_id'))
  }

  static scopeFiltered(q, filters) {

     // keywords

    if (filters.keywords) {
      Image.scopeByKeywords(q, filters.keywords)
    }

    // date

    if (filters.date) {
      if (filters.dateMode == 'exact') {
        q.whereBetween('date_taken', [ filters.date, filters.date + 24*3600 ])
      }
      else if (filters.dateMode == 'older') {
        q.where('date_taken', '<', filters.date)
      }
      else {
        q.where('date_taken', '>', filters.date)
      }
    }

    // order by

    if (filters.order) {
      const fields = [ 'date_taken', 'view_count', 'like_count', 'id' ]
      if (fields.indexOf(filters.order.col) > -1) {
        q.orderBy(filters.order.col, filters.order.dir)
      }
    }
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

  getPublic(val) {
    return (val ? true : false)
  }

  setPublic(val) {
    return (val ? 1 : 0)
  }

  getForcePrivate(val) {
    return (val ? true : false)
  }

  setForcePrivate(val) {
    if (val) {
      this.public = false
    }
    return val
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

  static * _hookBeforeCreate(next) {
    if ((typeof this.public) === 'undefined') {
      yield this.relatedNotLoaded('gallery').load()
      this.public = this.relations['gallery'].public
    }
    yield next
  }

  static * _hookBeforeUpdate(next) {
    // The setter is magically not working :O
    // However, .public remains false after setting it,
    // but .save() does not save the new value!
    if (this.force_private) {
      this.public = false
    }
    yield next
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