'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const ImgPersist = use('Gallery/ImagePersistence')
const Keyword = use('App/Model/Keyword')

class Gallery extends Lucid {

  /**
   * Adds database hooks.
   * This gets called by Adonis when starting the app.
   * 
   * @static
   */
  static boot() {
    super.boot()
    this.addHook('afterCreate', 'create-folder', this._hookAfterCreate)
    this.addHook('beforeUpdate', 'set-image-visibility', this._hookBeforeUpdate)
    this.addHook('beforeDelete', 'delete-related', this._hookBeforeDelete)
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
   * Tells Adonis which traits to use.
   * 
   * @return {array}
   * 
   * @property
   * @static
   */
  static get traits () {
    return [ 'Gallery/Traits/WithKeywords' ]
  }

  /**
   * Form validation rules for Indicative.
   * 
   * @return {object}
   * 
   * @property
   * @static
   */
  static get validationRules() {
    return {
      name:      'required|max:254',
      date_from: 'datetime',
      date_to:   'datetime',
      about:     'max:1024',
      keywords:  'max:1024',
    }
  }

  /**
   * Adonis scope to query only public galleries.
   * 
   * @param {any} q Query builder
   * 
   * @static
   */
  static scopePublic(q) {
    q.where('public', true)
  }

  /**
   * Adonis scope to query galleries having at least
   * one of given keywords.
   * 
   * @param {any} q Query builder
   * @param {array} names Array of keyword names
   * 
   * @static
   */
  static scopeByKeywords(q, names) {
    q.where(Gallery._filterByKeywords(names, 'p_gallery_keywords', 'gallery_id'))
  }

  /**
   * Adonis scope to query galleries which satisfy given filters.
   * Orderby column can be: id, name, updated_at
   * 
   * @param {any} q Query builder
   * @param {object} filters
   *   Filters in this format:
   *   {
   *     name: <name filter>,
   *     keywords: [ ... ],
   *     order: {
   *       col: <attribute to order by>,
   *       dir: 'asc | desc'
   *     }
   *   }
   * 
   * @static
   */
  static scopeFiltered(q, filters) {

     // keywords

    if (filters.keywords) {
      Gallery.scopeByKeywords(q, filters.keywords)
    }

    // name

    if (filters.name) {
      q.where('name', 'LIKE', '%' + filters.name + '%')
    }

    // order by

    if (filters.order) {
      const fields = [ 'updated_at', 'id', 'name' ]
      if (fields.indexOf(filters.order.col) > -1) {
        q.orderBy(filters.order.col, filters.order.dir)
      }
    }
  }

  /**
   * Relation of owner of gallery.
   * 
   * @return {Relation}
   */
  user() {
    return this.belongsTo('App/Model/User')
  }

  /**
   * Relation of images added to gallery.
   * 
   * @return {Relation}
   */
  images() {
    return this.hasMany('App/Model/Image')
  }

  /**
   * Relation of keywords.
   * 
   * @return {Relation}
   */
  keywords() {
    return this.belongsToMany('App/Model/Keyword', 'p_gallery_keywords')
  }

  /**
   * Adonis getter of 'public' attribute.
   * Converts internal 1/0 to true/false.
   * 
   * @param {integer}
   * @return {boolean}
   */
  getPublic(val) {
    return (val ? true : false)
  }

  /**
   * Adonis setter of 'public' attribute.
   * Converts true/false to 1/0.
   * 
   * @param {boolean}
   * @return {integer}
   */
  setPublic(val) {
    return (val ? 1 : 0)
  }

  /**
   * Returns all keywords which are related
   * to this gallery or its images.
   * 
   * @return {Collection} Keyword model collection
   */
  * getRelatedKeywords() {
    yield this.relatedNotLoaded('images').load()
    const imgIds = []
    const galId = this.id
    this.relations['images'].forEach(img => imgIds.push(img.id))

    const keywordIdsQuery = Db.table('p_image_keywords')
      .whereIn('image_id', imgIds)
      .select('keyword_id')
      .union(function() {
        this.table('p_gallery_keywords')
          .where('gallery_id', galId)
          .select('keyword_id')
      })

    return yield Keyword.query().whereIn('id', keywordIdsQuery).fetch()
  }

  /**
   * Adonis hook to make gallery folder after
   * inserting a new gallery into db.
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookAfterCreate(next) {
    yield ImgPersist.createGalleryFolder(this)
    yield next
  }

  /**
   * Adonis hook to set images' visibility if gallery
   * visibility changes.
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookBeforeUpdate(next) {
    if ((typeof this.$dirty.public) !== 'undefined') {
      if (this.public) {
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

  /**
   * Adonis hook to delete related rows from database,
   * and delete gallery folder.
   * (tables: images, p_gallery_keyowrds, p_image_keywords, p_likes)
   * 
   * @param {next}
   * 
   * @static
   * @private
   */
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
    yield Db.table('p_gallery_keywords')
      .whereIn('gallery_id', this.id)
      .delete()
    yield Db.table('p_likes')
      .whereIn('image_id', imgIds)
      .delete()

    yield ImgPersist.deleteGallery(this)

    yield next
  }

}

module.exports = Gallery
