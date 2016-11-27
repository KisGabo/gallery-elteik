'use strict'

const Db = use('Database')
const Lucid = use('Lucid')
const AdonisHelpers = use('Helpers')
const ImgPersist = use('Gallery/ImagePersistence')

class Image extends Lucid {

  /**
   * Adds database hooks.
   * This gets called by Adonis when starting the app.
   * 
   * @static
   */
  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'set-public', this._hookBeforeCreate)
    this.addHook('beforeUpdate', 'update-public', this._hookBeforeUpdate)
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
      title:     'max:254',
      date_taken:'datetime',
      about:     'max:1024',
      keywords:  'max:1024',
    }
  }

  /**
   * Adonis scope to query only public images.
   * 
   * @param {any} q Query builder
   * 
   * @static
   */
  static scopePublic(q) {
    q.where('public', true)
  }

  /**
   * Adonis scope to query images having at least
   * one of given keywords.
   * 
   * @param {any} q Query builder
   * @param {array} names Array of keyword names
   * 
   * @static
   */
  static scopeByKeywords(q, names) {
    q.where(Image._filterByKeywords(names, 'p_image_keywords', 'image_id'))
  }

  /**
   * Adonis scope to query images which satisfy given filters.
   * Orderby column can be: id, date_taken, view_count, like_count
   * 
   * @param {any} q Query builder
   * @param {object} filters
   *   Filters in this format:
   *   {
   *     keywords: [ ... ],
   *     date: <timestamp>,
   *     dateMode: 'exact | older | newer',
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

  /**
   * [NOT IMPLEMENTED] Relation of owner of image.
   * 
   * @return {Relation}
   * 
   * @todo
   */
  user() {
    // no hasOneThrough relationship in Lucid
    throw 'Not implemented: please query user through gallery';
  }

  /**
   * Relation of gallery the image belongs to.
   * 
   * @return {Relation}
   */
  gallery() {
    return this.belongsTo('App/Model/Gallery')
  }

  /**
   * Relation of users who liked the image.
   * 
   * @return {Relation}
   */
  likes() {
    return this.belongsToMany('App/Model/User', 'p_likes')
  }

  /**
   * Relation of keywords added to gallery.
   * 
   * @return {Relation}
   */
  keywords() {
    return this.belongsToMany('App/Model/Keyword', 'p_image_keywords')
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
   * Doesn't set to true if force_private.
   * 
   * @param {boolean}
   * @return {integer}
   */
  setPublic(val) {
    return (val && !this.force_private ? 1 : 0)
  }

  /**
   * Adonis getter of 'force_private' attribute.
   * Converts internal 1/0 to true/false.
   * 
   * @param {integer}
   * @return {boolean}
   */
  getForcePrivate(val) {
    return (val ? true : false)
  }

  /**
   * Adonis setter of 'force_private' attribute.
   * Sets visibility to private, but it doesn't work.
   * Converts true/false to 1/0.
   * 
   * @param {boolean}
   * @return {integer}
   * 
   * @todo
   */
  setForcePrivate(val) {
    if (val) {

      /**
       * This is not working :O
       * .public is read as false after this, as expected,
       * but .save() does not save the new value!
       * A hook is used as a workaround.
       */

      this.public = false
    }
    return val
  }


  /**
   * Returns the ID of next image in the gallery.
   * Used when generating 'Next image' button on image page.
   * 
   * @return {integer} Null if no more images
   */
  * getNextIdInGallery() {
    const next = yield Image.query()
      .select('id')
      .where('id', '>', this.id)
      .where('gallery_id', this.gallery_id)
      .orderBy('id', 'asc')
      .first()
    return (next ? next.id : null)
  }

  /**
   * Adonis hook to set image visibility
   * according to its gallery's visiblity,
   * if not set explicitly.
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookBeforeCreate(next) {
    if ((typeof this.public) === 'undefined') {
      yield this.relatedNotLoaded('gallery').load()
      this.public = this.relations['gallery'].public
    }
    yield next
  }

  /**
   * Adonis hook to make sure .public is false
   * if image is forced to be private.
   * 
   * This is needed because setter is not working.
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookBeforeUpdate(next) {
    if (this.force_private) {
      this.public = false
    }
    yield next
  }

  /**
   * Adonis hook to delete related rows from database,
   * and delete images files.
   * (tables: p_image_keywords, p_likes)
   * 
   * @param {any} next
   * 
   * @static
   * @private
   */
  static * _hookBeforeDelete(next) {
    yield Db.table('p_image_keywords')
      .where('image_id', this.id)
      .delete()    
    yield Db.table('p_likes')
      .where('image_id', this.id)
      .delete()

    yield this.relatedNotLoaded('gallery').load()
    yield ImgPersist.deleteImageFiles(this)

    yield next
  }

}

module.exports = Image